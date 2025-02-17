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
- Privacy-focused web search via Brave Search API
- No query logging
- Local result caching only

### Search Capabilities
- Web search via Brave Search API
- Intelligent rate limiting
- Result deduplication
- Meaningful filename generation

### AI Integration
- Intelligent model selection
- Automatic rate limit handling
- Robust error recovery
- Detailed progress tracking

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

2. **Brave Search API Key**
   - Visit [Brave Search API](https://api.search.brave.com/app)
   - Create a developer account
   - Go to [API Keys](https://api.search.brave.com/app/keys)
   - Generate a new API key

Then configure your environment:

```bash
# Copy example config
cp .env.example .env

# Edit .env with your API keys
VENICE_API_KEY=your_venice_api_key_here
BRAVE_API_KEY=your_brave_search_api_key_here
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

### Option 2: Docker Container

### EDIT: 2025-02-17. Docker container is a bit junked up. Doesn't work for most people. Rebuild forthcoming

Don't want to install Node.js? Just use Docker:

```bash
docker-compose up  
```

That's it! The exact same code runs in an isolated container with all dependencies included. No Node.js installation needed!

## Project Structure

The project demonstrates clean architecture with focused components:

### Core Components
- `src/run.ts`: Application entry point
- `src/deep-research.ts`: Main research engine
- `src/research-path.ts`: Research path handling
- `src/ai/llm-client.ts`: Venice.ai API client
- `src/ai/models.ts`: Model definitions and selection
- `src/search/providers.ts`: Search provider implementation

### Support Components
- `src/output-manager.ts`: Progress tracking
- `src/utils.ts`: Utility functions
- `src/ai/providers.ts`: AI integration
- `src/ai/response-processor.ts`: Response handling

### Testing Components
- `tests/search/search.test.ts`: Search provider tests
- `tests/ai/text-splitter.test.ts`: Text processing tests

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
