export interface StructuredQuery {
  query: string;
  researchGoal: string;
  rationale?: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface StructuredLearning {
  insight: string;
  confidence: number;
  sources?: string[];
  novelty?: 'high' | 'medium' | 'low';
  category?: string;
}

export interface StructuredFollowUp {
  question: string;
  rationale: string;
  priority: 'high' | 'medium' | 'low';
  expectedInsight?: string;
}

export interface StructuredQueriesResponse {
  queries: StructuredQuery[];
  reasoning?: string;
}

export interface StructuredLearningsResponse {
  learnings: StructuredLearning[];
  followUpQuestions: StructuredFollowUp[];
  contradictions?: string[];
  uncertainties?: string[];
  summary?: string;
}

export interface StructuredReportResponse {
  title: string;
  summary: string;
  sections: Array<{
    heading: string;
    content: string;
    sources?: string[];
  }>;
  keyTakeaways: string[];
  citations?: Array<{
    id: number;
    source: string;
    accessed: string;
  }>;
}

export const QUERY_SCHEMA = {
  type: 'object',
  properties: {
    queries: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description:
              'A specific, focused research question starting with What, How, Why, When, Where, or Which',
          },
          researchGoal: {
            type: 'string',
            description: 'What this query aims to discover or understand',
          },
          rationale: {
            type: 'string',
            description: 'Why this question is important for the research',
          },
          priority: {
            type: 'string',
            enum: ['high', 'medium', 'low'],
            description: 'Importance level of this query',
          },
        },
        required: ['query', 'researchGoal'],
      },
      minItems: 1,
      maxItems: 10,
    },
    reasoning: {
      type: 'string',
      description: 'Brief explanation of the query selection strategy',
    },
  },
  required: ['queries'],
} as const;

export const LEARNING_SCHEMA = {
  type: 'object',
  properties: {
    learnings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          insight: {
            type: 'string',
            description:
              'A specific, factual insight with concrete details and evidence',
          },
          confidence: {
            type: 'number',
            minimum: 0,
            maximum: 1,
            description:
              'Confidence level (0-1) based on evidence quality and source credibility',
          },
          sources: {
            type: 'array',
            items: { type: 'string' },
            description: 'URLs or source identifiers for this insight',
          },
          novelty: {
            type: 'string',
            enum: ['high', 'medium', 'low'],
            description: 'How novel or surprising this insight is',
          },
          category: {
            type: 'string',
            description: 'Topic category or theme for this insight',
          },
        },
        required: ['insight', 'confidence'],
      },
      minItems: 1,
    },
    followUpQuestions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          question: {
            type: 'string',
            description:
              'A specific follow-up question to deepen understanding',
          },
          rationale: {
            type: 'string',
            description: 'Why this follow-up question matters',
          },
          priority: {
            type: 'string',
            enum: ['high', 'medium', 'low'],
            description: 'Urgency/importance of this question',
          },
          expectedInsight: {
            type: 'string',
            description: 'What kind of information this question might reveal',
          },
        },
        required: ['question', 'rationale', 'priority'],
      },
    },
    contradictions: {
      type: 'array',
      items: { type: 'string' },
      description: 'Any contradictions found across sources',
    },
    uncertainties: {
      type: 'array',
      items: { type: 'string' },
      description: 'Areas where information is unclear or disputed',
    },
    summary: {
      type: 'string',
      description: 'Brief synthesis of key findings',
    },
  },
  required: ['learnings', 'followUpQuestions'],
} as const;

export const REPORT_SCHEMA = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      description: 'Clear, descriptive title for the research report',
    },
    summary: {
      type: 'string',
      description: 'Executive summary of key findings (2-3 paragraphs)',
    },
    sections: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          heading: { type: 'string' },
          content: { type: 'string' },
          sources: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        required: ['heading', 'content'],
      },
      minItems: 1,
    },
    keyTakeaways: {
      type: 'array',
      items: { type: 'string' },
      description: 'Bullet-point list of main conclusions',
      minItems: 3,
    },
    citations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          source: { type: 'string' },
          accessed: { type: 'string' },
        },
        required: ['id', 'source'],
      },
    },
  },
  required: ['title', 'summary', 'sections', 'keyTakeaways'],
} as const;
