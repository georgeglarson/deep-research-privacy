import {
  StructuredLearningsResponse,
  StructuredQueriesResponse,
} from './ai/schemas.js';
import { generateStructuredOutput } from './ai/structured-providers.js';
import { output } from './output-manager.js';

async function testStructuredOutputs() {
  console.log('=== Testing Structured Outputs (Response Schema) ===\n');

  console.log('Test 1: Structured Query Generation');
  console.log('━'.repeat(60));

  const queryTest = await generateStructuredOutput({
    type: 'query',
    system:
      'You are a research assistant. Generate diverse, specific research questions.',
    prompt:
      'Generate 5 research questions about artificial intelligence and its impact on healthcare.',
    temperature: 0.7,
    maxTokens: 1500,
    useStructured: true,
  });

  if (queryTest.success && queryTest.isStructured) {
    const data = queryTest.data as StructuredQueriesResponse;
    console.log(`\n✅ Structured query generation successful!`);
    console.log(`Generated ${data.queries.length} queries:\n`);

    data.queries.forEach((q, idx) => {
      console.log(`${idx + 1}. ${q.query}`);
      console.log(`   Goal: ${q.researchGoal}`);
      if (q.rationale) console.log(`   Rationale: ${q.rationale}`);
      if (q.priority) console.log(`   Priority: ${q.priority}`);
      console.log('');
    });

    if (data.reasoning) {
      console.log(`Strategy: ${data.reasoning}\n`);
    }
  } else if (queryTest.success) {
    console.log(
      '⚠️  Structured output not available, fell back to text parsing\n',
    );
  } else {
    console.log(`❌ Query test failed: ${queryTest.error}\n`);
  }

  console.log('\nTest 2: Structured Learning Extraction');
  console.log('━'.repeat(60));

  const learningTest = await generateStructuredOutput({
    type: 'learning',
    system:
      'You are an expert research analyst. Extract key insights with confidence scores.',
    prompt: `Analyze this information and extract learnings:
    
"Recent studies show that AI-powered diagnostic tools can detect diseases 
earlier than traditional methods. A 2024 study found 94% accuracy in early 
cancer detection using deep learning models. However, concerns remain about 
data privacy and algorithmic bias in medical AI systems."

Extract key learnings with confidence scores and generate follow-up questions.`,
    temperature: 0.3,
    maxTokens: 2000,
    useStructured: true,
  });

  if (learningTest.success && learningTest.isStructured) {
    const data = learningTest.data as StructuredLearningsResponse;
    console.log(`\n✅ Structured learning extraction successful!`);
    console.log(`\nLearnings (${data.learnings.length}):\n`);

    data.learnings.forEach((learning, idx) => {
      console.log(`${idx + 1}. ${learning.insight}`);
      console.log(`   Confidence: ${(learning.confidence * 100).toFixed(1)}%`);
      if (learning.novelty) console.log(`   Novelty: ${learning.novelty}`);
      if (learning.category) console.log(`   Category: ${learning.category}`);
      if (learning.sources && learning.sources.length > 0) {
        console.log(`   Sources: ${learning.sources.join(', ')}`);
      }
      console.log('');
    });

    if (data.followUpQuestions.length > 0) {
      console.log(
        `\nFollow-up Questions (${data.followUpQuestions.length}):\n`,
      );
      data.followUpQuestions.forEach((q, idx) => {
        console.log(`${idx + 1}. ${q.question}`);
        console.log(`   Priority: ${q.priority}`);
        console.log(`   Rationale: ${q.rationale}`);
        if (q.expectedInsight) {
          console.log(`   Expected Insight: ${q.expectedInsight}`);
        }
        console.log('');
      });
    }

    if (data.contradictions && data.contradictions.length > 0) {
      console.log('\nContradictions Found:');
      data.contradictions.forEach(c => console.log(`  - ${c}`));
    }

    if (data.uncertainties && data.uncertainties.length > 0) {
      console.log('\nUncertainties:');
      data.uncertainties.forEach(u => console.log(`  - ${u}`));
    }

    if (data.summary) {
      console.log(`\nSummary: ${data.summary}\n`);
    }
  } else if (learningTest.success) {
    console.log(
      '⚠️  Structured output not available, fell back to text parsing\n',
    );
  } else {
    console.log(`❌ Learning test failed: ${learningTest.error}\n`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('Test Summary:');
  console.log('='.repeat(60));

  const bothStructured =
    queryTest.success &&
    queryTest.isStructured &&
    learningTest.success &&
    learningTest.isStructured;

  if (bothStructured) {
    console.log('✅ All tests passed with structured outputs!');
    console.log('\nBenefits of structured outputs:');
    console.log('  • Type-safe data structures');
    console.log('  • Confidence scores for insights');
    console.log('  • Priority levels for questions');
    console.log('  • No brittle text parsing');
    console.log('  • Automatic validation via JSON schema');
  } else if (queryTest.success && learningTest.success) {
    console.log('⚠️  Tests passed but using text parsing fallback');
    console.log('  Model may not support response schema.');
    console.log('  Try using qwen3-235b or mistral-31-24b models.');
  } else {
    console.log('❌ Some tests failed');
  }

  console.log('');
}

testStructuredOutputs().catch(error => {
  console.error('Test failed with error:', error);
  process.exit(1);
});
