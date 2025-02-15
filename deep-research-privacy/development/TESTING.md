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

## Terminal UI

### Host Environment
Run UI directly on your local machine:
```bash
# Run the main application with terminal UI (with .env file)
npm run start:host

# Run terminal UI in development mode
npm run start:ui
```

### Docker Environment
The terminal UI (built with blessed) requires proper TTY allocation when running in Docker:

```bash
# Run the main application with terminal UI
docker-compose run deep-research npm start

# Run terminal UI in development mode
docker-compose run deep-research npm run start:ui

# If you have display issues, try setting a specific terminal type:
TERM=xterm-256color docker-compose run deep-research npm start
```

Note: The Docker configuration includes:
- stdin_open: true (docker run -i)
- tty: true (docker run -t)
- TERM environment variable passthrough
- Environment variables from .env.test

These settings ensure proper terminal handling for the blessed-based UI.

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
- Uses `.env` for configuration (via start:host script)
- Requires API keys to be set up
- Uses local research directory
- Can run in CI mode with `CI=true`

### Docker Environment
- Uses `.env.test` for configuration
- Uses dummy API keys for testing
- Isolated research directory
- CI mode enabled by default
- Terminal type passed through for UI

## Adding New Tests

1. Create test file in appropriate directory
2. Follow existing naming convention (*.test.ts)
3. Use Node's test runner
4. Add npm script if needed
5. Ensure test works in both environments:
   - Test locally on host machine
   - Test in Docker container
6. Update docker-compose.yml if new volumes needed