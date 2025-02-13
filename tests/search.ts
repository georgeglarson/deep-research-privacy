/**
 * Test Search Utility
 * 
 * This file serves three main purposes:
 * 
 * 1. Quick Verification Tool
 *    - Test that Brave Search integration is working
 *    - Verify API keys are properly configured
 *    - Check rate limiting behavior
 *    - Ensure proper process cleanup
 * 
 * 2. Developer Example
 *    - Shows how to use the search functionality
 *    - Demonstrates proper error handling patterns
 *    - Illustrates logging best practices
 *    - Shows how to clean up resources
 * 
 * 3. Development Aid
 *    - Helps debug search issues
 *    - Tests changes to rate limiting
 *    - Verifies API response handling
 * 
 * Usage:
 *   npx tsx --env-file=.env tests/search.ts
 *   # Or with Docker:
 *   docker-compose run deep-research npx tsx tests/search.ts
 */

import { search } from '../src/search.js';
import { output } from '../src/output-manager.js';

async function testSearch() {
  try {
    // Example query demonstrating scientific search
    output.log('\nTesting web search...');
    const query = 'quantum computing applications';
    output.log(`Query: "${query}"`);
    
    // Execute search and handle results
    const results = await search(query);
    output.log(`Found ${results.length} results`);

    // Display results in a clear, structured format
    results.forEach((result, i) => {
      output.log(`\nResult ${i + 1}:`);
      output.log(`Content: ${result.content}`);
      output.log(`Source: ${result.source}`);
    });

  } catch (error) {
    // Demonstrate proper error handling
    output.log('Error:', error);
  } finally {
    // Clean up and exit
    output.cleanup();
    process.exit(0);
  }
}

// Run the demonstration with error handling
testSearch().catch(error => {
  output.log('Fatal error:', error);
  output.cleanup();
  process.exit(1);
});