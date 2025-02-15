# Testing Infrastructure

## Docker Setup

The project uses Docker for consistent testing environments:

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app

# Copy package files first
COPY package*.json ./
COPY deep-research-ui/package*.json ./deep-research-ui/
COPY deep-research-ui/package-lock.json ./deep-research-ui/

# Install dependencies
RUN npm install

# Set up UI
WORKDIR /app/deep-research-ui
RUN npm install

# Copy UI source files
COPY deep-research-ui/tsconfig.json ./
COPY deep-research-ui/src ./src
RUN npm run build

# Back to root and copy remaining files
WORKDIR /app
COPY . .

# Test environment setup
ENV CI=true
ENV NODE_ENV=test
ENV VENICE_API_KEY=dummy-key
ENV BRAVE_API_KEY=dummy-key
```

## Running Tests

```bash
# Build and run all tests
docker-compose build
docker-compose run deep-research npm test

# Run specific test suites
docker-compose run deep-research npm run test:delay
docker-compose run deep-research npm run test:search
docker-compose run deep-research npm run test:venice
docker-compose run deep-research npm run test:queries
```

## User Interface

### Current Terminal UI
The project currently uses a terminal-based UI (built with blessed):
```bash
# Run the main application with terminal UI
docker-compose run deep-research npm start

# Run terminal UI in development mode
docker-compose run deep-research npm run start:ui
```

### Upcoming Web Interface
Web interface support is planned for future development:
- Will expose HTTP port for web access
- Will provide browser-based interface
- Will maintain terminal UI as alternative option

## Test Types

1. Unit Tests
   - Located in `tests/` directory
   - Follow `.test.ts` naming convention
   - Use Node's built-in test runner

2. Integration Tests
   - Test search functionality
   - Test rate limiting
   - Test API integrations

3. UI Tests
   - Terminal interface tests
   - Event handling tests
   - UI component tests
   - Web interface tests (upcoming)

## Test Environment

- Uses `.env.test` for configuration
- Dummy API keys for testing
- Isolated research directory
- CI mode enabled

## Adding New Tests

1. Create test file in appropriate directory
2. Follow existing naming convention (*.test.ts)
3. Use Node's test runner
4. Add npm script if needed
5. Update docker-compose.yml if new volumes needed