import { generateQueries, processResults, trimPrompt } from './ai/providers.js';
import { output } from './output-manager.js';
import { SearchResult, suggestSearchProvider } from './search/providers.js';
import { cleanQuery } from './utils.js';
import { ResearchConfig, ResearchProgress, ResearchResult } from './deep-research.js';

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
    this.progress.totalQueries = this.totalQueriesAtDepth.reduce((a, b) => a + b, 0);
  }

  private async search(query: string): Promise<SearchResult[]> {
    return suggestSearchProvider({ type: 'web' }).search(query);
  }

  private async processQuery(
    query: string,
    depth: number,
    breadth: number,
    learnings: string[] = [],
    sources: string[] = []
  ): Promise<ResearchResult> {
    try {
      // Search for content using privacy-focused provider
      const searchResults = await this.search(query);
      const content = searchResults
        .map((item) => item.content)
        .filter((text): text is string => !!text)
        .map((text) => trimPrompt(text, 25_000));

      output.log(`Ran "${query}", found ${content.length} results`);

      // Extract and track sources
      const newSources = searchResults
        .map((item) => item.source)
        .filter((source): source is string => !!source);

      // Calculate next iteration parameters
      const newBreadth = Math.ceil(breadth / 2);
      const newDepth = depth - 1;

      // Process results using AI to extract insights
      const results = await processResults({
        query,
        content,
        numFollowUpQuestions: newBreadth,
      });

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
        output.log(`Researching deeper, breadth: ${newBreadth}, depth: ${newDepth}`);

        // Use AI-generated follow-up question or create a related query
        const nextQuery = results.followUpQuestions[0] || 
                       `Tell me more about ${cleanQuery(query)}`;

        return this.processQuery(
          nextQuery,
          newDepth,
          newBreadth,
          allLearnings,
          allSources
        );
      }

      return {
        learnings: allLearnings,
        sources: allSources,
      };
    } catch (error) {
      output.log(`Error processing query "${query}":`, error);
      return {
        learnings: [],
        sources: [],
      };
    }
  }

  private updateProgress(update: Partial<ResearchProgress>) {
    Object.assign(this.progress, update);
    this.config.onProgress?.(this.progress);
  }

  async research(): Promise<ResearchResult> {
    const { query, breadth, depth } = this.config;

    // Generate initial research queries using AI
    const queries = await generateQueries({
      query,
      numQueries: breadth,
    });

    this.updateProgress({
      currentQuery: queries[0]?.query,
    });

    // Process each query in parallel
    const results = await Promise.all(
      queries.map(serpQuery =>
        this.processQuery(
          serpQuery.query,
          depth,
          breadth
        )
      )
    );

    // Combine and deduplicate results
    return {
      learnings: [...new Set(results.flatMap(r => r.learnings))],
      sources: [...new Set(results.flatMap(r => r.sources))],
    };
  }
}