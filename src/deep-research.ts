import { output } from './output-manager.js';
import { ResearchPath } from './research-path.js';
import { uiClient } from 'deep-research-ui';

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
  /** Enable terminal UI visualization */
  enableUI?: boolean;
  /** Analysis configuration */
  analysis?: {
    /** Focus areas for content analysis */
    focusAreas?: Array<'claims' | 'methodologies' | 'patterns' | 'relationships'>;
    /** Depth of analysis (basic or detailed) */
    depth?: 'basic' | 'detailed';
  };
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
  analysis?: {
    processedSources: number;
    identifiedPatterns: number;
    extractedClaims: number;
  };
}

/**
 * Structured content analysis
 */
export interface ContentAnalysis {
  claims: Array<{
    statement: string;
    evidence: string[];
    confidence: number;
  }>;
  methodologies: string[];
  patterns: Array<{
    type: 'consensus' | 'disagreement' | 'trend';
    description: string;
  }>;
  relationships: Array<{
    concept1: string;
    concept2: string;
    relationship: string;
  }>;
}

/**
 * Results from a research task
 */
export interface ResearchResult {
  learnings: string[];
  sources: string[];
  analysis?: ContentAnalysis;
  synthesis?: {
    patterns: Map<string, string[]>;
    consensus: Map<string, number>;
    methodologies: Set<string>;
    relationships: Map<string, Set<string>>;
    confidenceLevels: Map<string, number>;
  };
  models?: {
    pathPlanning?: string;
    multimodal?: string;
    contentAnalysis?: string;
  };
}

/**
 * Main research engine that coordinates research paths
 */
export class ResearchEngine {
  private config: ResearchConfig;

  constructor(config: ResearchConfig) {
    // Set default analysis configuration if not provided
    this.config = {
      ...config,
      analysis: {
        focusAreas: ['claims', 'patterns'],
        depth: 'basic',
        ...config.analysis,
      },
    };
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
        analysis: {
          processedSources: 0,
          identifiedPatterns: 0,
          extractedClaims: 0,
        },
      };

      // Set up UI event handling if enabled
      if (this.config.enableUI) {
        const originalOnProgress = this.config.onProgress;
        this.config.onProgress = (progress: ResearchProgress) => {
          // Send UI event
          uiClient.sendEvent({
            type: 'progress',
            timestamp: Date.now(),
            data: {
              stage: progress.currentQuery ? 'Research' : 'Initialization',
              percentage: Math.round((progress.completedQueries / Math.max(progress.totalQueries, 1)) * 100),
              message: progress.currentQuery || 'Starting research...'
            }
          });

          // Call original progress callback if it exists
          if (originalOnProgress) {
            originalOnProgress(progress);
          }
        };
      }

      // Create and start research path
      const path = new ResearchPath(this.config, progress);
      const result = await path.research();

      // Send learning events if UI is enabled
      if (this.config.enableUI && result.learnings.length > 0) {
        result.learnings.forEach((learning, index) => {
          uiClient.sendEvent({
            type: 'learning',
            timestamp: Date.now(),
            data: {
              topic: `Learning ${index + 1}`,
              content: learning,
              confidence: 90, // Could be more dynamic based on analysis
              sources: result.sources
            }
          });
        });
      }

      // Synthesize findings if we have analysis data
      if (result.analysis) {
        const synthesis = {
          patterns: new Map<string, string[]>(),
          consensus: new Map<string, number>(),
          methodologies: new Set<string>(),
          relationships: new Map<string, Set<string>>(),
          confidenceLevels: new Map<string, number>(),
        };

        // Process patterns
        result.analysis.patterns.forEach(pattern => {
          const existing = synthesis.patterns.get(pattern.type) || [];
          synthesis.patterns.set(pattern.type, [...existing, pattern.description]);

          // Send pattern events if UI is enabled
          if (this.config.enableUI) {
            uiClient.sendEvent({
              type: 'learning',
              timestamp: Date.now(),
              data: {
                topic: `Pattern: ${pattern.type}`,
                content: pattern.description,
                confidence: 85,
                sources: result.sources
              }
            });
          }
        });

        // Process methodologies
        result.analysis.methodologies.forEach(method => {
          synthesis.methodologies.add(method);
        });

        // Process relationships
        result.analysis.relationships.forEach(rel => {
          const existing = synthesis.relationships.get(rel.concept1) || new Set();
          existing.add(rel.concept2);
          synthesis.relationships.set(rel.concept1, existing);
        });

        // Process claims and confidence levels
        result.analysis.claims.forEach(claim => {
          synthesis.confidenceLevels.set(claim.statement, claim.confidence);
        });

        result.synthesis = synthesis;
      }

      return result;
    } catch (error) {
      output.log('Error in research:', error);
      return {
        learnings: [`Research attempted on: ${this.config.query}`],
        sources: [],
      };
    }
  }
}
