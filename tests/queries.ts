import { generateQueries } from '../src/ai/providers.js';
import { output } from '../src/output-manager.js';
import type { QueryType } from '../src/ai/providers.js';

async function testQueries() {
  try {
    output.log('Testing query generation...');
    
    const testCases: Array<{
      query: string;
      description: string;
      queryTypes: QueryType[];
    }> = [
      {
        query: 'dog breeds',
        description: 'Simple topic',
        queryTypes: ['comparative'],
      },
      {
        query: 'quantum computing',
        description: 'Technical topic',
        queryTypes: ['methodological', 'consensus'],
      },
    ];

    for (const testCase of testCases) {
      output.log(`\nTesting: ${testCase.description}`);
      output.log(`Query: "${testCase.query}"`);
      output.log('Query types:', testCase.queryTypes);

      const queries = await generateQueries({
        query: testCase.query,
        numQueries: 3,
        queryTypes: testCase.queryTypes,
      });

      output.log('Generated queries:', queries);
    }
    
  } catch (error) {
    if (error instanceof Error) {
      output.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    } else {
      output.error('Unknown error:', error);
    }
  } finally {
    output.log('Test complete');
    output.cleanup();
    process.exit(0);
  }
}

// Add global error handler
process.on('unhandledRejection', (error) => {
  output.error('Unhandled rejection:', error);
  output.cleanup();
  process.exit(1);
});

testQueries().catch(error => {
  output.error('Fatal error:', error);
  output.cleanup();
  process.exit(1);
});