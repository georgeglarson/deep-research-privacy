import {
  clearModelCache,
  fetchAvailableModels,
  fetchModelTraits,
} from './ai/models.js';

async function main() {
  try {
    console.log('Fetching Venice AI models...\n');

    const models = await fetchAvailableModels();
    const traits = await fetchModelTraits();

    console.log('=== Available Models ===\n');

    for (const model of models) {
      const spec = model.model_spec;
      const caps = spec.capabilities;

      console.log(`${model.id}`);
      console.log(`  Name: ${spec.name}`);
      console.log(
        `  Context: ${spec.availableContextTokens.toLocaleString()} tokens`,
      );
      console.log(`  Traits: ${spec.traits.join(', ') || 'none'}`);
      console.log(
        `  Pricing: $${spec.pricing.input.usd}/M input, $${spec.pricing.output.usd}/M output`,
      );

      const features = [];
      if (caps.supportsFunctionCalling) features.push('Function Calling');
      if (caps.supportsResponseSchema) features.push('Response Schema');
      if (caps.supportsWebSearch) features.push('Web Search');
      if (caps.supportsVision) features.push('Vision');
      if (caps.supportsReasoning) features.push('Reasoning');
      if (caps.optimizedForCode) features.push('Code Optimized');

      console.log(`  Features: ${features.join(', ')}`);
      console.log('');
    }

    console.log('=== Trait Mappings ===\n');
    for (const [trait, modelId] of Object.entries(traits)) {
      console.log(`  ${trait}: ${modelId}`);
    }

    console.log(`\nTotal models: ${models.length}`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
