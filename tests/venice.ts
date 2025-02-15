import { LLMClient } from '../src/ai/llm-client.js';
import { output } from '../src/output-manager.js';
import { VENICE_MODELS } from '../src/ai/models.js';

async function testVenice() {
  try {
    output.log('Testing Venice API connection...');
    output.log('Available models:', Object.keys(VENICE_MODELS));
    
    const client = new LLMClient();
    output.log('Client initialized');

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out after 30 seconds')), 30000);
    });

    const responsePromise = client.complete({
      system: 'You are a helpful assistant.',
      prompt: 'What are the key aspects of quantum computing?',
      temperature: 0.7,
      maxTokens: 100,
    });

    output.log('Request sent, waiting for response...');

    const response = await Promise.race([responsePromise, timeoutPromise]);
    output.log('Response received:', response);
    
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

testVenice().catch(error => {
  output.error('Fatal error:', error);
  output.cleanup();
  process.exit(1);
});