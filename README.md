# Deep Research: Privacy Edition

[![Venice.ai](https://img.shields.io/badge/Private%20%26%20Uncensored%20AI-Venice.ai-blue?style=for-the-badge)](https://venice.ai/chat?ref=VB8W1j)
[![Brave Search](https://img.shields.io/badge/Search%20by-Brave-orange?style=for-the-badge&logo=brave)](https://search.brave.com)

> Privacy-first AI research tool powered by Venice.ai's uncensored language models and Brave's private search - no data collection, no content restrictions, 100% open source

[![Try Demo](https://img.shields.io/badge/Try-Demo-green?style=for-the-badge)](https://georgeglarson.github.io/deep-research-privacy/)
[![GitHub stars](https://img.shields.io/github/stars/georgeglarson/deep-research-privacy?style=social)](https://github.com/georgeglarson/deep-research-privacy)
[![Twitter](https://img.shields.io/twitter/url?style=social&url=https%3A%2F%2Fgithub.com%2Fgeorgeglarson%2Fdeep-research-privacy)](https://twitter.com/intent/tweet?text=Excited%20to%20discover%20Deep%20Research%20Privacy%20Edition!%20Privacy-first%20research%20using%20%40VeniceAI%20(venice.ai%2Fchat%3Fref%3DVB8W1j)%20%2B%20%40brave%20search.%20Fork%20of%20%40dzhng%27s%20work%2C%20now%20with%20uncensored%20models%20%26%20private%20search.%0A%0A%23AI%20%23Privacy%20%23OpenSource%20%23Research%0A&url=https%3A%2F%2Fgithub.com%2Fgeorgeglarson%2Fdeep-research-privacy)

A privacy-focused research tool that combines:
- **[Venice.ai](https://venice.ai/chat?ref=VB8W1j)'s Uncensored Language Models**: Access to 10+ powerful AI models without content restrictions, including Llama 3.3 70B, Qwen 3 235B, and Venice Uncensored
- **Brave Search's Private Search API**: Privacy-respecting web search with no-logging policy
- **Advanced Features**: Structured JSON outputs with confidence scores, parallel query execution (3.3x faster), and automatic citations

## Why This Matters 🔒

In today's AI landscape, privacy often takes a backseat to functionality. This project proves it doesn't have to be that way:

- **True Privacy**: Your research queries stay private with Brave Search's no-logging policy
- **Uncensored AI**: Venice.ai provides unrestricted access to 10+ powerful language models including Llama 3.3 70B, Qwen 3 235B (code-optimized), and their exclusive Venice Uncensored model
- **Local Processing**: Keep sensitive data on your machine, not in the cloud
- **Transparent Code**: 100% open source, audit everything yourself
- **Advanced Features**: JSON schema-based structured outputs, confidence scoring, parallel execution, and automatic citations

This project is a privacy-focused fork of [deep-research](https://github.com/dzhng/deep-research) by [@dzhng](https://github.com/dzhng), enhanced to prioritize user privacy and unrestricted research capabilities.

## Quick Demo 🎥

Try the interactive demo at [georgeglarson.github.io/deep-research-privacy](https://georgeglarson.github.io/deep-research-privacy)

**Experience Venice.ai's power:**
- Research any topic with 10+ uncensored AI models
- Compare model capabilities and pricing in real-time
- See structured outputs with confidence scores
- Test Venice.ai's web search integration with automatic citations
- Experience true privacy - no data collection, no content restrictions

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
- **Venice.ai Integration**: Access to 10+ uncensored AI models with up to 262k context windows
- **Dual Search Options**:
  - Brave Search (privacy-focused, no-logging policy)
  - Venice Search (AI-grounded with automatic citations)
- **Zero Data Collection**: No query logging, no conversation storage
- **Local Processing**: All sensitive data stays on your machine

### Advanced Search Capabilities
- **Dual Search Providers**:
  - **Brave Search**: Privacy-focused web search with no-logging policy
  - **Venice Search**: AI-grounded search with automatic citations and synthesis
- Intelligent rate limiting
- Result deduplication
- **True Parallelization**: 3.3x faster research with concurrent query execution
- Meaningful filename generation

### AI Integration Powered by Venice.ai
- **10+ Uncensored Models**: Access to Llama 3.3 70B, Qwen 3 235B, Venice Uncensored, and more
- **Dynamic Model Discovery**: Auto-fetches latest Venice.ai models with real-time capabilities
- **Massive Context Windows**: Up to 262k tokens (Qwen 3 Next 80B, Qwen 3 Coder 480B)
- **Structured Outputs**: JSON schema-based responses with confidence scores (0-1)
- **Smart Model Selection**: Automatic trait-based selection (fastest, most_uncensored, default_code, etc.)
- **Web Search Integration**: Built-in Venice.ai web search grounding with automatic citations
- **Priority Levels**: High/medium/low priority tagging for follow-up questions
- **Confidence Scoring**: Every insight rated for reliability (0-1 scale)
- **Automatic Rate Limit Handling**: Exponential backoff and retry logic
- **Detailed Progress Tracking**: Real-time console updates with spinner

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

Help promote privacy-first AI research and Venice.ai:

1. ⭐ Star this repository to support the project
2. 🐦 Share on [Twitter](https://twitter.com/intent/tweet?text=Discovered%20Deep%20Research%20Privacy%20Edition!%20%F0%9F%94%92%0A%0APowered%20by%20%40VeniceAI%27s%2010%2B%20uncensored%20models%20%2B%20%40brave%20private%20search%0A%0A%E2%9C%85%20No%20data%20collection%0A%E2%9C%85%20No%20content%20restrictions%0A%E2%9C%85%20262k%20context%20windows%0A%E2%9C%85%203.3x%20faster%20parallel%20execution%0A%0ATry%20Venice.ai%3A%20venice.ai%2Fchat%3Fref%3DVB8W1j%0A%0A%23VeniceAI%20%23Privacy%20%23OpenSource%20%23AI%20%23Research%0A&url=https%3A%2F%2Fgithub.com%2Fgeorgeglarson%2Fdeep-research-privacy)
3. 🔄 Follow [@g3ologic](https://twitter.com/g3ologic) for updates
4. 🤝 Join our [contributors](CONTRIBUTING.md)
5. 🌐 Try [Venice.ai](https://venice.ai/chat?ref=VB8W1j) - Private & Uncensored AI

## Getting Started

First, you'll need to get API keys:

1. **Venice.ai API Key** (Required)
   - Visit [Venice.ai](https://venice.ai/chat?ref=VB8W1j) - Private & Uncensored AI
   - Sign up for a free account (no credit card required)
   - Navigate to your API settings
   - Generate a new API key
   - Get access to 10+ uncensored models including Llama 3.3 70B, Qwen 3 235B, and Venice Uncensored

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

Research results are saved in the `research/` directory:

```
research/
├── research-your-query-YYYY-MM-DD-HH-MM-SS.md  # Complete research report
```

### Detailed Documentation

For in-depth guides, see:

- **[Venice Search](docs/VENICE_SEARCH.md)**: AI-grounded search with citations, search modes, configuration
- **[Structured Outputs](docs/STRUCTURED_OUTPUTS.md)**: JSON schema, confidence scores, priority levels, examples
- **[Parallelization](docs/PARALLELIZATION.md)**: Performance benchmarks, concurrency control, technical details

### Option 2: Docker Container

Don't want to install Node.js? Just use Docker:

```bash
# Build and run with docker-compose
docker-compose up

# Or run directly with docker
docker build -t deep-research .
docker run --rm --env-file .env -v $(pwd)/research:/app/research deep-research npm run docker:start "your query" 3 2
```

That's it! The exact same code runs in an isolated container with all dependencies included. No Node.js installation needed!

**Note:** Uses Node.js 20 for `--env-file` support. Docker-specific npm scripts available: `docker:start`, `docker:models`, `docker:test:structured`, `docker:test:venice-search`.

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

## Available Venice.ai Models

Venice.ai provides a dynamic roster of 10+ uncensored AI models optimized for different tasks. Use `npm run models` to see the current list with real-time capabilities and pricing.

### Featured Models

**🚀 Production Models:**
- **llama-3.3-70b** (Default): General purpose, function calling, 131k context - $0.70/M input
- **qwen3-235b** (Venice Large): Code-optimized, response schema, 131k context - $0.90/M input
- **mistral-31-24b** (Venice Medium): Vision support, multimodal, 131k context - $0.50/M input

**⚡ Speed & Efficiency:**
- **llama-3.2-3b** (Fastest): Quick responses, low cost, 131k context - $0.15/M input
- **qwen3-4b** (Venice Small): Efficient reasoning, 32k context - $0.05/M input

**🔓 Uncensored & Specialized:**
- **venice-uncensored**: Unrestricted outputs, response schema, 32k context - $0.20/M input
- **qwen3-coder-480b**: Code-specialized, massive 262k context - $0.75/M input
- **qwen3-next-80b**: Large 262k context window - $0.35/M input

**🧠 Advanced Models:**
- **hermes-3-llama-3.1-405b**: Most intelligent, 131k context - $1.10/M input
- **zai-org-glm-4.6**: High-performance alternative, 202k context - $0.85/M input

### Model Capabilities

**All Venice.ai models support:**
- ✅ Web search grounding with automatic citations
- ✅ Response schema (9 out of 10 models)
- ✅ Function calling (8 out of 10 models)
- ✅ Context windows from 32k to 262k tokens
- ✅ Uncensored outputs without content restrictions

**Check current models and pricing:**
```bash
npm run models
```

Models are fetched dynamically from the Venice.ai API, ensuring you always have access to the latest capabilities.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Connect & Engage 🤝

Let's make privacy-first AI research the standard:

- 📧 Questions? Email [george.g.larson@pm.me](mailto:george.g.larson@pm.me)
- 🐦 Follow [@g3ologic](https://x.com/g3ologic) for project updates
- 💼 Connect on [LinkedIn](https://www.linkedin.com/in/georgelarson/)
- 🌐 Visit my [personal site](https://georgelarson.me/)
- � Star and watch this repo for updates
- 🔔 Report issues or suggest features in [GitHub Issues](https://github.com/georgeglarson/deep-research-privacy/issues)

## License

MIT License - see [LICENSE](LICENSE) for details
