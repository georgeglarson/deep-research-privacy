import { queryExpansionTemplate, systemPrompt } from '../prompt.js';
import { LLMClient } from './llm-client.js';
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
const client = new LLMClient({});

type OutputType = 'query' | 'learning' | 'report';
type ProcessorResult = QueryResult | LearningResult | ReportResult;

export async function generateOutput(params: {
  type: OutputType;
  system: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<
  { success: true; data: ProcessorResult } | { success: false; error: string }
> {
  try {
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

    const retryResponse = await client.complete({
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

export async function generateQueries(params: {
  query: string;
  numQueries?: number;
  learnings?: string[];
}): Promise<Array<{ query: string; researchGoal: string }>> {
  const { query, numQueries = 3, learnings = [] } = params;

  const result = await generateOutput({
    type: 'query',
    system: systemPrompt(),
    prompt: queryExpansionTemplate(query, learnings),
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

export async function processResults(params: {
  query: string;
  content: string[];
  numLearnings?: number;
  numFollowUpQuestions?: number;
}): Promise<{
  learnings: string[];
  followUpQuestions: string[];
}> {
  const { query, content, numLearnings = 3, numFollowUpQuestions = 3 } = params;

  const prompt = `Analyze the following content about "${query}":

Content:
${content.map(text => `---\n${text}\n---`).join('\n')}

Extract:
1. Key Learnings (at least ${numLearnings}):
   - Focus on specific facts, data points, and relationships
   - Each learning should be a complete, meaningful statement
   - Include technical details when available
   - Avoid generic or obvious statements

2. Follow-up Questions (at least ${numFollowUpQuestions}):
   - Questions should explore aspects not fully covered
   - Each question should start with What, How, Why, When, Where, or Which
   - Questions should be specific and detailed

Format your response with clear sections for "Key Learnings:" and "Follow-up Questions:"`;

  const result = await generateOutput({
    type: 'learning',
    system: systemPrompt(),
    prompt,
    temperature: 0.5,
  });

  if (result.success && 'learnings' in result.data) {
    return {
      learnings: result.data.learnings.slice(0, numLearnings),
      followUpQuestions: result.data.followUpQuestions.slice(
        0,
        numFollowUpQuestions,
      ),
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
}): Promise<string> {
  const { query, learnings } = params;

  const prompt = `Write a comprehensive narrative summary about ${query} based on these key findings:

${learnings.map((l, i) => `${i + 1}. ${l}`).join('\n')}

Requirements:
1. Write in a clear, engaging style
2. Organize information logically
3. Connect related concepts
4. Highlight key relationships and implications
5. Maintain technical accuracy
6. Break into paragraphs for readability

Do not include any introductory text like "Here's a summary" or "Based on the findings". Just write the narrative directly.`;

  const result = await generateOutput({
    type: 'report',
    system: systemPrompt(),
    prompt,
    temperature: 0.7,
  });

  if (result.success && 'reportMarkdown' in result.data) {
    return result.data.reportMarkdown;
  }

  return 'Failed to generate summary.';
}
