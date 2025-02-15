# Testing Infrastructure

## Running Tests

### Host Environment
Run tests directly on your local machine:
```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific test suites
npm run test:delay
npm run test:search
npm run test:venice
npm run test:queries
```

### Docker Environment
Run tests in a containerized environment:
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

## User Interface

### Host Environment
Run UI directly on your local machine:
```bash
# Run the main application with terminal UI
npm start

# Run terminal UI in development mode
npm run start:ui
```

### Docker Environment
Run UI in a containerized environment:
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
- Will support both host and Docker environments

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

### Host Environment
- Uses `.env` for configuration
- Requires API keys to be set up
- Uses local research directory
- Can run in CI mode with `CI=true`

### Docker Environment
- Uses `.env.test` for configuration
- Uses dummy API keys for testing
- Isolated research directory
- CI mode enabled by default

## Adding New Tests

1. Create test file in appropriate directory
2. Follow existing naming convention (*.test.ts)
3. Use Node's test runner
4. Add npm script if needed
5. Ensure test works in both environments:
   - Test locally on host machine
   - Test in Docker container
6. Update docker-compose.yml if new volumes needed