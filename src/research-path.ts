import { generateQueries, processResults, trimPrompt } from './ai/providers.js';
import {
  ResearchConfig,
  ResearchProgress,
  ResearchResult,
} from './deep-research.js';
import { output } from './output-manager.js';
import {
  SearchError,
  SearchResult,
  suggestSearchProvider,
} from './search/providers.js';
import { cleanQuery } from './utils.js';
import { uiClient } from 'deep-research-ui';

// Increased timeouts for deep research tasks
const SEARCH_TIMEOUT = 120000; // 2 minutes for search operations
const PROCESS_TIMEOUT = 300000; // 5 minutes for content processing

/**
 * Handles a single research path, managing its progress and results
 */
export class ResearchPath {
  private progress: ResearchProgress;
  private config: ResearchConfig;
  private totalQueriesAtDepth: number[];

  constructor(config: ResearchConfig, progress: ResearchProgress) {
    this.config = config;
    this.progress = progress;
    // Pre-calculate total queries at each depth level
    this.totalQueriesAtDepth = Array(config.depth).fill(0);
    let queriesAtDepth = config.breadth;
    for (let i = 0; i < config.depth; i++) {
      this.totalQueriesAtDepth[i] = queriesAtDepth;
      queriesAtDepth = Math.ceil(queriesAtDepth / 2);
    }
    // Set total queries to sum of all depths
    this.progress.totalQueries = this.totalQueriesAtDepth.reduce(
      (a, b) => a + b,
      0,
    );

    output.log('Research path initialized:', {
      query: config.query,
      depth: config.depth,
      breadth: config.breadth,
      totalQueries: this.progress.totalQueries,
    });

    // Send initial progress event immediately
    if (this.config.enableUI) {
      uiClient.sendEvent({
        type: 'progress',
        timestamp: Date.now(),
        data: {
          stage: 'Initializing Research',
          percentage: 0,
          message: `Starting research for query: "${config.query}"\nDepth: ${config.depth}, Breadth: ${config.breadth}\nTotal queries planned: ${this.progress.totalQueries}`
        }
      });
    }
  }

  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    operation: string,
  ): Promise<T> {
    let timeoutHandle: NodeJS.Timeout;
    const timeoutPromise = new Promise<T>((_, reject) => {
      timeoutHandle = setTimeout(() => {
        reject(new Error(`${operation} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    try {
      const result = await Promise.race([promise, timeoutPromise]);
      clearTimeout(timeoutHandle!);
      return result;
    } catch (error) {
      clearTimeout(timeoutHandle!);
      throw error;
    }
  }

  private async search(
    query: string,
    attempt: number = 0,
  ): Promise<SearchResult[]> {
    try {
      output.log(`Starting search for query: "${query}"`);
      
      if (this.config.enableUI) {
        uiClient.sendEvent({
          type: 'api_call',
          timestamp: Date.now(),
          data: {
            provider: 'Brave Search',
            endpoint: '/search',
            parameters: { query },
            status: 'started'
          }
        });
      }

      const results = await this.withTimeout(
        suggestSearchProvider({ type: 'web' }).search(query),
        SEARCH_TIMEOUT,
        'Search operation'
      );

      if (this.config.enableUI) {
        // Send search results
        uiClient.sendEvent({
          type: 'search_result',
          timestamp: Date.now(),
          data: {
            query,
            provider: 'Brave Search',
            results: results.map(r => ({
              title: r.title || 'No title',
              url: r.source || 'No URL',
              snippet: r.content || 'No content'
            }))
          }
        });

        // Update API call status
        uiClient.sendEvent({
          type: 'api_call',
          timestamp: Date.now(),
          data: {
            provider: 'Brave Search',
            endpoint: '/search',
            parameters: { query },
            status: 'completed',
            response: `Found ${results.length} results`
          }
        });
      }

      return results;
    } catch (error) {
      if (this.config.enableUI) {
        uiClient.sendEvent({
          type: 'api_call',
          timestamp: Date.now(),
          data: {
            provider: 'Brave Search',
            endpoint: '/search',
            parameters: { query },
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        });
      }

      if (
        error instanceof SearchError &&
        error.code === 'RATE_LIMIT' &&
        attempt < 3
      ) {
        const delay = 10000 * Math.pow(2, attempt); // 10s, 20s, 40s backoff
        output.log(
          `Rate limited at research level. Waiting ${delay / 1000}s before retry...`,
        );
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.search(query, attempt + 1);
      }
      throw error;
    }
  }

  private async processQuery(
    query: string,
    depth: number,
    breadth: number,
    learnings: string[] = [],
    sources: string[] = [],
  ): Promise<ResearchResult> {
    try {
      output.log(`Processing query at depth ${depth}, breadth ${breadth}: "${query}"`);

      if (this.config.enableUI) {
        uiClient.sendEvent({
          type: 'progress',
          timestamp: Date.now(),
          data: {
            stage: 'Processing Query',
            percentage: Math.round((this.progress.completedQueries / this.progress.totalQueries) * 100),
            message: `Current Query: "${query}"\nDepth: ${depth}/${this.config.depth}, Breadth: ${breadth}/${this.config.breadth}`
          }
        });
      }

      // Search for content using privacy-focused provider
      const searchResults = await this.search(query);
      const content = searchResults
        .map(item => item.content)
        .filter((text): text is string => !!text)
        .map(text => trimPrompt(text, 25_000));

      output.log(`Found ${content.length} results for "${query}"`);

      // Extract and track sources
      const newSources = searchResults
        .map(item => item.source)
        .filter((source): source is string => !!source);

      // Calculate next iteration parameters
      const newBreadth = Math.ceil(breadth / 2);
      const newDepth = depth - 1;

      // Process results using AI to extract insights
      output.log('Processing content with AI...');

      if (this.config.enableUI) {
        uiClient.sendEvent({
          type: 'api_call',
          timestamp: Date.now(),
          data: {
            provider: 'Venice AI',
            endpoint: '/process',
            parameters: { query },
            status: 'started'
          }
        });
      }

      const results = await this.withTimeout(
        processResults({
          query,
          content,
          numFollowUpQuestions: newBreadth,
        }),
        PROCESS_TIMEOUT,
        'Content processing'
      );

      if (this.config.enableUI) {
        // Send learning events
        results.learnings.forEach((learning, index) => {
          uiClient.sendEvent({
            type: 'learning',
            timestamp: Date.now(),
            data: {
              topic: `Learning from "${query}"`,
              content: learning,
              confidence: 90,
              sources: newSources
            }
          });
        });

        uiClient.sendEvent({
          type: 'api_call',
          timestamp: Date.now(),
          data: {
            provider: 'Venice AI',
            endpoint: '/process',
            parameters: { query },
            status: 'completed',
            response: `Extracted ${results.learnings.length} learnings`
          }
        });
      }

      output.log(`Extracted ${results.learnings.length} learnings and ${results.followUpQuestions.length} follow-up questions`);

      // Combine new findings with existing ones
      const allLearnings = [...learnings, ...results.learnings];
      const allSources = [...sources, ...newSources];

      // Update progress tracking
      this.updateProgress({
        currentDepth: depth,
        currentBreadth: breadth,
        completedQueries: this.progress.completedQueries + 1,
        currentQuery: query,
      });

      // Continue research if we haven't reached max depth
      if (newDepth > 0) {
        output.log(
          `Continuing research at depth ${newDepth}, breadth ${newBreadth}`,
        );

        // Use AI-generated follow-up question or create a related query
        const nextQuery =
          results.followUpQuestions[0] ||
          `Tell me more about ${cleanQuery(query)}`;

        return this.processQuery(
          nextQuery,
          newDepth,
          newBreadth,
          allLearnings,
          allSources,
        );
      }

      output.log('Reached maximum depth, returning results');
      return {
        learnings: allLearnings,
        sources: allSources,
      };
    } catch (error) {
      if (this.config.enableUI) {
        uiClient.sendEvent({
          type: 'api_call',
          timestamp: Date.now(),
          data: {
            provider: 'Venice AI',
            endpoint: '/process',
            parameters: { query },
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        });
      }

      if (error instanceof SearchError && error.code === 'RATE_LIMIT') {
        // Let the rate limit error propagate up to be handled by the retry mechanism
        throw error;
      }

      output.log(`Error processing query "${query}":`, error);
      // For non-rate-limit errors, return empty results but continue research
      return {
        learnings: [`Error researching: ${query}`],
        sources: [],
      };
    }
  }

  private updateProgress(update: Partial<ResearchProgress>) {
    Object.assign(this.progress, update);
    this.config.onProgress?.(this.progress);

    if (this.config.enableUI) {
      uiClient.sendEvent({
        type: 'progress',
        timestamp: Date.now(),
        data: {
          stage: 'Research Progress',
          percentage: Math.round((this.progress.completedQueries / this.progress.totalQueries) * 100),
          message: `Depth: ${update.currentDepth}/${this.config.depth}\nBreadth: ${update.currentBreadth}/${this.config.breadth}\nQueries: ${this.progress.completedQueries}/${this.progress.totalQueries}`
        }
      });
    }
  }

  async research(): Promise<ResearchResult> {
    const { query, breadth, depth } = this.config;

    output.log('Starting research process...');

    if (this.config.enableUI) {
      uiClient.sendEvent({
        type: 'progress',
        timestamp: Date.now(),
        data: {
          stage: 'Starting Research',
          percentage: 0,
          message: 'Generating initial research queries...'
        }
      });
    }

    // Generate initial research queries using AI
    output.log('Generating initial queries...');

    if (this.config.enableUI) {
      uiClient.sendEvent({
        type: 'api_call',
        timestamp: Date.now(),
        data: {
          provider: 'Venice AI',
          endpoint: '/generate-queries',
          parameters: { query, numQueries: breadth },
          status: 'started'
        }
      });
    }

    const queries = await generateQueries({
      query,
      numQueries: breadth
    });

    if (this.config.enableUI) {
      uiClient.sendEvent({
        type: 'api_call',
        timestamp: Date.now(),
        data: {
          provider: 'Venice AI',
          endpoint: '/generate-queries',
          parameters: { query, numQueries: breadth },
          status: 'completed',
          response: `Generated ${queries.length} queries`
        }
      });
    }

    output.log(`Generated ${queries.length} initial queries`);

    this.updateProgress({
      currentQuery: queries[0]?.query,
    });

    // Process queries sequentially with delay to avoid rate limits
    const results = [];
    for (const serpQuery of queries) {
      output.log(`Processing query: "${serpQuery.query}"`);
      const result = await this.processQuery(serpQuery.query, depth, breadth);
      results.push(result);

      // Add delay between queries to respect rate limits
      if (queries.indexOf(serpQuery) < queries.length - 1) {
        const delay = 5000;
        output.log(`Waiting ${delay}ms before next query...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    output.log('Research complete, combining results...');

    if (this.config.enableUI) {
      uiClient.sendEvent({
        type: 'progress',
        timestamp: Date.now(),
        data: {
          stage: 'Completing Research',
          percentage: 100,
          message: 'Combining and finalizing results...'
        }
      });
    }

    // Combine and deduplicate results
    return {
      learnings: [...new Set(results.flatMap(r => r.learnings))],
      sources: [...new Set(results.flatMap(r => r.sources))],
    };
  }
}
