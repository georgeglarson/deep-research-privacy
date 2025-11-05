export type ModelTrait =
  | 'function_calling_default'
  | 'default'
  | 'fastest'
  | 'most_uncensored'
  | 'default_code'
  | 'default_vision';

export interface ModelCapabilities {
  optimizedForCode: boolean;
  quantization: string;
  supportsFunctionCalling: boolean;
  supportsReasoning: boolean;
  supportsResponseSchema: boolean;
  supportsVision: boolean;
  supportsWebSearch: boolean;
  supportsLogProbs: boolean;
}

export interface ModelPricing {
  input: { usd: number; diem: number };
  output: { usd: number; diem: number };
}

export interface ModelConstraints {
  temperature?: { default: number };
  top_p?: { default: number };
}

export interface ModelSpec {
  availableContextTokens: number;
  capabilities: ModelCapabilities;
  constraints: ModelConstraints;
  name: string;
  modelSource: string;
  offline: boolean;
  pricing: ModelPricing;
  traits: ModelTrait[];
}

export interface VeniceModelInfo {
  created: number;
  id: string;
  model_spec: ModelSpec;
  object: string;
  owned_by: string;
  type: string;
}

export interface ModelsResponse {
  data: VeniceModelInfo[];
  object: string;
  type: string;
}

export interface TraitsResponse {
  data: Record<ModelTrait, string>;
  object: string;
  type: string;
}

let cachedModels: VeniceModelInfo[] | null = null;
let cachedTraits: Record<ModelTrait, string> | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 1000 * 60 * 60;

export async function fetchAvailableModels(
  baseUrl: string = 'https://api.venice.ai/api/v1',
  apiKey?: string,
): Promise<VeniceModelInfo[]> {
  const now = Date.now();
  if (cachedModels && now - cacheTimestamp < CACHE_TTL) {
    return cachedModels;
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const response = await fetch(`${baseUrl}/models?type=text`, { headers });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch models: ${response.status} ${response.statusText}`,
    );
  }

  const data: ModelsResponse = await response.json();
  cachedModels = data.data.filter(m => !m.model_spec.offline);
  cacheTimestamp = now;

  return cachedModels;
}

export async function fetchModelTraits(
  baseUrl: string = 'https://api.venice.ai/api/v1',
  apiKey?: string,
): Promise<Record<ModelTrait, string>> {
  const now = Date.now();
  if (cachedTraits && now - cacheTimestamp < CACHE_TTL) {
    return cachedTraits;
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const response = await fetch(`${baseUrl}/models/traits?type=text`, {
    headers,
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch model traits: ${response.status} ${response.statusText}`,
    );
  }

  const data: TraitsResponse = await response.json();
  cachedTraits = data.data;

  return cachedTraits;
}

export async function getModelByTrait(
  trait: ModelTrait,
  baseUrl?: string,
  apiKey?: string,
): Promise<string> {
  const traits = await fetchModelTraits(baseUrl, apiKey);
  return traits[trait];
}

export async function isValidModel(
  model: string,
  baseUrl?: string,
  apiKey?: string,
): Promise<boolean> {
  const models = await fetchAvailableModels(baseUrl, apiKey);
  return models.some(m => m.id === model);
}

export async function getModelSpec(
  model: string,
  baseUrl?: string,
  apiKey?: string,
): Promise<ModelSpec> {
  const models = await fetchAvailableModels(baseUrl, apiKey);
  const modelInfo = models.find(m => m.id === model);

  if (!modelInfo) {
    throw new Error(`Model not found: ${model}`);
  }

  return modelInfo.model_spec;
}

export async function suggestModel(params: {
  needsFunctionCalling?: boolean;
  needsLargeContext?: boolean;
  needsSpeed?: boolean;
  isCodeTask?: boolean;
  needsVision?: boolean;
  needsUncensored?: boolean;
  baseUrl?: string;
  apiKey?: string;
}): Promise<string> {
  const {
    needsFunctionCalling,
    needsLargeContext,
    needsSpeed,
    isCodeTask,
    needsVision,
    needsUncensored,
    baseUrl,
    apiKey,
  } = params;

  if (needsUncensored) {
    return await getModelByTrait('most_uncensored', baseUrl, apiKey);
  }
  if (needsVision) {
    return await getModelByTrait('default_vision', baseUrl, apiKey);
  }
  if (isCodeTask) {
    return await getModelByTrait('default_code', baseUrl, apiKey);
  }
  if (needsSpeed) {
    return await getModelByTrait('fastest', baseUrl, apiKey);
  }
  if (needsFunctionCalling) {
    return await getModelByTrait('function_calling_default', baseUrl, apiKey);
  }

  if (needsLargeContext) {
    const models = await fetchAvailableModels(baseUrl, apiKey);
    const sorted = models.sort(
      (a, b) =>
        b.model_spec.availableContextTokens -
        a.model_spec.availableContextTokens,
    );
    return sorted[0].id;
  }

  return await getModelByTrait('default', baseUrl, apiKey);
}

export async function listAvailableModels(
  baseUrl?: string,
  apiKey?: string,
): Promise<string[]> {
  const models = await fetchAvailableModels(baseUrl, apiKey);
  return models.map(m => m.id);
}

export function clearModelCache(): void {
  cachedModels = null;
  cachedTraits = null;
  cacheTimestamp = 0;
}
