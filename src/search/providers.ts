import axios from 'axios';

import { LLMClient } from '../ai/llm-client.js';
import { output } from '../output-manager.js';
import { RateLimiter } from '../utils.js';

/**
 * A search result from any provider
 */
export interface SearchResult {
  title: string;
  content: string;
  source: string;
  type: string;
}

/**
 * Interface for search providers
 */
export interface SearchProvider {
  type: string;
  search(query: string): Promise<SearchResult[]>;
}

/**
 * Custom error for search operations
 */
export class SearchError extends Error {
  constructor(
    public code: string,
    message: string,
    public provider: string,
  ) {
    super(message);
    this.name = 'SearchError';
  }
}

interface BraveSearchResult {
  title: string;
  description: string;
  url: string;
}

interface BraveSearchResponse {
  web?: {
    results: BraveSearchResult[];
  };
}

interface BraveErrorResponse {
  error?: {
    code: string;
    detail: string;
    meta?: {
      rate_limit?: number;
      rate_current?: number;
    };
  };
}

/**
 * Privacy-focused search provider using Brave Search API
 */
class BraveSearchProvider implements SearchProvider {
  type = 'web' as const;
  private apiKey: string;
  private baseUrl = 'https://api.search.brave.com/res/v1';
  private rateLimiter: RateLimiter;
  private maxRetries = 3;
  private retryDelay = 2000;

  constructor() {
    const apiKey = process.env.BRAVE_API_KEY;
    if (!apiKey) {
      throw new Error('BRAVE_API_KEY environment variable is required');
    }
    this.apiKey = apiKey;
    this.rateLimiter = new RateLimiter(5000); // 5 seconds between requests for free plan
  }

  private async makeRequest(query: string): Promise<SearchResult[]> {
    output.log('Starting Brave search...');
    await this.rateLimiter.waitForNextSlot();

    const response = await axios.get<BraveSearchResponse>(
      `${this.baseUrl}/web/search`,
      {
        headers: {
          Accept: 'application/json',
          'X-Subscription-Token': this.apiKey,
        },
        params: {
          q: query,
          count: 10,
          offset: 0,
          language: 'en',
          country: 'US',
          safesearch: 'moderate',
          format: 'json',
        },
      },
    );

    const results = response.data.web?.results || [];
    return results.map((result: BraveSearchResult) => ({
      title: result.title || 'Untitled',
      content: result.description || 'No description available',
      source: result.url,
      type: this.type,
    }));
  }

  async search(query: string): Promise<SearchResult[]> {
    let retryCount = 0;

    while (retryCount <= this.maxRetries) {
      try {
        return await this.makeRequest(query);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          const errorResponse = error.response?.data as BraveErrorResponse;

          if (status === 429) {
            output.log(
              'Rate limit response:',
              JSON.stringify(errorResponse, null, 2),
            );

            if (retryCount < this.maxRetries) {
              const delay = this.retryDelay * Math.pow(2, retryCount);
              output.log(
                `Rate limited. Attempt ${retryCount + 1}/${this.maxRetries}. Waiting ${delay / 1000} seconds...`,
              );
              await new Promise(resolve => setTimeout(resolve, delay));
              retryCount++;
              continue;
            }

            throw new SearchError(
              'RATE_LIMIT',
              `Rate limit exceeded after ${this.maxRetries} retries`,
              this.type,
            );
          }

          output.log(
            'API Error Response:',
            errorResponse || 'No error details available',
          );
          throw new SearchError(
            'API_ERROR',
            `Brave search failed: ${error.message}`,
            this.type,
          );
        }

        output.log(
          `Brave search error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
        throw new SearchError(
          'UNKNOWN_ERROR',
          `Brave search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          this.type,
        );
      }
    }

    throw new SearchError(
      'RATE_LIMIT',
      'Exceeded maximum retries due to rate limiting',
      this.type,
    );
  }
}

export class VeniceSearchProvider implements SearchProvider {
  type = 'venice-web';
  private llmClient: LLMClient;

  constructor() {
    this.llmClient = new LLMClient({
      enableWebSearch: true,
      webSearchMode: 'on',
      enableWebCitations: true,
    });
  }

  async search(query: string): Promise<SearchResult[]> {
    try {
      output.log('Starting Venice AI grounded search...');

      const response = await this.llmClient.complete({
        system:
          'You are a research assistant. Use web search to find accurate, up-to-date information.',
        prompt: `Search for comprehensive information about: ${query}\n\nProvide detailed findings with sources.`,
        temperature: 0.3,
        maxTokens: 2000,
        enableWebSearch: true,
        webSearchMode: 'on',
      });

      if (!response.searchResults || response.searchResults.length === 0) {
        output.log('Venice search returned no search results metadata');
        return [
          {
            title: 'Venice AI Research',
            content: response.content,
            source: 'venice-ai-grounded',
            type: this.type,
          },
        ];
      }

      return response.searchResults.map(result => ({
        title: result.title,
        content: result.snippet || response.content,
        source: result.url,
        type: this.type,
      }));
    } catch (error) {
      output.log(
        `Venice search error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new SearchError(
        'VENICE_ERROR',
        `Venice search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.type,
      );
    }
  }
}

export function suggestSearchProvider(options: {
  type: string;
  provider?: 'brave' | 'venice' | 'hybrid';
}): SearchProvider {
  if (options.type !== 'web') {
    throw new Error('Only web search is supported');
  }

  const provider = options.provider || 'brave';

  if (provider === 'venice') {
    return new VeniceSearchProvider();
  }

  return new BraveSearchProvider();
}
