# Deep Research Development Documentation

This directory contains technical documentation for developers working on Deep Research.

## Core Components

1. **Research Engine**
   - Dynamic research path planning and execution
   - Intelligent model selection and integration
   - Advanced content analysis with DeepSeek R1
   - Multimodal processing with Qwen 2.5 VL
   - Privacy-focused search provider implementation

2. **Frontend**
   - Website architecture and components
   - UI/UX design system
   - Terminal interface implementation
   - See [FRONTEND_PLAN.md](FRONTEND_PLAN.md)

## Development Setup

1. **Prerequisites**
   - Node.js 18+
   - npm or yarn
   - Docker (optional)

2. **Environment**
   - Copy `.env.example` to `.env`
   - Add required API keys
   - See main README for details

3. **Running Locally**
   ```bash
   # Install dependencies
   npm install

   # Start development server
   npm run dev
   ```

## Project Structure

```
deep-research/
├── src/                    # Core TypeScript source
│   ├── ai/                # AI integration
│   │   ├── dynamic-research-path.ts  # Advanced research engine
│   │   ├── models.ts      # Model selection & traits
│   │   └── providers.ts   # AI provider integration
│   ├── search/            # Search providers
│   └── ui/                # Terminal UI
├── docs/                  # Documentation
│   ├── development/      # Developer docs
│   └── assets/           # Website assets
└── tests/                # Test suites
```

## Key Features

1. **Dynamic Research**
   - Intelligent path planning
   - Real-time strategy adjustment
   - Advanced content analysis
   - Pattern recognition
   - Knowledge synthesis

2. **Model Integration**
   - DeepSeek R1 for reasoning
   - Qwen 2.5 VL for multimodal
   - Automatic model selection
   - Trait-based capabilities

3. **Privacy Focus**
   - Local processing
   - No data retention
   - Transparent operations
   - User data control

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) in the root directory for:
- Code style guidelines
- Pull request process
- Development workflow
- Testing requirements

## Testing

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- tests/search/search.test.ts
```

## Building

```bash
# Build TypeScript
npm run build

# Build documentation site
cd docs && npm run build
```

## Additional Resources

- [GitHub Project Board](https://github.com/georgeglarson/deep-research-privacy/projects)
- [Issue Tracker](https://github.com/georgeglarson/deep-research-privacy/issues)
- [Discussions](https://github.com/georgeglarson/deep-research-privacy/discussions)