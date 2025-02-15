import { queryExpansionTemplate, systemPrompt } from '../prompt.js';
import { LLMClient } from './llm-client.js';
import { VeniceModel } from './models.js';
import {
  LearningProcessor,
  LearningResult,
  QueryProcessor,
  QueryResult,
  ReportProcessor,
  ReportResult,
} from './response-processor.js';

const queryProcessor = new QueryProcessor();
const learningProcessor = new LearningProcessor();
const reportProcessor = new ReportProcessor();

type OutputType = 'query' | 'learning' | 'report';
type ProcessorResult = QueryResult | LearningResult | ReportResult;
export type QueryType = 'comparative' | 'temporal' | 'methodological' | 'consensus';

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

interface GenerateQueriesParams {
  query: string;
  numQueries?: number;
  learnings?: string[];
  model?: VeniceModel;
  queryTypes?: QueryType[];
  context?: {
    previousFindings?: string[];
    knowledgeGaps?: string[];
    timeframe?: string;
  };
}

interface ProcessResultsParams {
  query: string;
  content: string[];
  numLearnings?: number;
  numFollowUpQuestions?: number;
  model?: VeniceModel;
  analysisDepth?: 'basic' | 'detailed';
  focusAreas?: Array<keyof ContentAnalysis>;
}

export async function generateOutput(params: {
  type: OutputType;
  system: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  model?: VeniceModel;
}): Promise<
  { success: true; data: ProcessorResult } | { success: false; error: string }
