export interface ResearchEvent {
  type: string;
  timestamp: number;
  data: any;
}

export interface APICallEvent extends ResearchEvent {
  type: 'api_call';
  data: {
    provider: string;
    endpoint: string;
    parameters: Record<string, any>;
    status: 'started' | 'completed' | 'error';
    response?: any;
    error?: string;
  };
}

export interface SearchResultEvent extends ResearchEvent {
  type: 'search_result';
  data: {
    query: string;
    provider: string;
    results: Array<{
      title: string;
      url: string;
      snippet: string;
    }>;
  };
}

export interface LearningEvent extends ResearchEvent {
  type: 'learning';
  data: {
    topic: string;
    content: string;
    confidence: number;
    sources: string[];
  };
}

export interface ProgressEvent extends ResearchEvent {
  type: 'progress';
  data: {
    stage: string;
    percentage: number;
    message: string;
  };
}

export interface CompletionEvent extends ResearchEvent {
  type: 'completion';
  data: {
    summary: string;
    learnings: string[];
    sources: string[];
    outputFile: string;
  };
}

export type DeepResearchEvent = 
  | APICallEvent 
  | SearchResultEvent 
  | LearningEvent 
  | ProgressEvent
  | CompletionEvent;

export interface EventEmitter {
  on(event: string, listener: (event: DeepResearchEvent) => void): void;
  off(event: string, listener: (event: DeepResearchEvent) => void): void;
  emit(event: string, ...args: any[]): void;
}