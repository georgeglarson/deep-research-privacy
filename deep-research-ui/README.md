# Deep Research UI

A terminal-based user interface for visualizing the deep-research process in real-time. This UI provides a blessed-powered terminal dashboard that displays progress, API calls, search results, and learnings as they happen.

## Features

- Real-time progress tracking
- API call monitoring
- Search result visualization
- Learning insights display
- Scrollable panels for each information type
- Clean terminal-based interface

## Installation

```bash
npm install deep-research-ui
```

## Usage

### As a Standalone Application

```bash
npx deep-research-ui
```

### As a Library

```typescript
import { eventEmitter } from 'deep-research-ui';

// Emit events to update the UI
eventEmitter.emit('progress', {
  type: 'progress',
  timestamp: Date.now(),
  data: {
    stage: 'Research',
    percentage: 45,
    message: 'Analyzing search results...'
  }
});
```

## Event Types

The UI responds to the following event types:

### Progress Events
```typescript
{
  type: 'progress',
  timestamp: number,
  data: {
    stage: string,
    percentage: number,
    message: string
  }
}
```

### API Call Events
```typescript
{
  type: 'api_call',
  timestamp: number,
  data: {
    provider: string,
    endpoint: string,
    parameters: Record<string, any>,
    status: 'started' | 'completed' | 'error',
    response?: any,
    error?: string
  }
}
```

### Search Result Events
```typescript
{
  type: 'search_result',
  timestamp: number,
  data: {
    query: string,
    provider: string,
    results: Array<{
      title: string,
      url: string,
      snippet: string
    }>
  }
}
```

### Learning Events
```typescript
{
  type: 'learning',
  timestamp: number,
  data: {
    topic: string,
    content: string,
    confidence: number,
    sources: string[]
  }
}
```

## Integration with Deep Research

To integrate this UI with deep-research, you can import and use the event emitter in your deep-research implementation:

```typescript
import { eventEmitter } from 'deep-research-ui';

// In your deep-research code
function onProgress(stage: string, percentage: number, message: string) {
  eventEmitter.emit('progress', {
    type: 'progress',
    timestamp: Date.now(),
    data: { stage, percentage, message }
  });
}

function onApiCall(provider: string, endpoint: string, params: any) {
  eventEmitter.emit('api_call', {
    type: 'api_call',
    timestamp: Date.now(),
    data: {
      provider,
      endpoint,
      parameters: params,
      status: 'started'
    }
  });
}
```

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev

# Watch for changes
npm run watch
```

## Controls

- Press `q` to quit
- Press `Escape` to quit
- Press `Ctrl+C` to quit
- Use mouse or arrow keys to scroll panels

## License

MIT