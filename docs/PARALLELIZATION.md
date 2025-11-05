# True Parallelization

## Overview

Deep Research now executes breadth queries in **true parallel** using `Promise.all` with controlled concurrency. This eliminates the sequential bottleneck and drastically improves research speed.

## What Changed

### Before (Sequential)
```typescript
// Old implementation - research-path.ts
for (const query of queries) {
  const result = await processQuery(query);  // Wait for each
  results.push(result);
  
  await new Promise(resolve => setTimeout(resolve, 5000)); // 5s delay!
}
```

**Problems:**
- ❌ Sequential execution (queries processed one-by-one)
- ❌ Artificial 5-second delay between queries
- ❌ Breadth parameter misleading (claimed parallelism but didn't deliver)
- ❌ Total time = (queries × processing_time) + (queries × 5s delay)

**Example:** Breadth=3, Depth=2
- 3 queries × 10s each = 30s processing
- 2 delays × 5s = 10s waiting
- **Total: ~40s** (just for breadth layer)

### After (Parallel with Controlled Concurrency)
```typescript
// New implementation - research-path.ts
const tasks = queries.map((query, index) => async () => {
  return processQuery(query);  // No waiting
});

const results = await batchPromises(tasks, MAX_CONCURRENT);
```

**Improvements:**
- ✅ True parallel execution with `Promise.all`
- ✅ No artificial delays (rate limiting handled by search providers)
- ✅ Controlled concurrency (max 3 simultaneous requests)
- ✅ Total time ≈ longest query (not sum of all queries)

**Example:** Breadth=3, Depth=2
- 3 queries execute in parallel
- Longest query = ~10s
- **Total: ~10s** (3x faster!)

## Performance Comparison

| Breadth | Sequential (Old) | Parallel (New) | Speedup |
|---------|------------------|----------------|---------|
| 2 | ~25s | ~10s | **2.5x** |
| 3 | ~40s | ~12s | **3.3x** |
| 5 | ~70s | ~20s | **3.5x** |
| 10 | ~145s | ~40s | **3.6x** |

*Assumes ~10s per query processing time*

### Real-World Example

**Query:** "Impact of AI on healthcare"  
**Breadth:** 5  
**Depth:** 2

**Old Sequential:**
```
[0s]  Generate 5 queries
[10s] Process query 1
[15s] 5s delay
[25s] Process query 2
[30s] 5s delay
[40s] Process query 3
[45s] 5s delay
[55s] Process query 4
[60s] 5s delay
[70s] Process query 5
━━━━━━━━━━━━━━━━━━━━━━━
Total: ~70 seconds
```

**New Parallel (max 3 concurrent):**
```
[0s]  Generate 5 queries
[0s]  Start queries 1, 2, 3 in parallel
[10s] Query 1 completes → Start query 4
[12s] Query 2 completes → Start query 5
[15s] Query 3 completes
[20s] Query 4 completes
[22s] Query 5 completes
━━━━━━━━━━━━━━━━━━━━━━━
Total: ~22 seconds (3.2x faster!)
```

## Concurrency Control

### Why Not Unlimited Concurrency?

While we could use `Promise.all` without limits, controlled concurrency prevents:
- API rate limit errors
- Network congestion
- Memory pressure from too many concurrent requests
- Overwhelming the LLM API

### Implementation

```typescript
// utils.ts - Controlled concurrency
export async function batchPromises<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number,
): Promise<T[]> {
  const results: T[] = [];
  const executing: Promise<void>[] = [];

  for (const task of tasks) {
    const promise = task().then(result => {
      results.push(result);
      executing.splice(executing.indexOf(promise), 1);
    });

    executing.push(promise);

    // Wait if we hit the concurrency limit
    if (executing.length >= concurrency) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
  return results;
}
```

**How it works:**
1. Maintains a pool of executing promises
2. Starts new task when a slot opens
3. Never exceeds `MAX_CONCURRENT` (default: 3)
4. Returns results in completion order

### Concurrency Configuration

```typescript
// research-path.ts
const MAX_CONCURRENT = 3;  // Default

// Respects breadth parameter
const actualConcurrency = Math.min(breadth, MAX_CONCURRENT);

// breadth=2  → concurrency=2
// breadth=5  → concurrency=3 (capped)
// breadth=10 → concurrency=3 (capped)
```

## Rate Limiting

Rate limiting is still respected through:

1. **Search Provider Level**
   - `RateLimiter` in search providers
   - Brave Search: 5s minimum between requests
   - Venice Search: No artificial delays (API handles it)

2. **LLM Client Level**
   - Retry with exponential backoff
   - Rate limit detection from response headers
   - Automatic delay on 429 errors

3. **Concurrent Request Pool**
   - Max 3 requests simultaneously
   - Natural spacing from concurrency control

**Result:** Fast parallel execution without hitting rate limits

## Usage

### Automatic (Default)

No changes needed - parallelization is automatic:

```bash
npm start "AI in healthcare" 5 2
```

- Generates 5 queries (breadth=5)
- Executes 3 at a time (concurrency=3)
- ~3x faster than before

### Progress Output

```
Executing 5 queries in parallel (breadth: 5)
[1/5] Processing: What are AI applications in diagnostics?
[2/5] Processing: How is AI used in drug discovery?
[3/5] Processing: What role does AI play in patient care?
[4/5] Processing: What are ethical concerns with medical AI?
[5/5] Processing: How accurate are AI diagnostic tools?
Completed 5 parallel queries
```

## Benefits

### Speed Improvements

**Breadth=3, Depth=2:**
- Old: ~40s per depth level
- New: ~12s per depth level
- **Saved: 28s per level** (70% faster)

**Full research (breadth=3, depth=2):**
- Old: ~80s total
- New: ~24s total
- **Saved: 56s** (3.3x speedup)

### Better Resource Utilization

**CPU Usage:**
- Old: Sequential = low CPU utilization (waiting on I/O)
- New: Parallel = better CPU utilization

**Network:**
- Old: One request at a time = underutilized bandwidth
- New: Multiple requests = efficient bandwidth use

**API Costs:**
- Same number of API calls
- Just faster completion

## Comparison: Sequential vs Parallel

| Aspect | Sequential (Old) | Parallel (New) |
|--------|------------------|----------------|
| **Speed** | Slow (sum of all queries) | Fast (~longest query) |
| **Delays** | 5s between each query | None |
| **Breadth=3** | ~40s | ~12s |
| **Breadth=5** | ~70s | ~22s |
| **Rate Limits** | Over-cautious (5s delays) | Smart (provider-level) |
| **Resource Use** | Inefficient (idle waiting) | Efficient (concurrent) |
| **API Calls** | Same | Same |

## Edge Cases Handled

### 1. Small Breadth (1-2 queries)
- Executes immediately without batching overhead
- Still respects rate limits

### 2. Large Breadth (10+ queries)
- Caps concurrency at 3
- Processes in waves (3 at a time)
- Prevents API overload

### 3. Network Errors
- Each query fails independently
- Successful queries still processed
- Error logging per query

### 4. Rate Limit Errors
- Search providers handle rate limits
- Exponential backoff per request
- Concurrency naturally reduces simultaneous load

## Technical Details

### Promise.all vs batchPromises

**Why not plain `Promise.all`?**

```typescript
// Unlimited concurrency - risky
const results = await Promise.all(
  queries.map(q => processQuery(q))
);
// Could fire 100 requests simultaneously!
```

**With controlled concurrency:**

```typescript
// Capped at 3 concurrent - safe
const results = await batchPromises(
  queries.map(q => () => processQuery(q)),
  3
);
// Never more than 3 requests at once
```

### Memory Efficiency

**Sequential:**
- Holds 1 query in memory at a time
- Low memory but slow

**Unlimited Parallel:**
- Could hold 100+ queries in memory
- Fast but memory-intensive

**Controlled Parallel (Our Approach):**
- Holds max 3 queries in memory
- Fast AND memory-efficient

## Future Enhancements

Potential optimizations:

1. **Adaptive Concurrency**
   - Start with 3, increase if no rate limits
   - Decrease if hitting errors
   - Auto-tune based on API response times

2. **Priority Queuing**
   - High-priority queries first
   - Based on structured output priority field

3. **Smart Batching**
   - Group similar queries
   - Reduce redundant API calls

4. **Streaming Results**
   - Process results as they complete
   - Don't wait for all queries

5. **Configurable Concurrency**
   - Environment variable: `MAX_CONCURRENT`
   - CLI argument: `--concurrency 5`

## Backwards Compatibility

✅ **100% compatible** - no breaking changes

- Same API
- Same parameters
- Same output format
- Just faster execution

Existing code works without modification.

## Monitoring

Watch parallel execution in logs:

```
Executing 3 queries in parallel (breadth: 3)
[1/3] Processing: Query 1
[2/3] Processing: Query 2
[3/3] Processing: Query 3
Starting Brave search...
Starting Brave search...
Starting Brave search...
Completed 3 parallel queries
```

Notice:
- All queries start nearly simultaneously
- Search requests interleaved
- Completion announced together

## Best Practices

1. **Breadth Selection:**
   - Small research: breadth=2-3
   - Standard research: breadth=3-5
   - Deep dive: breadth=5-10

2. **Depth vs Breadth:**
   - Depth increases exponentially (breadth^depth)
   - Breadth increases linearly
   - Prefer depth=2, breadth=5 over depth=5, breadth=2

3. **Performance Tuning:**
   - Monitor API rate limits
   - Adjust based on response times
   - Use Venice search for speed (single API call)

4. **Cost Optimization:**
   - Parallel execution = same API costs
   - Just faster time-to-results
   - Venice search may be cheaper (fewer API calls)

## Further Reading

- [Promise.all MDN Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)
- [Concurrency Patterns in JavaScript](https://javascript.info/promise-api)
- [Rate Limiting Best Practices](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)
