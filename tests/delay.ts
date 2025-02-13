/**
 * Simple test to verify async delay behavior
 */

// Helper function to simulate an API call
async function mockApiCall(id: number): Promise<string> {
  console.log(`[${new Date().toISOString()}] Starting request ${id}`);
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate work
  return `Result from request ${id}`;
}

// Function to enforce delay between requests
async function delayedRequest(id: number, delayMs: number): Promise<string> {
  const result = await mockApiCall(id);
  console.log(`[${new Date().toISOString()}] Completed request ${id}`);
  console.log(`[${new Date().toISOString()}] Waiting ${delayMs}ms before next request...`);
  await new Promise(resolve => setTimeout(resolve, delayMs));
  return result;
}

// Test sequential requests with delay
async function runTest() {
  console.log('Starting rate limit test...\n');
  
  const requests = [1, 2, 3, 4, 5];
  const delayMs = 2000; // 2 second delay between requests
  
  for (const id of requests) {
    const result = await delayedRequest(id, delayMs);
    console.log(`[${new Date().toISOString()}] Got result: ${result}\n`);
  }
  
  console.log('Test complete!');
}

// Run the test
runTest().catch(console.error);