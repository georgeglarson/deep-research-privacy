import { output } from '../output-manager.js';
import { getModelSpec, isValidModel } from './models.js';

export interface LLMConfig {
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  retry?: RetryConfig;
  enableWebSearch?: boolean;
  webSearchMode?: 'off' | 'on' | 'auto';
  enableWebCitations?: boolean;
}

export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  useExponentialBackoff: boolean;
}

export interface LLMResponse {
  content: string;
  model: string;
  timestamp: string;
  searchResults?: VeniceSearchResult[];
  citations?: string[];
  structuredOutput?: any;
}

export interface VeniceSearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface LLMMessage {
  role: 'system' | 'user';
  content: string;
}

interface RateLimitInfo {
  remaining: number;
  limit: number;
  resetIn: number;
}

const defaultRetryConfig: RetryConfig = {
  maxAttempts: 3,
  initialDelay: 1000,
  useExponentialBackoff: true,
};

const defaultConfig: Partial<LLMConfig> = {
  baseUrl: 'https://api.venice.ai/api/v1',
  retry: defaultRetryConfig,
  enableWebSearch: false,
  webSearchMode: 'auto',
  enableWebCitations: true,
};

export class LLMError extends Error {
  constructor(
    public code: string,
    message: string,
    public originalError?: unknown,
  ) {
    super(message);
    this.name = 'LLMError';
  }
}

function getRateLimitInfo(headers: Headers): RateLimitInfo | null {
  const remaining = headers.get('x-ratelimit-remaining');
  const limit = headers.get('x-ratelimit-limit');
  const resetIn = headers.get('x-ratelimit-reset');

  if (remaining && limit && resetIn) {
    return {
      remaining: parseInt(remaining, 10),
      limit: parseInt(limit, 10),
      resetIn: parseInt(resetIn, 10),
    };
  }

  return null;
}

