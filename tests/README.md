# Tests

This directory contains various tests for the deep-research project. The test structure mirrors the src directory structure to maintain clear organization.

## Test Types

### Unit Tests
Unit tests are written using Node's built-in test runner and follow the `.test.ts` naming convention:

```bash
npm test
```

Example: `tests/ai/text-splitter.test.ts`

### Utility Tests
Standalone test scripts for verifying specific functionality:

1. Delay Test (tests rate limiting behavior):
```bash
npm run test:delay
```

2. Search Test (verifies search integration):
```bash
npm run test:search
```

## Directory Structure

```
tests/
├── ai/                    # Tests for AI-related functionality
│   └── text-splitter.test.ts
├── delay.ts              # Rate limiting test utility
├── search.ts             # Search integration test
└── README.md             # This file
```

## Writing New Tests

- For unit tests, use Node's built-in test runner (`node:test`)
- Place tests in the corresponding subdirectory matching the src structure
- Use `.test.ts` suffix for unit tests
- For utility tests, add a new npm script in package.json