# Deep Research: Privacy Edition

[![Venice.ai](https://img.shields.io/badge/Private%20%26%20Uncensored%20AI-Venice.ai-blue?style=for-the-badge)](https://venice.ai/chat?ref=VB8W1j)
[![Brave Search](https://img.shields.io/badge/Search%20by-Brave-orange?style=for-the-badge&logo=brave)](https://search.brave.com)

> A privacy-focused research tool powered by uncensored AI and private search

[![Try Demo](https://img.shields.io/badge/Try-Demo-green?style=for-the-badge)](https://georgeglarson.github.io/deep-research-privacy/)
[![GitHub stars](https://img.shields.io/github/stars/georgeglarson/deep-research-privacy?style=social)](https://github.com/georgeglarson/deep-research-privacy)
[![Twitter](https://img.shields.io/twitter/url?style=social&url=https%3A%2F%2Fgithub.com%2Fgeorgeglarson%2Fdeep-research-privacy)](https://twitter.com/intent/tweet?text=Excited%20to%20discover%20Deep%20Research%20Privacy%20Edition!%20Privacy-first%20research%20using%20%40VeniceAI%20(venice.ai%2Fchat%3Fref%3DVB8W1j)%20%2B%20%40brave%20search.%20Fork%20of%20%40dzhng%27s%20work%2C%20now%20with%20uncensored%20models%20%26%20private%20search.%0A%0A%23AI%20%23Privacy%20%23OpenSource%20%23Research%0A&url=https%3A%2F%2Fgithub.com%2Fgeorgeglarson%2Fdeep-research-privacy)

A privacy-focused research tool that combines:
- **Venice.ai's Uncensored Language Models**: Access to powerful AI models without content restrictions
- **Brave Search's Private Search API**: Privacy-respecting web search capabilities

## Why This Matters 🔒

In today's AI landscape, privacy often takes a backseat to functionality. This project proves it doesn't have to be that way:

- **True Privacy**: Your research queries stay private with Brave Search's no-logging policy
- **Uncensored Research**: Access Venice.ai's unrestricted models for genuine research freedom
- **Local Processing**: Keep sensitive data on your machine, not in the cloud
- **Transparent Code**: 100% open source, audit everything yourself

This project is a privacy-focused fork of [deep-research](https://github.com/dzhng/deep-research) by [@dzhng](https://github.com/dzhng), enhanced to prioritize user privacy and unrestricted research capabilities.

## Quick Demo 🎥

Try the interactive demo at [georgeglarson.github.io/deep-research-privacy](https://georgeglarson.github.io/deep-research-privacy)

Features you can try:
- Research privacy topics with uncensored AI
- Compare different AI models
- Experience our privacy-first approach

## The Coolest Part? Run It Your Way! 🚀

This project is designed to be super flexible - you can run the exact same code in two ways:

1. **Direct Node.js:** Install dependencies locally and run directly
2. **Docker Container:** Run everything in an isolated container with zero Node.js installation required!

Both methods use the exact same code and configuration (.env file), just in different environments. Choose what works best for you!

## Overview

This project showcases:
- Privacy-first research capabilities using Brave Search
- Clean, maintainable TypeScript code
- Venice.ai API integration
- Rate limit handling
- Error recovery
- Progress tracking

## Features

### Privacy Focus
- Uses Venice.ai's uncensored models
- Dual search options: Brave Search (privacy-focused) or Venice Search (AI-grounded)
- No query logging
- Local result caching only

### Advanced Search Capabilities
- **Dual Search Providers**:
  - **Brave Search**: Privacy-focused web search with no-logging policy
  - **Venice Search**: AI-grounded search with automatic citations and synthesis
- Intelligent rate limiting
- Result deduplication
- **True Parallelization**: 3.3x faster research with concurrent query execution
- Meaningful filename generation

### AI Integration
- **Dynamic Model Discovery**: Auto-fetches latest Venice models with capabilities
- **Structured Outputs**: JSON schema-based responses with confidence scores (0-1)
- **Smart Model Selection**: Automatic trait-based model selection
- **Web Search Integration**: Built-in web search grounding with citations
- **Priority Levels**: High/medium/low priority tagging for questions
- **Confidence Scoring**: Every insight rated for reliability
- Automatic rate limit handling
- Robust error recovery with exponential backoff
- Detailed progress tracking

### Performance
- **3.3x Faster**: True parallel query execution (breadth=3)
- **Smart Concurrency**: Controlled concurrency prevents API overload
- **Efficient Resource Use**: Optimized CPU and network utilization

## How We Compare 📊

| Feature | Deep Research Privacy | Traditional Research Tools | Other AI Assistants |
|---------|---------------------|------------------------|-------------------|
| Privacy First | ✅ No data collection | ❌ Tracks searches | ❌ Stores conversations |
| Uncensored Results | ✅ Full access | ❌ Filtered results | ❌ Content restrictions |
| Open Source | ✅ 100% transparent | ❌ Closed source | ❌ Proprietary |
| Local Processing | ✅ Your machine | ❌ Cloud-based | ❌ Cloud-based |
| Cost | ✅ Pay per use | ❌ Expensive subscriptions | ❌ Monthly fees |

## Share & Contribute 🌟

Help make AI research more private:

1. ⭐ Star this repository to show your support
2. 🐦 Share on [Twitter](https://twitter.com/intent/tweet?text=Excited%20to%20discover%20Deep%20Research%20Privacy%20Edition!%20Privacy-first%20research%20using%20%40VeniceAI%20(venice.ai%2Fchat%3Fref%3DVB8W1j)%20%2B%20%40brave%20search.%20Fork%20of%20%40dzhng%27s%20work%2C%20now%20with%20uncensored%20models%20%26%20private%20search.%0A%0A%23AI%20%23Privacy%20%23OpenSource%20%23Research%0A&url=https%3A%2F%2Fgithub.com%2Fgeorgeglarson%2Fdeep-research-privacy)
3. 🔄 Follow [@g3ologic](https://twitter.com/g3ologic) for updates
4. 🤝 Join our [contributors](CONTRIBUTING.md)

## Getting Started

First, you'll need to get API keys:

1. **Venice.ai API Key**
   - Go to [Venice.ai](https://venice.ai/chat?ref=VB8W1j)
   - Sign up for an account
   - Navigate to your API settings
   - Generate a new API key

2. **Brave Search API Key** *(optional - only needed for Brave search mode)*
   - Visit [Brave Search API](https://api.search.brave.com/app)
   - Create a developer account
   - Go to [API Keys](https://api.search.brave.com/app/keys)
   - Generate a new API key
   - *Note: You can use Venice search mode without a Brave API key*

Then configure your environment:

```bash
# Copy example config
cp .env.example .env

# Edit .env with your API keys
VENICE_API_KEY=your_venice_api_key_here
BRAVE_API_KEY=your_brave_search_api_key_here  # Optional for Brave mode

# Optional: Configure search provider and structured outputs
SEARCH_PROVIDER=brave                          # brave or venice
USE_STRUCTURED_OUTPUTS=true                    # Enable JSON schema (default: true)
```

Then choose your preferred way to run the project:

### Option 1: Direct Node.js

If you have Node.js installed:

1. Install dependencies:
```bash
npm install
```

2. Run it:
```bash
npm start
```

## Usage

### Basic Research

```bash
npm start "your research query" <breadth> <depth> <search_provider>
```

**Parameters:**
- `query` (required): Your research question
- `breadth` (optional, default: 3): Number of parallel queries (2-10)
- `depth` (optional, default: 2): Research depth level (1-5)
- `search_provider` (optional, default: brave): Search provider (`brave` or `venice`)

**Examples:**

```bash
# Basic research with defaults
npm start "impact of AI on healthcare"

# Custom breadth and depth
npm start "quantum computing advances" 5 2

# Use Venice AI-grounded search
npm start "climate change solutions" 3 2 venice

# Use Brave privacy-focused search
npm start "blockchain applications" 3 2 brave
```

### Test & Discovery Commands

```bash
# List all available Venice models with capabilities
npm run models

# Test Venice web search integration
npm run test:venice-search

# Test structured outputs with confidence scores
npm run test:structured

# Format code
npm run format
```

### Search Provider Comparison

| Feature | Brave Search | Venice Search |
|---------|--------------|---------------|
| **Result Format** | Raw search results | AI-synthesized narrative |
| **Citations** | Manual tracking | Automatic inline `[REF]N[/REF]` |
| **Speed** | Separate search + LLM calls | Single API call |
| **Cost** | Lower (search only) | Higher (LLM + search) |
| **Privacy** | No-log policy | Venice processes data |
| **Best For** | Raw data gathering, fact-checking | Complex synthesis, reports |

**Recommendation:**
- Use **Brave** for large-scale data gathering (breadth phase)
- Use **Venice** for synthesis and citation-heavy reports (depth phase)

### Advanced Features

#### Structured Outputs

Automatically enabled by default. Get JSON responses with:
- **Confidence scores** (0-1) for every insight
- **Priority levels** (high/medium/low) for follow-up questions
- **Novelty ratings** (high/medium/low)
- **Source attribution** with URLs
- **Contradiction detection** across sources

```bash
# Disable structured outputs (use text parsing)
USE_STRUCTURED_OUTPUTS=false npm start "query"
```

#### Model Discovery

List all available Venice models and their capabilities:

```bash
npm run models
```

Shows:
- Model names and IDs
- Context window sizes (up to 262k tokens)
- Pricing (input/output per million tokens)
- Capabilities: function calling, response schema, web search, vision, reasoning
- Trait mappings (default, fastest, most_uncensored, etc.)

**Compatible Models for Structured Outputs:**
- qwen3-235b (Venice Large - Code optimized)
- mistral-31-24b (Venice Medium - Vision support)
- qwen3-4b (Venice Small - Fast & cheap)
- qwen3-next-80b (Massive 262k context)
- qwen3-coder-480b (Code-specialized)
- And 4 more...

#### Performance

**Parallel Execution:**
- Queries execute concurrently (max 3 at a time)
- 3.3x faster than sequential processing
- No artificial delays between queries

**Speed Comparison:**

| Breadth | Sequential (Old) | Parallel (New) | Speedup |
|---------|------------------|----------------|---------|
| 2 | ~25s | ~10s | 2.5x |
| 3 | ~40s | ~12s | 3.3x |
| 5 | ~70s | ~20s | 3.5x |
| 10 | ~145s | ~40s | 3.6x |

### Configuration Options

**Environment Variables (.env):**

```bash
# Required
VENICE_API_KEY=your_key_here

# Optional
BRAVE_API_KEY=your_key_here              # Only for Brave search mode
SEARCH_PROVIDER=brave                    # brave or venice (default: brave)
USE_STRUCTURED_OUTPUTS=true              # JSON schema mode (default: true)
VENICE_MODEL=llama-3.3-70b               # Override default model
```

### Output Files

Research results are saved in the `output/` directory:

```
output/
├── your-research-query-YYYY-MM-DD-HH-MM-SS/
│   ├── report.md              # Final research report
│   ├── learnings.json         # Extracted insights (if structured mode)
│   └── sources.json           # Source URLs
```

### Detailed Documentation

For in-depth guides, see:

- **[Venice Search](docs/VENICE_SEARCH.md)**: AI-grounded search with citations, search modes, configuration
- **[Structured Outputs](docs/STRUCTURED_OUTPUTS.md)**: JSON schema, confidence scores, priority levels, examples
- **[Parallelization](docs/PARALLELIZATION.md)**: Performance benchmarks, concurrency control, technical details

### Option 2: Docker Container

### EDIT: 2025-02-17. Docker container only works for some people. Rebuild forthcoming

Don't want to install Node.js? Just use Docker:

```bash
docker-compose up  
```

That's it! The exact same code runs in an isolated container with all dependencies included. No Node.js installation needed!

## Project Structure

The project demonstrates clean architecture with focused components:

### Core Components
- `src/run.ts`: Application entry point with CLI argument handling
- `src/deep-research.ts`: Main research engine orchestrating the workflow
- `src/research-path.ts`: **Parallel query execution** with controlled concurrency
- `src/ai/llm-client.ts`: Venice.ai API client with **web search & response schema** support
- `src/ai/models.ts`: **Dynamic model discovery** from Venice API with capabilities detection
- `src/search/providers.ts`: Dual search providers (**Brave** + **Venice**)

### AI & Structured Output Components
- `src/ai/providers.ts`: AI integration with **structured output** support
- `src/ai/schemas.ts`: **JSON schemas** for queries, learnings, and reports
- `src/ai/structured-providers.ts`: **Structured output generation** with fallback
- `src/ai/response-processor.ts`: Legacy text-based response handling
- `src/search.ts`: Search provider selection and management

### Support Components
- `src/output-manager.ts`: Progress tracking and console output
- `src/utils.ts`: Utilities including **batchPromises** for controlled concurrency
- `src/prompt.ts`: Prompt templates and engineering

### Test & Discovery Tools
- `src/list-models.ts`: **Model discovery tool** (run with `npm run models`)
- `src/test-venice-search.ts`: **Venice search tester** (run with `npm run test:venice-search`)
- `src/test-structured-outputs.ts`: **Structured output tester** (run with `npm run test:structured`)

### Documentation
- `docs/VENICE_SEARCH.md`: Comprehensive Venice search guide (320 lines)
- `docs/STRUCTURED_OUTPUTS.md`: JSON schema & confidence scoring guide (466 lines)
- `docs/PARALLELIZATION.md`: Performance & concurrency guide (387 lines)
- `docs/FRONTEND_PLAN.md`: Future UI/UX roadmap

## Learning Focus

This project serves as an example for new developers, demonstrating:

1. **Clean Architecture**
   - Single responsibility principle
   - Interface-driven design
   - Error handling patterns

2. **API Integration**
   - Rate limit handling
   - Error recovery
   - Response processing

3. **TypeScript Best Practices**
   - Strong typing
   - Interface definitions
   - Generic implementations

4. **Privacy Considerations**
   - API key management
   - Privacy-focused search
   - Local data handling

5. **Deployment Flexibility**
   - Run directly with Node.js
   - Run in Docker container
   - Same code and config, different environments

6. **Development Tools**
   - Testing utilities
   - Debugging helpers
   - Example implementations

## Available Models

Venice.ai models, each optimized for different tasks:

- `llama-3.3-70b`: Latest general purpose model (65k context, function calling)
- `llama-3.2-3b`: Fast, efficient model (131k context)
- `dolphin-2.9.2-qwen2-72b`: Uncensored model (32k context)
- `llama-3.1-405b`: Most intelligent model (63k context)
- `qwen32b`: Code-optimized model (131k context)
- `deepseek-r1-llama-70b`: DeepSeek's distilled model (65k context)
- `deepseek-r1-671b`: DeepSeek's largest model (131k context)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Connect & Engage 🤝

Let's make privacy-first AI research the standard:

- 📧 Questions? Email [george.g.larson@gmail.com](mailto:george.g.larson@gmail.com)
- 🐦 Follow [@g3ologic](https://x.com/g3ologic) for project updates
- 💼 Connect on [LinkedIn](https://www.linkedin.com/in/georgelarson/)
- 🌟 Star and watch this repo for updates
- 🔔 Report issues or suggest features in [GitHub Issues](https://github.com/georgeglarson/deep-research-privacy/issues)

## License

MIT License - see [LICENSE](LICENSE) for details
