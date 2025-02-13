# Deep Research: Privacy Edition

[![Venice.ai](https://img.shields.io/badge/Powered%20by-Venice.ai-blue?style=for-the-badge&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAELSURBVDhPY/hPIWBgYGDEJvHo+dv/h85d/H/h6rX/F69e+3/u8uX/Z69c+X/64qX/R89f+H/g9Nn/245f+L9y35n/c7ef+D9l4wkwBgn8+PWLgZGRkQEoiYSxaESWRMdwjX///WNgYmJCkUTXDMPIEshyYMDIwMSE6mJkzTCMrAGGYZqwacYmh6IRnyQyxqoRnyQyxqpp+tYT/xdvO4aqAZ9mkMSMDQf/gzQxXLp27f/6/fv/L1y1+v/MpcuQnYxVEwzDNDEcOHPu/9y5c/8vWLDg/7x58/7PmTPn/6xZs/5Pnz79/9SpU/9PmjTp/8SJE/+PHz/+/7hx4/6PHj0aQyM+SQKakQEAoH2r9cxf/NkAAAAASUVORK5CYII=)](https://venice.ai)
[![Brave Search](https://img.shields.io/badge/Search%20by-Brave-orange?style=for-the-badge&logo=brave)](https://search.brave.com)

> A privacy-focused research tool powered by uncensored AI and private search

A privacy-focused research tool that combines:
- **Venice.ai's Uncensored Language Models**: Access to powerful AI models without content restrictions
- **Brave Search's Private Search API**: Privacy-respecting web search capabilities

This project is a privacy-focused fork of [deep-research](https://github.com/dzhng/deep-research) by [@dzhng](https://github.com/dzhng), enhanced to prioritize user privacy and unrestricted research capabilities.

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

## Getting Started

First, you'll need to get API keys:

1. **Venice.ai API Key**
   - Go to [Venice.ai](https://venice.ai)
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

Don't want to install Node.js? Just use Docker:

```bash
docker-compose up  
```

That's it! The exact same code runs in an isolated container with all dependencies included. No Node.js installation needed!

## Project Structure

The project demonstrates clean architecture with focused components:

### Core Components
- `src/deep-research.ts`: Main research engine
- `src/ai/llm-client.ts`: Venice.ai API client
- `src/ai/models.ts`: Model definitions and selection
- `src/search/providers.ts`: Search provider implementation

### Support Components
- `src/output-manager.ts`: Progress tracking
- `src/ai/response-processor.ts`: Response handling
- `src/ai/providers.ts`: API integration

### Development Tools
- `src/test-search.ts`: Multi-purpose testing utility
  * Verifies search functionality
  * Demonstrates API usage
  * Helps debug issues
  * Shows best practices

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

## Contact & Social

- Email: george.g.larson@gmail.com
- Twitter: [@g3ologic](https://x.com/g3ologic)
- LinkedIn: [George Larson](https://www.linkedin.com/in/georgelarson/)

## License

ISC License
