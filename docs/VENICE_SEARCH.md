# Venice Web Search Integration

## Overview

Deep Research now supports **Venice AI's built-in web search grounding**, providing AI-powered search with automatic source citations. This gives you two search options:

1. **Brave Search** (default) - Raw web search results, privacy-focused
2. **Venice Search** - AI-grounded search with built-in synthesis and citations

## Features

### Venice Web Search Capabilities

✅ **AI-Grounded Results** - LLM analyzes and synthesizes search results  
✅ **Automatic Citations** - `[REF]0[/REF]` style inline citations  
✅ **Source Metadata** - Returns titles, URLs, and snippets from sources  
✅ **Natural Language** - Results written in natural, readable format  
✅ **Real-Time Data** - Access to current web information

### How It Works

When Venice search is enabled:
1. Your query is sent to Venice AI with `enable_web_search: "on"`
2. Venice performs web searches in the background
3. Results are analyzed and synthesized by the LLM
4. Response includes both narrative and source metadata
5. Citations are automatically extracted

## Usage

### Command Line

You can specify the search provider when running research:

```bash
# Use Venice search (AI-grounded)
npm start "latest AI developments" 3 2 venice

# Use Brave search (raw results)
npm start "latest AI developments" 3 2 brave

# Interactive mode prompts for provider
npm start
```

**Arguments:**
1. Query (required)
2. Breadth (default: 3)
3. Depth (default: 2)
4. Search provider: `brave` or `venice` (default: `brave`)

### Environment Variables

Add to your `.env` file:

```bash
# Required
VENICE_API_KEY=your_api_key_here

# Optional - only needed for Brave search
BRAVE_API_KEY=your_brave_api_key_here

# Default search provider
SEARCH_PROVIDER=venice
```

### Programmatic Usage

```typescript
import { LLMClient } from './ai/llm-client.js';

// Option 1: Configure client with web search
const client = new LLMClient({
  enableWebSearch: true,
  webSearchMode: 'auto',  // 'on', 'off', or 'auto'
  enableWebCitations: true,
});

const response = await client.complete({
  system: 'You are a research assistant.',
  prompt: 'What are the latest developments in quantum computing?',
  temperature: 0.3,
  maxTokens: 2000,
});

// Access search results metadata
if (response.searchResults) {
  console.log('Sources used:');
  response.searchResults.forEach(result => {
    console.log(`- ${result.title}: ${result.url}`);
  });
}

// Access citations
if (response.citations) {
  console.log('Citations:', response.citations);
}
```

```typescript
// Option 2: Use VeniceSearchProvider directly
import { VeniceSearchProvider } from './search/providers.js';

const provider = new VeniceSearchProvider();
const results = await provider.search('artificial intelligence trends');
```

## Search Modes

Venice supports three search modes:

| Mode | Description | Use Case |
|------|-------------|----------|
| `off` | No web search | When you don't need current data |
| `on` | Always search | For research tasks requiring fresh data |
| `auto` | LLM decides | Model determines if search is needed |

**Recommendation:** Use `auto` for general research, `on` for current events.

## Configuration Options

### LLMClient Options

```typescript
interface LLMConfig {
  enableWebSearch?: boolean;        // Enable/disable web search
  webSearchMode?: 'off' | 'on' | 'auto';  // Search behavior
  enableWebCitations?: boolean;     // Include citation markers
}
```

### Per-Request Override

```typescript
await client.complete({
  prompt: 'Your query',
  enableWebSearch: true,    // Override client default
  webSearchMode: 'on',      // Override client default
});
```

## Response Format

### With Search Results

```typescript
{
  content: "According to recent reports [REF]0[/REF], AI development...",
  model: "llama-3.3-70b",
  timestamp: "2025-01-15T10:30:00.000Z",
  searchResults: [
    {
      title: "Latest AI Breakthroughs",
      url: "https://example.com/article",
      snippet: "Recent developments in AI include..."
    }
  ],
  citations: ["[REF]0[/REF]", "[REF]1[/REF]"]
}
```

### Citation Format

Venice uses the format `[REF]N[/REF]` where N is a numeric reference:

- `[REF]0[/REF]` - First source
- `[REF]1[/REF]` - Second source
- etc.

## Comparison: Venice vs Brave Search

| Feature | Venice Search | Brave Search |
|---------|---------------|--------------|
| **Result Format** | AI-synthesized narrative | Raw search results |
| **Citations** | Automatic inline citations | Manual source tracking |
| **Accuracy** | AI-grounded interpretation | Exact source text |
| **Speed** | Single API call | Separate search + LLM calls |
| **Cost** | Higher (LLM + search) | Lower (search only) |
| **Privacy** | Venice processes data | Brave no-log policy |
| **Best For** | Complex research, synthesis | Fact-checking, raw data |

## Pricing

Venice web search has additional usage-based pricing beyond standard LLM costs. See [Venice pricing docs](https://docs.venice.ai/overview/pricing#web-search-and-scraping).

**Cost Optimization Tips:**
- Use `auto` mode to let the model decide when search is needed
- Use Brave search for large-scale data gathering
- Use Venice search for final synthesis and citation

## Model Compatibility

All current Venice models support web search:

✅ llama-3.3-70b (default)  
✅ qwen3-235b (code-optimized)  
✅ mistral-31-24b (vision)  
✅ qwen3-4b (small/fast)  
✅ venice-uncensored  
✅ And more...

Check model capabilities:
```bash
npm run models
```

## Testing

Test Venice search integration:

```bash
npm run test:venice-search
```

This will:
1. Query Venice AI with web search enabled
2. Display the AI-generated response
3. Show search results metadata (if available)
4. Extract and display citations

## Examples

### Example 1: Current Events Research

```typescript
const response = await client.complete({
  system: 'You are a news analyst.',
  prompt: 'What are the major tech news stories this week?',
  enableWebSearch: true,
  webSearchMode: 'on',
  temperature: 0.3,
});

console.log(response.content);
// "This week's major tech stories include [REF]0[/REF]..."
```

### Example 2: Fact-Checking

```typescript
const response = await client.complete({
  system: 'You are a fact-checker. Verify claims using web search.',
  prompt: 'Is it true that [claim]? Find recent evidence.',
  enableWebSearch: true,
  webSearchMode: 'on',
});

if (response.searchResults) {
  console.log(`Verified using ${response.searchResults.length} sources`);
}
```

### Example 3: Hybrid Strategy

```typescript
import { setSearchProvider } from './search.js';

// Phase 1: Gather raw data with Brave
setSearchProvider('brave');
const rawResults = await search('quantum computing breakthroughs');

// Phase 2: Synthesize with Venice
setSearchProvider('venice');
const synthesis = await search('summarize quantum computing breakthroughs');
```

## Troubleshooting

### "Model doesn't support web search"

**Cause:** Selected model lacks `supportsWebSearch` capability  
**Solution:** Use a compatible model (check with `npm run models`)

### No search results metadata

**Cause:** Venice may not always return `search_results` in response  
**Solution:** This is normal - the content still includes grounded information

### Empty citations array

**Cause:** Response doesn't use `[REF]` citation format  
**Solution:** Enable `enableWebCitations: true` in config

### High API costs

**Cause:** Web search adds usage-based charges  
**Solution:** 
- Use `auto` mode instead of `on`
- Use Brave for bulk searches
- Reserve Venice search for final synthesis

## Best Practices

1. **Use the right tool:**
   - Venice: Complex synthesis, current events, citations
   - Brave: Large-scale data gathering, fact-checking

2. **Optimize costs:**
   - Start with Brave search for breadth
   - Use Venice search for depth and synthesis

3. **Enable citations:**
   - Always set `enableWebCitations: true` for research
   - Makes source tracking easier

4. **Check model capabilities:**
   - Run `npm run models` to see which models support search
   - Choose models optimized for your task

5. **Handle missing metadata gracefully:**
   - `searchResults` may be undefined
   - `citations` may be empty
   - Content is still grounded even without metadata

## Further Reading

- [Venice API Documentation](https://docs.venice.ai)
- [Web Search Parameters](https://docs.venice.ai/api-reference/api-spec#venice-parameters)
- [Model Capabilities](https://docs.venice.ai/overview/models)