function isRetryableError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status: number }).status;
    if (status === 429 || status >= 500) return true;
  }

  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code;
    if (code === 'ECONNRESET' || code === 'ETIMEDOUT') return true;
  }

  return false;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class LLMClient {
  private config: Required<LLMConfig>;
  private rateLimitInfo: RateLimitInfo | null = null;
  private modelValidated: boolean = false;

  constructor(config: LLMConfig = {}) {
    const apiKey = config.apiKey || process.env.VENICE_API_KEY;
    if (!apiKey) {
      throw new LLMError(
        'ConfigError',
        'API key is required. Provide it in constructor or set VENICE_API_KEY environment variable.',
      );
    }

    const model = config.model || process.env.VENICE_MODEL || 'llama-3.3-70b';

    this.config = {
      ...defaultConfig,
      ...config,
      apiKey,
      model,
    } as Required<LLMConfig>;
  }

  private async validateModel(): Promise<void> {
    if (this.modelValidated) return;

    const valid = await isValidModel(
      this.config.model,
      this.config.baseUrl,
      this.config.apiKey,
    );

    if (!valid) {
      throw new LLMError(
        'ConfigError',
        `Invalid model: ${this.config.model}. Use listAvailableModels() to see available models.`,
      );
    }

    this.modelValidated = true;
  }

  private getRateLimitDelay(): number {
    if (this.rateLimitInfo?.resetIn) {
      return this.rateLimitInfo.resetIn * 1000 + 100;
    }
    return this.config.retry.initialDelay;
  }

  async complete(params: {
    system: string;
    prompt: string;
    temperature?: number;
    maxTokens?: number;
    enableWebSearch?: boolean;
    webSearchMode?: 'off' | 'on' | 'auto';
    responseSchema?: object;
  }): Promise<LLMResponse> {
    await this.validateModel();

    const {
      system,
      prompt,
      temperature = 0.7,
      maxTokens = 1000,
      enableWebSearch,
      webSearchMode,
      responseSchema,
    } = params;
    const retryConfig = this.config.retry;
    let lastError: unknown;
    let delay = retryConfig.initialDelay;

    const modelSpec = await getModelSpec(
      this.config.model,
      this.config.baseUrl,
      this.config.apiKey,
    );
    const maxContextTokens = modelSpec.availableContextTokens;

    const useWebSearch = enableWebSearch ?? this.config.enableWebSearch;
    const searchMode = webSearchMode ?? this.config.webSearchMode;

    if (useWebSearch && !modelSpec.capabilities.supportsWebSearch) {
      output.log(
        `Warning: Model ${this.config.model} doesn't support web search. Disabling.`,
      );
    }

    if (responseSchema && !modelSpec.capabilities.supportsResponseSchema) {
      output.log(
        `Warning: Model ${this.config.model} doesn't support response schema. Falling back to text parsing.`,
      );
    }

    for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
      try {
        const response = await fetch(
          `${this.config.baseUrl}/chat/completions`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.config.apiKey}`,
            },
            body: JSON.stringify({
              model: this.config.model,
              messages: [
                { role: 'system', content: system },
                { role: 'user', content: prompt },
              ],
              temperature,
              max_tokens: Math.min(maxTokens, maxContextTokens),
              top_p: 0.95,
              ...(responseSchema &&
                modelSpec.capabilities.supportsResponseSchema && {
                  response_format: {
                    type: 'json_schema',
                    json_schema: {
                      name: 'research_output',
                      strict: true,
                      schema: responseSchema,
                    },
                  },
                }),
              venice_parameters: {
                enable_web_search:
                  useWebSearch && modelSpec.capabilities.supportsWebSearch
                    ? searchMode
                    : 'off',
                enable_web_citations: this.config.enableWebCitations,
              },
            }),
          },
        );

        this.rateLimitInfo = getRateLimitInfo(response.headers);

        if (!response.ok) {
          const error = await response
            .json()
            .catch(() => ({ error: response.statusText }));
          throw new LLMError(
            'APIError',
            `Venice API error: ${error.error || response.statusText}`,
            { status: response.status, error },
          );
        }

        const data = await response.json();

        if (!data.choices?.[0]?.message?.content) {
          throw new LLMError(
            'InvalidResponse',
            'Invalid response format from Venice API',
            data,
          );
        }

        const content = data.choices[0].message.content;
        const searchResults = this.extractSearchResults(data);
        const citations = this.extractCitations(content);
        let structuredOutput;

        if (responseSchema && modelSpec.capabilities.supportsResponseSchema) {
          try {
            structuredOutput = JSON.parse(content);
          } catch (error) {
            output.log('Failed to parse structured output:', error);
          }
        }

        return {
          content,
          model: this.config.model,
          timestamp: new Date().toISOString(),
          searchResults,
          citations,
          structuredOutput,
        };
      } catch (error: unknown) {
        lastError = error;

        if (!isRetryableError(error)) {
          throw error;
        }

        if (attempt === retryConfig.maxAttempts) {
          throw new LLMError(
            'MaxRetriesExceeded',
            `Failed after ${retryConfig.maxAttempts} attempts`,
            lastError,
          );
        }

        if (
          error &&
          typeof error === 'object' &&
          'status' in error &&
          (error as { status: number }).status === 429
        ) {
          delay = this.getRateLimitDelay();
          output.log(`Rate limit exceeded, waiting ${delay}ms before retry...`);
        } else if (retryConfig.useExponentialBackoff) {
          delay *= 2;
        }

        await sleep(delay);
      }
    }

    throw new LLMError(
      'UnknownError',
      'An unexpected error occurred',
      lastError,
    );
  }

  private extractSearchResults(data: any): VeniceSearchResult[] | undefined {
    if (!data.search_results || !Array.isArray(data.search_results)) {
      return undefined;
    }

    return data.search_results.map((result: any) => ({
      title: result.title || '',
      url: result.url || '',
      snippet: result.snippet || result.description || '',
    }));
  }

  private extractCitations(content: string): string[] | undefined {
    const citationRegex = /\[REF\](\d+)\[\/REF\]/g;
    const matches = content.match(citationRegex);

    if (!matches || matches.length === 0) {
      return undefined;
    }

    return [...new Set(matches)];
  }
}
