#!/usr/bin/env node
import { TerminalUI } from './ui/terminal-ui.js';
import { EventEmitter } from 'eventemitter3';
import { createServer } from 'net';
import { DeepResearchEvent } from './types/deep-research.js';

// Create event emitter instance
const eventEmitter = new EventEmitter();
const ui = new TerminalUI();

// Set up event handlers
const eventTypes = ['progress', 'api_call', 'search_result', 'learning', 'completion'];
eventTypes.forEach(eventType => {
  eventEmitter.on(eventType, (event: DeepResearchEvent) => {
    ui.handleEvent(event);
  });
});

// Create IPC server
const server = createServer(socket => {
  let buffer = '';
  const delimiter = '---EVENT_END---';

  socket.on('data', data => {
    buffer += data.toString();
    
    // Process complete messages
    while (buffer.includes(delimiter)) {
      const delimiterIndex = buffer.indexOf(delimiter);
      const message = buffer.slice(0, delimiterIndex);
      buffer = buffer.slice(delimiterIndex + delimiter.length);

      try {
        const event = JSON.parse(message);
        eventEmitter.emit(event.type, event);
      } catch (error) {
        console.error('Error processing event:', error);
      }
    }
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Listen on a Unix domain socket
const SOCKET_PATH = '/tmp/deep-research-ui.sock';

// Remove existing socket file if it exists
import { unlinkSync } from 'fs';
try {
  unlinkSync(SOCKET_PATH);
} catch (error) {
  // Ignore error if file doesn't exist
}

server.listen(SOCKET_PATH, () => {
  console.log('Deep Research UI server listening on', SOCKET_PATH);
  console.log('Press q, Escape, or Ctrl+C to exit');
});

// Cleanup on exit
process.on('SIGINT', () => {
  server.close();
  try {
    unlinkSync(SOCKET_PATH);
  } catch (error) {
    // Ignore cleanup errors
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  server.close();
  try {
    unlinkSync(SOCKET_PATH);
  } catch (error) {
    // Ignore cleanup errors
  }
  process.exit(0);
});