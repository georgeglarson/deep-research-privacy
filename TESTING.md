# Deep Research - Testing Checklist

## ✅ Testing Status

### Core Features (Manual Testing Required)

#### 1. Basic Research Flow
- [ ] Run basic research: `npm start "AI in healthcare" 3 2 brave`
- [ ] Verify output files created in `output/` directory
- [ ] Check report.md is generated
- [ ] Confirm sources are listed

#### 2. Search Providers
- [ ] **Brave Search**: `npm start "test query" 3 2 brave`
  - [ ] Verify search results returned
  - [ ] Check rate limiting respected
  - [ ] Confirm no API errors
  
- [ ] **Venice Search**: `npm start "test query" 3 2 venice`
  - [ ] Verify AI-grounded responses
  - [ ] Check for citation markers `[REF]N[/REF]`
  - [ ] Confirm search results metadata (if available)

#### 3. Structured Outputs
- [ ] Run `npm run test:structured`
  - [ ] Verify structured query generation works
  - [ ] Check confidence scores (0-1) present
  - [ ] Confirm priority levels (high/medium/low)
  - [ ] Verify novelty ratings
  - [ ] Check follow-up questions generated

- [ ] Test fallback behavior
  - [ ] Use model without response_schema support
  - [ ] Verify graceful fallback to text parsing
  - [ ] Confirm no errors thrown

#### 4. Venice Web Search
- [ ] Run `npm run test:venice-search`
  - [ ] Verify web search executed
  - [ ] Check AI synthesis quality
  - [ ] Confirm citations extracted
  - [ ] Verify search results metadata

#### 5. Parallelization
- [ ] Run `npm start "test" 3 2` and monitor logs
  - [ ] Confirm "Executing N queries in parallel" message
  - [ ] Verify multiple "[1/N], [2/N], [3/N]" start messages appear quickly
  - [ ] Check completion time vs expected (should be ~3x faster)
  - [ ] Confirm "Completed N parallel queries" message

- [ ] Test concurrency control
  - [ ] Run with breadth=10
  - [ ] Verify max 3 concurrent (check logs for grouping)
  - [ ] Confirm no rate limit errors (429)

#### 6. Model Discovery
- [ ] Run `npm run models`
  - [ ] Verify 10 models listed
  - [ ] Check capabilities shown (FC, RS, WS, Vision, etc.)
  - [ ] Confirm pricing displayed
  - [ ] Verify trait mappings shown
  - [ ] Check context window sizes

#### 7. Dynamic Model System
- [ ] Verify model validation on startup
  - [ ] Valid model: No warnings
  - [ ] Invalid model: Error with helpful message
  
- [ ] Check model capability detection
  - [ ] Response schema supported: Structured outputs work
  - [ ] Response schema NOT supported: Falls back to text parsing
  - [ ] Web search supported: Venice search works
  - [ ] Web search NOT supported: Warning shown

### Environment Variables
- [ ] Test with `SEARCH_PROVIDER=brave`
  - [ ] Brave search used by default
  
- [ ] Test with `SEARCH_PROVIDER=venice`
  - [ ] Venice search used by default
  
- [ ] Test with `USE_STRUCTURED_OUTPUTS=true`
  - [ ] Structured mode enabled
  
- [ ] Test with `USE_STRUCTURED_OUTPUTS=false`
  - [ ] Text parsing mode used
  
- [ ] Test Venice-only mode (no BRAVE_API_KEY)
  - [ ] Works with venice search provider
  - [ ] Error if brave provider selected without key

### Edge Cases
- [ ] Empty query: Error handling
- [ ] Invalid breadth (0, 100): Validation
- [ ] Invalid depth (0, 100): Validation
- [ ] Invalid search provider (typo): Error handling
- [ ] Network timeout: Retry logic works
- [ ] Rate limit hit: Exponential backoff works
- [ ] Invalid API key: Clear error message

### Performance Benchmarks
- [ ] Breadth=2: Measure time vs expected (~10s)
- [ ] Breadth=3: Measure time vs expected (~12s)
- [ ] Breadth=5: Measure time vs expected (~20s)
- [ ] Compare to sequential (if old version available)

### Output Quality
- [ ] Structured learnings have confidence scores
- [ ] Follow-up questions have priorities
- [ ] Sources are attributed correctly
- [ ] Report is readable and well-formatted
- [ ] No duplicate learnings (deduplication works)

## 🔍 What We Know Works

### ✅ Verified (No Testing Needed)
- **Code compiles**: All TypeScript files formatted and clean
- **No TODOs**: No loose implementation notes
- **Environment variables**: All documented in .env.example
- **Git status**: Clean, all changes committed
- **Documentation**: README updated, 3 detailed guides added

### ⚠️ Needs Manual Testing
Everything above in the checklist needs actual execution to verify:
- Search providers work with real API calls
- Structured outputs return expected JSON
- Parallelization achieves claimed speedups
- Model discovery shows current Venice models
- Error handling behaves correctly
- Rate limiting respects API limits

## 📊 Testing Priority

### HIGH (Must Test Before Release)
1. Basic research flow (core functionality)
2. Brave search provider (primary mode)
3. Parallelization performance (major feature)
4. Structured outputs (major feature)
5. Model discovery (user-facing tool)

### MEDIUM (Important But Non-Critical)
1. Venice search provider (alternative mode)
2. Environment variable configuration
3. Edge case handling
4. Output file generation

### LOW (Nice to Verify)
1. Text parsing fallback
2. Model capability warnings
3. Performance benchmarks
4. Venice-only mode (no Brave key)

## 🚀 Quick Test Script

```bash
# 1. Basic functionality
npm start "AI trends" 3 2 brave

# 2. Structured outputs
npm run test:structured

# 3. Venice search
npm run test:venice-search

# 4. Model discovery
npm run models

# 5. Parallelization (check logs for concurrent execution)
npm start "quantum computing" 5 2 brave

# 6. Venice search mode
npm start "climate change" 3 2 venice
```

## ⚡ Expected Results

### Successful Test Indicators:
- ✅ No errors or exceptions
- ✅ Output files created in `output/`
- ✅ Report.md is coherent and well-formatted
- ✅ Logs show parallel execution
- ✅ Confidence scores present (structured mode)
- ✅ Citations present (Venice search)
- ✅ Research completes in reasonable time

### Red Flags:
- ❌ API errors (401, 429, 500)
- ❌ No output files generated
- ❌ Empty or malformed report
- ❌ Sequential execution (no parallel logs)
- ❌ Missing confidence scores (structured mode)
- ❌ Excessive delays or timeouts

## 📝 Notes

**We Have NOT Tested:**
- Actual API calls (no Venice/Brave API keys used in this session)
- Real-world performance benchmarks
- Network error scenarios
- Rate limit behavior
- Output file generation

**We HAVE Verified:**
- Code compiles and formats correctly
- Architecture is sound
- Documentation is comprehensive
- No loose ends or TODOs
- Git history is clean

**Recommendation:**
Test the "Quick Test Script" above with real API keys to verify all features work as documented.
