import { output } from '../output-manager.js';
import { isValidModel, VENICE_MODELS, VeniceModel, suggestModel } from './models.js';
import { readSecret } from '../utils/secrets.js';

export interface LLMConfig {
  apiKey?: string;
  model?: VeniceModel;
  baseUrl?: string;
  retry?: RetryConfig;
  timeout?: number;
  taskParams?: {
    needsFunctionCalling?: boolean;
    needsLargeContext?: boolean;
    needsSpeed?: boolean;
    isCodeTask?: boolean;
  };
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

interface VeniceAPIError {
  error: string;
}

interface VeniceAPIResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

const defaultRetryConfig: RetryConfig = {
  maxAttempts: 3,
  initialDelay: 1000,
  useExponentialBackoff: true,
};

const defaultConfig: Partial<LLMConfig> = {
  baseUrl: 'https://api.venice.ai/api/v1',
  retry: defaultRetryConfig,
  timeout: 120000, // 2 minute default timeout for deep research
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

  private constructor(config: Required<LLMConfig>) {
    this.config = config;
    const modelSpec = VENICE_MODELS[config.model];
    output.log('LLMClient initialized with config:', {
      model: this.config.model,
      baseUrl: this.config.baseUrl,
      retry: this.config.retry,
      timeout: this.config.timeout,
      modelTraits: modelSpec.traits,
      modelBestFor: modelSpec.bestFor,
    });
  }

  static async create(config: LLMConfig = {}): Promise<LLMClient> {
    const apiKey = config.apiKey || await readSecret('VENICE_API_KEY');

    // Use provided model, environment variable, or suggest based on task params
    let model = config.model || process.env.VENICE_MODEL;
    if (!model && config.taskParams) {
      model = suggestModel(config.taskParams);
    }
    if (!model) {
      model = 'llama-3.3-70b'; // Default fallback if no model specified
    }

    if (!isValidModel(model)) {
      throw new LLMError(
        'ConfigError',
        `Invalid model: ${model}. Available models: ${Object.keys(VENICE_MODELS).join(', ')}`,
      );
    }

    // For deep research models, use a longer timeout
    let timeout = config.timeout || defaultConfig.timeout;
    if (model === 'deepseek-r1-671b') {
      timeout = 300000; // 5 minutes for our most powerful model
    }

    const fullConfig = {
      ...defaultConfig,
      ...config,
      apiKey,
      model,
      timeout,
      taskParams: config.taskParams || {},
    } as Required<LLMConfig>;

    return new LLMClient(fullConfig);
  }

  private getRateLimitDelay(): number {
    if (this.rateLimitInfo?.resetIn) {
      return this.rateLimitInfo.resetIn * 1000 + 100;
    }
    return this.config.retry.initialDelay;
  }

  private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
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
        output.log(`Attempt ${attempt}/${retryConfig.maxAttempts}: Making request to Venice API`);
        
        const requestBody = {
          model: this.config.model,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: prompt },
          ],
          temperature,
          max_tokens: Math.min(maxTokens, maxContextTokens),
          top_p: 0.95,
        };

        // Log complete request details for troubleshooting
        output.log('Request details:', {
          url: `${this.config.baseUrl}/chat/completions`,
          model: this.config.model,
          temperature,
          maxTokens: Math.min(maxTokens, maxContextTokens),
          system,
          prompt,
          requestBody,
        });

        const response = await this.fetchWithTimeout(
          `${this.config.baseUrl}/chat/completions`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.config.apiKey}`,
            },
            body: JSON.stringify(requestBody),
          },
        );

        output.log('Received response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
        });

        this.rateLimitInfo = getRateLimitInfo(response.headers);

        if (!response.ok) {
          const errorData = await response.json() as VeniceAPIError;
          throw new LLMError(
            'APIError',
            `Venice API error: ${errorData.error || response.statusText}`,
            { status: response.status, error: errorData },
          );
        }

        const data = await response.json() as VeniceAPIResponse;
        output.log('Response data received:', data);

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
        output.log(`Attempt ${attempt} failed:`, error);
        lastError = error;

        if (error instanceof DOMException && error.name === 'AbortError') {
          throw new LLMError(
            'TimeoutError',
            `Request timed out after ${this.config.timeout}ms`,
            error,
          );
        }

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

        output.log(`Waiting ${delay}ms before next attempt...`);
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
