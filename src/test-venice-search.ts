import { LLMClient } from './ai/llm-client.js';
import { output } from './output-manager.js';

async function testVeniceSearch() {
  console.log('=== Testing Venice Web Search Integration ===\n');

  const client = new LLMClient({
    enableWebSearch: true,
    webSearchMode: 'on',
    enableWebCitations: true,
  });

  const testQuery = 'What are the latest developments in AI in 2025?';

  console.log(`Query: ${testQuery}\n`);

  try {
    output.log('Sending request with Venice web search enabled...');

    const response = await client.complete({
      system:
        'You are a helpful research assistant. Use web search to provide accurate, up-to-date information.',
      prompt: testQuery,
      temperature: 0.3,
      maxTokens: 1500,
      enableWebSearch: true,
      webSearchMode: 'on',
    });

    console.log('\n=== Response ===');
    console.log(response.content);

    if (response.searchResults && response.searchResults.length > 0) {
      console.log('\n=== Search Results Metadata ===');
      response.searchResults.forEach((result, idx) => {
        console.log(`\n${idx + 1}. ${result.title}`);
        console.log(`   URL: ${result.url}`);
        console.log(`   Snippet: ${result.snippet.substring(0, 100)}...`);
      });
    } else {
      console.log('\n(No search results metadata returned)');
    }

    if (response.citations && response.citations.length > 0) {
      console.log('\n=== Citations Found ===');
      console.log(response.citations.join(', '));
    } else {
      console.log('\n(No citations found in response)');
    }

    console.log('\n✅ Test completed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

testVeniceSearch();