> {
  try {
    // Create a new client for each request with the appropriate model
    const client = await LLMClient.create({
      model: params.model,
      taskParams: {
        needsFunctionCalling: params.type === 'query',
        needsLargeContext: params.type === 'learning',
        isCodeTask: false
      }
    });

    const response = await client.complete({
      system: params.system,
      prompt: params.prompt,
      temperature: params.temperature || 0.7,
      maxTokens: params.maxTokens,
    });

    const processResponse = (content: string) => {
      switch (params.type) {
        case 'query':
          return queryProcessor.process(content);
        case 'learning':
          return learningProcessor.process(content);
        case 'report':
          return reportProcessor.process(content);
      }
    };

    const result = processResponse(response.content);
    if (result.success) {
      return { success: true, data: result };
    }

    // Create a new client for retry with lower temperature
    const retryClient = await LLMClient.create({
      model: params.model,
      taskParams: {
        needsFunctionCalling: params.type === 'query',
        needsLargeContext: params.type === 'learning',
        isCodeTask: false
      }
    });

    const retryResponse = await retryClient.complete({
      system: params.system,
      prompt: `${params.prompt}\n\nPlease ensure your response is clear and structured. Each point should be on a new line and be a complete, meaningful statement.`,
      temperature: 0.5,
    });

    const retryResult = processResponse(retryResponse.content);
    if (retryResult.success) {
      return { success: true, data: retryResult };
    }

    return {
      success: false,
      error: `Failed to process response: ${result.error}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export function trimPrompt(text: string, maxLength = 100000): string {
  if (!text) return '';
  return text.length <= maxLength ? text : text.slice(0, maxLength);
}

function generateQueryPrompt(params: GenerateQueriesParams): string {
  const { query, queryTypes = ['comparative'], context } = params;
  
  let prompt = `Analyze this research topic: "${query}"

Generate diverse research queries that will help uncover comprehensive insights. For each query, explain its research goal.

Query types to generate:
${queryTypes.map(type => {
  switch (type) {
    case 'comparative':
      return '- Comparative queries that contrast different approaches/viewpoints';
    case 'temporal':
      return '- Temporal queries that explore changes over time';
    case 'methodological':
      return '- Methodological queries that investigate specific techniques/methods';
    case 'consensus':
      return '- Consensus queries that identify areas of agreement/disagreement';
    default:
      return '';
  }
}).join('\n')}

Requirements:
1. Each query should be specific and focused
2. Include a clear research goal for each query
3. Ensure queries build upon each other
4. Avoid redundant or overlapping queries`;

  if (context) {
    if (context.previousFindings?.length) {
      prompt += `\n\nConsider these previous findings:
${context.previousFindings.map(f => `- ${f}`).join('\n')}`;
    }
    if (context.knowledgeGaps?.length) {
      prompt += `\n\nAddress these knowledge gaps:
${context.knowledgeGaps.map(g => `- ${g}`).join('\n')}`;
    }
    if (context.timeframe) {
      prompt += `\n\nFocus on this timeframe: ${context.timeframe}`;
    }
  }

  return prompt;
}

export async function generateQueries(params: GenerateQueriesParams): Promise<Array<{ query: string; researchGoal: string }>> {
  const { 
    query, 
    numQueries = 3, 
    learnings = [], 
    model = 'deepseek-r1-671b',
    queryTypes = ['comparative']
  } = params;

  const result = await generateOutput({
    type: 'query',
    system: systemPrompt(),
    prompt: generateQueryPrompt(params),
    model,
  });

  if (result.success && 'queries' in result.data) {
    return result.data.queries.slice(0, numQueries);
  }

  return [
    {
      query: `What are the key aspects of ${query}?`,
      researchGoal: `Research and analyze: ${query}`,
    },
  ];
}

export async function processResults(params: ProcessResultsParams): Promise<{
  learnings: string[];
  followUpQuestions: string[];
  analysis?: ContentAnalysis;
}> {
  const {
    query,
    content,
    numLearnings = 3,
    numFollowUpQuestions = 3,
    model = 'deepseek-r1-671b',
    analysisDepth = 'basic',
    focusAreas = ['claims', 'patterns']
  } = params;

  const prompt = `Analyze the following content about "${query}":

Content:
${content.map(text => `---\n${text}\n---`).join('\n')}

Extract and analyze the following:

1. Key Learnings (at least ${numLearnings}):
   - Focus on specific facts, data points, and relationships
   - Each learning should be a complete, meaningful statement
   - Include technical details when available
   - Avoid generic or obvious statements

2. Content Analysis:
${focusAreas.includes('claims') ? `   - Key claims and their supporting evidence
   - Confidence level for each claim (0-1)` : ''}
${focusAreas.includes('methodologies') ? `   - Methodologies and approaches used
   - Effectiveness of different methods` : ''}
${focusAreas.includes('patterns') ? `   - Patterns of consensus or disagreement
   - Emerging trends and their implications` : ''}
${focusAreas.includes('relationships') ? `   - Relationships between key concepts
   - Dependencies and correlations` : ''}

3. Follow-up Questions (at least ${numFollowUpQuestions}):
   - Questions should explore aspects not fully covered
   - Each question should start with What, How, Why, When, Where, or Which
   - Questions should be specific and detailed

Format your response with clear sections for "Key Learnings:", "Content Analysis:", and "Follow-up Questions:"`;

  const result = await generateOutput({
    type: 'learning',
    system: systemPrompt(),
    prompt,
    temperature: 0.5,
    model,
  });

  if (result.success && 'learnings' in result.data) {
    return {
      learnings: result.data.learnings.slice(0, numLearnings),
      followUpQuestions: result.data.followUpQuestions.slice(0, numFollowUpQuestions),
      analysis: result.data.analysis,
    };
  }

  return {
    learnings: [],
    followUpQuestions: [],
  };
}

export async function generateSummary(params: {
  query: string;
  learnings: string[];
  analysis?: ContentAnalysis;
}): Promise<string> {
  const { query, learnings, analysis } = params;

  const prompt = `Write a comprehensive narrative summary about ${query} based on these key findings:

${learnings.map((l, i) => `${i + 1}. ${l}`).join('\n')}

${analysis ? `
Content Analysis Insights:
${analysis.patterns.map(p => `- ${p.type}: ${p.description}`).join('\n')}
${analysis.methodologies.map(m => `- Methodology: ${m}`).join('\n')}
` : ''}

Requirements:
1. Write in a clear, engaging style
2. Organize information logically
3. Connect related concepts
4. Highlight key relationships and implications
5. Maintain technical accuracy
6. Break into paragraphs for readability
7. Synthesize patterns and trends
8. Note areas of consensus and disagreement

Do not include any introductory text like "Here's a summary" or "Based on the findings". Just write the narrative directly.`;

  const result = await generateOutput({
    type: 'report',
    system: systemPrompt(),
    prompt,
    temperature: 0.7,
    model: 'deepseek-r1-671b', // Use deepseek for better synthesis
  });

  if (result.success && 'reportMarkdown' in result.data) {
    return result.data.reportMarkdown;
  }

  return 'Failed to generate summary.';
}
