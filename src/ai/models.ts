/**
 * Traits that describe a model's capabilities and characteristics.
 * These help in selecting the most appropriate model for different tasks.
 */
export type ModelTrait =
  | 'function_calling_default' // Supports function calling API
  | 'default' // Good general-purpose model
  | 'fastest' // Optimized for speed
  | 'most_uncensored' // Provides unfiltered responses
  | 'most_intelligent' // Best for complex reasoning
  | 'default_code' // Optimized for code tasks
  | 'multimodal' // Can process images and PDFs
  | 'dynamic_reasoning'; // Advanced reasoning for path planning

/**
 * Specification for a Venice.ai model, including its capabilities and source.
 */
export interface ModelSpec {
  availableContextTokens: number; // Maximum context length the model supports
  traits: readonly ModelTrait[]; // Model's capabilities
  modelSource: string; // Link to model on HuggingFace
  description: string; // User-friendly description of the model's strengths
  bestFor: readonly string[]; // List of tasks this model excels at
}

export const VENICE_MODELS = {
  'llama-3.3-70b': {
    availableContextTokens: 65536,
    traits: ['function_calling_default', 'default'] as const,
    modelSource: 'https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct',
    description: 'A balanced, general-purpose model good for most tasks',
    bestFor: ['everyday research', 'general questions', 'balanced analysis'] as const
  },

  'llama-3.2-3b': {
    availableContextTokens: 131072,
    traits: ['fastest'] as const,
    modelSource: 'https://huggingface.co/meta-llama/Llama-3.2-3B',
    description: 'Our fastest model, optimized for quick responses',
    bestFor: ['quick answers', 'simple queries', 'real-time interaction'] as const
  },

  'dolphin-2.9.2-qwen2-72b': {
    availableContextTokens: 32768,
    traits: ['most_uncensored'] as const,
    modelSource:
      'https://huggingface.co/cognitivecomputations/dolphin-2.9.2-qwen2-72b',
    description: 'Provides direct, unfiltered responses',
    bestFor: ['unrestricted research', 'direct answers', 'comprehensive analysis'] as const
  },

  'llama-3.1-405b': {
    availableContextTokens: 63920,
    traits: ['most_intelligent'] as const,
    modelSource:
      'https://huggingface.co/meta-llama/Meta-Llama-3.1-405B-Instruct',
    description: 'Our most capable model for complex reasoning',
    bestFor: ['complex problems', 'detailed analysis', 'advanced reasoning'] as const
  },

  qwen32b: {
    availableContextTokens: 131072,
    traits: ['default_code'] as const,
    modelSource: 'https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct-GGUF',
    description: 'Specialized in code and technical tasks',
    bestFor: ['programming', 'code analysis', 'technical documentation'] as const
  },

  'qwen-2.5-vl': {
    availableContextTokens: 131072,
    traits: ['multimodal'] as const,
    modelSource: 'https://huggingface.co/Qwen/Qwen2.5-VL-72B-Instruct',
    description: 'Can understand and analyze images and PDFs',
    bestFor: ['image analysis', 'visual content', 'document processing'] as const
  },

  'deepseek-r1-llama-70b': {
    availableContextTokens: 65536,
    traits: ['dynamic_reasoning'] as const,
    modelSource:
      'https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-70B',
    description: 'Excellent at breaking down complex tasks',
    bestFor: ['research planning', 'step-by-step analysis', 'task breakdown'] as const
  },

  'deepseek-r1-671b': {
    availableContextTokens: 131072,
    traits: ['dynamic_reasoning', 'most_intelligent'] as const,
    modelSource: 'https://huggingface.co/deepseek-ai/DeepSeek-R1',
    description: 'Our most powerful model for research and analysis',
    bestFor: ['deep research', 'complex analysis', 'advanced planning'] as const
  },
} as const;

export type VeniceModel = keyof typeof VENICE_MODELS;

export function isValidModel(model: string): model is VeniceModel {
  return model in VENICE_MODELS;
}

export function getModelSpec(model: VeniceModel): ModelSpec {
  return VENICE_MODELS[model];
}

/**
 * Suggests the most appropriate Venice.ai model based on task requirements.
 * The system will automatically select the right model for most tasks,
 * but this function is available for manual selection if needed.
 */
export function suggestModel(params: {
  needsFunctionCalling?: boolean;
  needsLargeContext?: boolean;
  needsSpeed?: boolean;
  isCodeTask?: boolean;
}): VeniceModel {
  const { needsFunctionCalling, needsLargeContext, needsSpeed, isCodeTask } =
    params;

  if (isCodeTask) return 'qwen32b';
  if (needsSpeed) return 'llama-3.2-3b';
  if (needsFunctionCalling) return 'llama-3.3-70b';
  if (needsLargeContext) return 'llama-3.2-3b';
  return 'llama-3.3-70b';
}

/**
 * Get a list of all available models with their descriptions.
 * Useful for displaying model options to users.
 */
export function listAvailableModels(): Array<{
  name: VeniceModel;
  description: string;
  bestFor: readonly string[];
}> {
  return Object.entries(VENICE_MODELS).map(([name, spec]) => ({
    name: name as VeniceModel,
    description: spec.description,
    bestFor: spec.bestFor
  }));
}
