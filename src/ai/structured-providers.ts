import { LLMClient } from './llm-client.js';
import {
  LearningProcessor,
  LearningResult,
  QueryProcessor,
  QueryResult,
  ReportProcessor,
  ReportResult,
} from './response-processor.js';
import {
  LEARNING_SCHEMA,
  QUERY_SCHEMA,
  REPORT_SCHEMA,
  StructuredLearningsResponse,
  StructuredQueriesResponse,
  StructuredReportResponse,
} from './schemas.js';

const client = new LLMClient({});
const queryProcessor = new QueryProcessor();
const learningProcessor = new LearningProcessor();
const reportProcessor = new ReportProcessor();

type OutputType = 'query' | 'learning' | 'report';
type StructuredResult =
  | StructuredQueriesResponse
  | StructuredLearningsResponse
  | StructuredReportResponse;
type LegacyResult = QueryResult | LearningResult | ReportResult;

export async function generateStructuredOutput(params: {
  type: OutputType;
  system: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  useStructured?: boolean;
}): Promise<
  | { success: true; data: StructuredResult; isStructured: true }
  | { success: true; data: LegacyResult; isStructured: false }
  | { success: false; error: string; isStructured: boolean }
> {
  const { useStructured = true } = params;

  const schema =
    params.type === 'query'
      ? QUERY_SCHEMA
      : params.type === 'learning'
        ? LEARNING_SCHEMA
        : REPORT_SCHEMA;

  try {
    const response = await client.complete({
      system: params.system,
      prompt: params.prompt,
      temperature: params.temperature || 0.7,
      maxTokens: params.maxTokens,
      responseSchema: useStructured ? schema : undefined,
    });

    if (response.structuredOutput && useStructured) {
      return {
        success: true,
        data: response.structuredOutput as StructuredResult,
        isStructured: true,
      };
    }

    const legacyProcessor =
      params.type === 'query'
        ? queryProcessor
        : params.type === 'learning'
          ? learningProcessor
          : reportProcessor;

    const result = legacyProcessor.process(response.content);

    if (result.success) {
      return { success: true, data: result, isStructured: false };
    }

    return {
      success: false,
      error: result.error || 'Processing failed',
      isStructured: false,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      isStructured: false,
    };
  }
}

export function convertStructuredToLegacy(
  type: OutputType,
  structured: StructuredResult,
): LegacyResult {
  if (type === 'query') {
    const data = structured as StructuredQueriesResponse;
    return {
      rawContent: JSON.stringify(structured),
      success: true,
      queries: data.queries.map(q => ({
        query: q.query,
        researchGoal: q.researchGoal,
      })),
    } as QueryResult;
  }

  if (type === 'learning') {
    const data = structured as StructuredLearningsResponse;
    return {
      rawContent: JSON.stringify(structured),
      success: true,
      learnings: data.learnings.map(l => l.insight),
      followUpQuestions: data.followUpQuestions.map(q => q.question),
    } as LearningResult;
  }

  const data = structured as StructuredReportResponse;
  const markdown = [
    `# ${data.title}`,
    '',
    '## Summary',
    data.summary,
    '',
    ...data.sections.flatMap(section => [
      `## ${section.heading}`,
      section.content,
      '',
    ]),
    '## Key Takeaways',
    ...data.keyTakeaways.map(t => `- ${t}`),
  ].join('\n');

  return {
    rawContent: JSON.stringify(structured),
    success: true,
    reportMarkdown: markdown,
  } as ReportResult;
}
