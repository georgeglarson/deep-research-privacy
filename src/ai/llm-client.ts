import { output } from '../output-manager.js';
import { isValidModel, VENICE_MODELS, VeniceModel } from './models.js';

export interface LLMConfig {
  apiKey?: string;
  model?: VeniceModel;
  baseUrl?: string;
  retry?: RetryConfig;
}

export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  useExponentialBackoff: boolean;
}

export interface LLMResponse {
  content: string;
  model: VeniceModel;
  timestamp: string;
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

  constructor(config: LLMConfig = {}) {
    const apiKey = config.apiKey || process.env.VENICE_API_KEY;
    if (!apiKey) {
      throw new LLMError(
        'ConfigError',
        'API key is required. Provide it in constructor or set VENICE_API_KEY environment variable.',
      );
    }

    const model = config.model || process.env.VENICE_MODEL || 'llama-3.3-70b';
    if (!isValidModel(model)) {
      throw new LLMError(
        'ConfigError',
        `Invalid model: ${model}. Available models: ${Object.keys(VENICE_MODELS).join(', ')}`,
      );
    }

    this.config = {
      ...defaultConfig,
      ...config,
      apiKey,
      model,
    } as Required<LLMConfig>;
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
  }): Promise<LLMResponse> {
    const { system, prompt, temperature = 0.7, maxTokens = 1000 } = params;
    const retryConfig = this.config.retry;
    let lastError: unknown;
    let delay = retryConfig.initialDelay;

    const modelSpec = VENICE_MODELS[this.config.model];
    const maxContextTokens = modelSpec.availableContextTokens;

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

        return {
          content: data.choices[0].message.content,
          model: this.config.model,
          timestamp: new Date().toISOString(),
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
}
