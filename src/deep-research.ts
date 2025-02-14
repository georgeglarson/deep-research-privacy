import { output } from './output-manager.js';
import { ResearchPath } from './research-path.js';

/**
 * Configuration for a research task
 */
export interface ResearchConfig {
  /** Initial query to research */
  query: string;
  /** Number of parallel research paths to explore */
  breadth: number;
  /** How deep to follow research paths */
  depth: number;
  /** Optional callback for progress updates */
  onProgress?: (progress: ResearchProgress) => void;
}

/**
 * Progress tracking for research tasks
 */
export interface ResearchProgress {
  currentDepth: number;
  totalDepth: number;
  currentBreadth: number;
  totalBreadth: number;
  totalQueries: number;
  completedQueries: number;
  currentQuery?: string;
}

/**
 * Results from a research task
 */
export interface ResearchResult {
  learnings: string[];
  sources: string[];
}

/**
 * Main research engine that coordinates research paths
 */
export class ResearchEngine {
  private config: ResearchConfig;

  constructor(config: ResearchConfig) {
    this.config = config;
  }

  async research(): Promise<ResearchResult> {
    try {
      // Initialize progress tracking
      const progress: ResearchProgress = {
        currentDepth: this.config.depth,
        totalDepth: this.config.depth,
        currentBreadth: this.config.breadth,
        totalBreadth: this.config.breadth,
        totalQueries: 0,
        completedQueries: 0,
      };

      // Create and start research path
      const path = new ResearchPath(this.config, progress);
      return await path.research();
    } catch (error) {
      output.log('Error in research:', error);
      return {
        learnings: [`Research attempted on: ${this.config.query}`],
        sources: [],
      };
    }
  }
}
