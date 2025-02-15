import axios from 'axios';

import { output } from '../output-manager.js';
import { RateLimiter } from '../utils.js';
import { readSecret } from '../utils/secrets.js';

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

  private constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.rateLimiter = new RateLimiter(5000); // 5 seconds between requests for free plan
  }

  static async create(): Promise<BraveSearchProvider> {
    const apiKey = await readSecret('BRAVE_API_KEY');
    output.log('Initializing Brave Search with API key:', apiKey.substring(0, 5) + '...');
    return new BraveSearchProvider(apiKey);
  }

  private async makeRequest(query: string): Promise<SearchResult[]> {
    output.log('Starting Brave search for query:', query);
    output.log('Waiting for rate limiter...');
    await this.rateLimiter.waitForNextSlot();
    output.log('Rate limiter cleared, making request...');

    try {
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

      output.log('Received response from Brave Search');
      const results = response.data.web?.results || [];
      output.log(`Found ${results.length} results`);

      return results.map((result: BraveSearchResult) => ({
        title: result.title || 'Untitled',
        content: result.description || 'No description available',
        source: result.url,
        type: this.type,
      }));
    } catch (error) {
      output.log('Error in makeRequest:', error);
      throw error;
    }
  }

  async search(query: string): Promise<SearchResult[]> {
    let retryCount = 0;

    while (retryCount <= this.maxRetries) {
      try {
        output.log(`Search attempt ${retryCount + 1}/${this.maxRetries + 1}`);
        return await this.makeRequest(query);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          const errorResponse = error.response?.data as BraveErrorResponse;

          output.log('Axios error:', {
            status,
            errorResponse,
            message: error.message,
          });

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

export async function suggestSearchProvider(options: {
  type: string;
}): Promise<SearchProvider> {
  output.log('Suggesting search provider for type:', options.type);
  if (options.type !== 'web') {
    throw new Error('Only web search is supported');
  }
  return await BraveSearchProvider.create();
}
