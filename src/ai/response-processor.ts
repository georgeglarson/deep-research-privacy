export interface ProcessedResult {
  rawContent: string;
  success: boolean;
  error?: string;
}

export abstract class BaseProcessor<T extends ProcessedResult> {
  protected cleanText(text: string): string {
    return text
      .replace(/^[\d\-\*•]+\.?\s*/, '') // Remove list markers
      .replace(/^[1-9][0-9]?\.\s*/, '') // Remove numbered list markers
      .replace(/^-\s*/, '') // Remove bullet points
      .trim();
  }

  protected extractLines(text: string): string[] {
    return text
      .split('\n')
      .map(line => this.cleanText(line))
      .filter(line => line.length > 0);
  }

  abstract process(content: string): T;
  abstract getDefault(): T;
}

export interface QueryResult extends ProcessedResult {
  queries: Array<{
    query: string;
    researchGoal: string;
  }>;
}

export class QueryProcessor extends BaseProcessor<QueryResult> {
  process(content: string): QueryResult {
    try {
      const questions = this.extractLines(content)
        .filter(line => line.includes('?'))
        .filter(line => line.match(/^(what|how|why|when|where|which)/i));

      if (questions.length > 0) {
        return {
          rawContent: content,
          success: true,
          queries: questions.map(query => ({
            query,
            researchGoal: `Research and analyze: ${query.replace(/\?$/, '')}`,
          })),
        };
      }

      const statements = this.extractLines(content).filter(
        line => !line.includes('?'),
      );

      if (statements.length > 0) {
        return {
          rawContent: content,
          success: true,
          queries: statements.map(statement => ({
            query: `What are the details of ${statement}?`,
            researchGoal: `Research and analyze: ${statement}`,
          })),
        };
      }

      return {
        rawContent: content,
        success: false,
        error: 'No valid questions or statements found',
        queries: [],
      };
    } catch (error) {
      return {
        rawContent: content,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        queries: [],
      };
    }
  }

  getDefault(): QueryResult {
    return {
      rawContent: '',
      success: true,
      queries: [
        {
          query: 'What are the fundamental principles involved?',
          researchGoal: 'Research and analyze core concepts',
        },
      ],
    };
  }
}

interface ContentAnalysis {
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

export interface LearningResult extends ProcessedResult {
  learnings: string[];
  followUpQuestions: string[];
  analysis?: ContentAnalysis;
}

export class LearningProcessor extends BaseProcessor<LearningResult> {
  process(content: string): LearningResult {
    try {
      const lines = this.extractLines(content);
      const learnings: string[] = [];
      const questions: string[] = [];
      let currentSection: 'learning' | 'question' | 'analysis' | null = null;
      let analysisSection: keyof ContentAnalysis | null = null;
      
      const analysis: ContentAnalysis = {
        claims: [],
        methodologies: [],
        patterns: [],
        relationships: [],
      };

      let currentClaim: {
        statement: string;
        evidence: string[];
        confidence: number;
      } | null = null;

      for (const line of lines) {
        const lowerLine = line.toLowerCase();

        // Determine section
        if (
          lowerLine.includes('key learning') ||
          lowerLine.includes('insight') ||
          lowerLine.includes('finding')
        ) {
          currentSection = 'learning';
          continue;
        } else if (
          lowerLine.includes('follow-up') ||
          lowerLine.includes('question')
        ) {
          currentSection = 'question';
          continue;
        } else if (lowerLine.includes('content analysis')) {
          currentSection = 'analysis';
          continue;
        }

        // Handle analysis subsections
        if (currentSection === 'analysis') {
          if (lowerLine.includes('key claims')) {
            analysisSection = 'claims';
            continue;
          } else if (lowerLine.includes('methodologies')) {
            analysisSection = 'methodologies';
            continue;
          } else if (lowerLine.includes('patterns')) {
            analysisSection = 'patterns';
            continue;
          } else if (lowerLine.includes('relationships')) {
            analysisSection = 'relationships';
            continue;
          }

          // Process analysis content
          if (analysisSection === 'claims') {
            const confidenceMatch = line.match(/confidence:\s*(0\.\d+)/i);
            if (confidenceMatch && confidenceMatch[1]) {
              if (currentClaim) {
                currentClaim.confidence = parseFloat(confidenceMatch[1]);
                analysis.claims.push(currentClaim);
                currentClaim = null;
              }
            } else if (line.includes('Evidence:')) {
              // Skip the Evidence header
              continue;
            } else if (currentClaim) {
              currentClaim.evidence.push(line);
            } else if (line.length > 20) {
              currentClaim = {
                statement: line,
                evidence: [],
                confidence: 0,
              };
            }
          } else if (analysisSection === 'methodologies') {
            if (line.length > 10) {
              analysis.methodologies.push(line);
            }
          } else if (analysisSection === 'patterns') {
            const typeMatch = line.match(/^(consensus|disagreement|trend):/i);
            if (typeMatch?.[0] && typeMatch?.[1] && line.length > 20) {
              analysis.patterns.push({
                type: typeMatch[1].toLowerCase() as 'consensus' | 'disagreement' | 'trend',
                description: line.substring(typeMatch[0].length).trim(),
              });
            }
          } else if (analysisSection === 'relationships') {
            const relationMatch = line.match(/(.+?)\s+(relates to|influences|affects|depends on|correlates with)\s+(.+)/i);
            if (relationMatch?.[1] && relationMatch?.[2] && relationMatch?.[3]) {
              analysis.relationships.push({
                concept1: relationMatch[1].trim(),
                relationship: relationMatch[2].trim(),
                concept2: relationMatch[3].trim(),
              });
            }
          }
        } else if (currentSection === 'learning' && line.length > 20) {
          learnings.push(line);
        } else if (currentSection === 'question' && line.includes('?')) {
          questions.push(line);
        }
      }

      // Finalize any pending claim
      if (currentClaim && currentClaim.statement) {
        currentClaim.confidence = 0.5; // Default confidence if not specified
        analysis.claims.push(currentClaim);
      }

      const hasAnalysis = Object.values(analysis).some(arr => arr.length > 0);

      if (learnings.length > 0 || questions.length > 0) {
        return {
          rawContent: content,
          success: true,
          learnings,
          followUpQuestions: questions,
          ...(hasAnalysis ? { analysis } : {}),
        };
      }

      return {
        rawContent: content,
        success: false,
        error: 'No valid learnings or questions found',
        learnings: [],
        followUpQuestions: [],
      };
    } catch (error) {
      return {
        rawContent: content,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        learnings: [],
        followUpQuestions: [],
      };
    }
  }

  getDefault(): LearningResult {
    return {
      rawContent: '',
      success: true,
      learnings: [],
      followUpQuestions: [],
    };
  }
}

export interface ReportResult extends ProcessedResult {
  reportMarkdown: string;
}

export class ReportProcessor extends BaseProcessor<ReportResult> {
  process(content: string): ReportResult {
    try {
      if (!content.trim()) {
        return {
          rawContent: content,
          success: false,
          error: 'Empty content',
          reportMarkdown: '',
        };
      }

      return {
        rawContent: content,
        success: true,
        reportMarkdown: content,
      };
    } catch (error) {
      return {
        rawContent: content,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        reportMarkdown: '',
      };
    }
  }

  getDefault(): ReportResult {
    return {
      rawContent: '',
      success: true,
      reportMarkdown: '',
    };
  }
}
