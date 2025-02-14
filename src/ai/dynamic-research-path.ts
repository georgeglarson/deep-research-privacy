import { generateQueries, processResults, trimPrompt } from './providers.js';
import {
  ResearchConfig,
  ResearchProgress,
  ResearchResult,
} from '../deep-research.js';
import { output } from '../output-manager.js';
import {
  SearchError,
  SearchResult,
  suggestSearchProvider,
} from '../search/providers.js';
import { cleanQuery } from '../utils.js';
import { VeniceModel, suggestModel } from './models.js';

interface PathNode {
  query: string;
  relevanceScore: number;
  explored: boolean;
  children: PathNode[];
  learnings: string[];
  sources: string[];
  content?: {
    text?: string;
    images?: string[];
    pdfs?: string[];
  };
}

/**
 * Enhanced research path implementation using dynamic planning and multimodal processing
 */
export class DynamicResearchPath {
  private progress: ResearchProgress;
  private config: ResearchConfig;
  private root: PathNode;
  private explorationQueue: PathNode[] = [];
  private maxExplorationNodes: number;

  constructor(config: ResearchConfig, progress: ResearchProgress) {
    this.config = config;
    this.progress = progress;
    this.maxExplorationNodes = config.breadth * config.depth;
    
    // Initialize root node with main query
    this.root = {
      query: config.query,
      relevanceScore: 1.0,
      explored: false,
      children: [],
      learnings: [],
      sources: [],
    };
    
    this.explorationQueue.push(this.root);
  }

  private async processContent(content: string[], model: VeniceModel = 'deepseek-r1-671b') {
    return processResults({
      query: this.config.query,
      content,
      numFollowUpQuestions: Math.ceil(this.config.breadth / 2),
      model,
    });
  }

  private async calculateRelevanceScore(node: PathNode): Promise<number> {
    // Use DeepSeek R1 to evaluate relevance to original query
    const results = await processResults({
      query: `Rate the relevance of "${node.query}" to the original query "${this.config.query}" on a scale of 0-1`,
      content: node.content?.text ? [node.content.text] : [],
      model: 'deepseek-r1-671b' as VeniceModel,
    });
    
    // Extract score from AI response
    const scoreMatch = results.learnings[0]?.match(/0\.\d+/);
    return scoreMatch ? parseFloat(scoreMatch[0]) : 0.5;
  }

  private async processMultimodalContent(content: string[]) {
    // Use Qwen VL for processing images and PDFs
    const results = await processResults({
      query: this.config.query,
      content,
      model: 'qwen-vl' as VeniceModel,
    });
    
    return results;
  }

  private async search(query: string, attempt: number = 0): Promise<SearchResult[]> {
    try {
      const provider = await suggestSearchProvider({ type: 'web' });
      return provider.search(query);
    } catch (error) {
      if (
        error instanceof SearchError &&
        error.code === 'RATE_LIMIT' &&
        attempt < 3
      ) {
        const delay = 10000 * Math.pow(2, attempt);
        output.log(
          `Rate limited. Waiting ${delay / 1000}s before retry...`,
        );
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.search(query, attempt + 1);
      }
      throw error;
    }
  }

  private async exploreNode(node: PathNode): Promise<void> {
    try {
      // Search for content
      const searchResults = await this.search(node.query);
      
      // Process different content types
      const textContent = searchResults
        .map(item => item.content)
        .filter((text): text is string => !!text)
        .map(text => trimPrompt(text, 25_000));

      // Extract sources
      node.sources = searchResults
        .map(item => item.source)
        .filter((source): source is string => !!source);

      // Store content for relevance calculation
      node.content = { text: textContent.join('\n') };

      // Process content with appropriate model
      const hasMultimodalContent = searchResults.some(r => r.type === 'image' || r.type === 'pdf');
      const results = hasMultimodalContent
        ? await this.processMultimodalContent(textContent)
        : await this.processContent(textContent);

      // Update node with findings
      node.learnings = results.learnings;
      node.relevanceScore = await this.calculateRelevanceScore(node);
      node.explored = true;

      // Generate and queue child nodes if relevance score is good
      if (node.relevanceScore > 0.6) {
        const childQueries = await generateQueries({
          query: node.query,
          numQueries: Math.ceil(this.config.breadth / 2),
          model: 'deepseek-r1-671b' as VeniceModel,
          learnings: node.learnings, // Pass current learnings for better context
        });

        node.children = childQueries.map(q => ({
          query: q.query,
          relevanceScore: 0,
          explored: false,
          children: [],
          learnings: [],
          sources: [],
        }));

        // Add promising children to exploration queue
        this.explorationQueue.push(...node.children);
      }

      // Update progress
      this.updateProgress({
        completedQueries: this.progress.completedQueries + 1,
        currentQuery: node.query,
      });

    } catch (error) {
      output.log(`Error exploring "${node.query}":`, error);
      node.explored = true;
      node.learnings = [`Error researching: ${node.query}`];
    }
  }

  private updateProgress(update: Partial<ResearchProgress>) {
    Object.assign(this.progress, update);
    this.config.onProgress?.(this.progress);
  }

  private getNextNode(): PathNode | undefined {
    // Sort queue by relevance score (unexplored nodes start with 0)
    this.explorationQueue.sort((a, b) => b.relevanceScore - a.relevanceScore);
    return this.explorationQueue.shift();
  }

  async research(): Promise<ResearchResult> {
    let exploredCount = 0;
    
    while (
      exploredCount < this.maxExplorationNodes &&
      this.explorationQueue.length > 0
    ) {
      const node = this.getNextNode();
      if (!node) break;

      await this.exploreNode(node);
      exploredCount++;

      // Add delay between queries
      if (this.explorationQueue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    // Collect all learnings and sources
    const allResults = this.collectResults(this.root);
    
    return {
      learnings: [...new Set(allResults.learnings)],
      sources: [...new Set(allResults.sources)],
    };
  }

  private collectResults(node: PathNode): ResearchResult {
    const results: ResearchResult = {
      learnings: [...node.learnings],
      sources: [...node.sources],
    };

    // Recursively collect from children
    for (const child of node.children) {
      const childResults = this.collectResults(child);
      results.learnings.push(...childResults.learnings);
      results.sources.push(...childResults.sources);
    }

    return results;
  }
}