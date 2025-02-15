import { createConnection } from 'net';
import { DeepResearchEvent } from './types/deep-research.js';

export class UIClient {
  private socket: ReturnType<typeof createConnection> | null = null;
  private connected = false;
  private queue: DeepResearchEvent[] = [];
  private SOCKET_PATH = '/tmp/deep-research-ui.sock';
  private closing = false;

  constructor() {
    this.connect();
  }

  private connect() {
    if (this.closing) return;

    try {
      this.socket = createConnection(this.SOCKET_PATH);
      
      this.socket.on('connect', () => {
        this.connected = true;
        // Send any queued events
        while (this.queue.length > 0) {
          const event = this.queue.shift();
          if (event) {
            this.sendEvent(event);
          }
        }
      });

      this.socket.on('error', (error) => {
        if (error.message.includes('ENOENT')) {
          // UI server not running - queue events
          this.connected = false;
        }
      });

      this.socket.on('close', () => {
        this.connected = false;
        if (!this.closing) {
          // Try to reconnect if not intentionally closing
          setTimeout(() => this.connect(), 1000);
        }
      });
    } catch (error) {
      // UI server not running - that's ok, we'll queue events
      this.connected = false;
      if (!this.closing) {
        setTimeout(() => this.connect(), 1000);
      }
    }
  }

  public sendEvent(event: DeepResearchEvent) {
    if (this.closing) return;

    if (this.connected && this.socket) {
      try {
        // Add message delimiter
        const message = JSON.stringify(event) + '\n---EVENT_END---\n';
        this.socket.write(message);

        // If this is a completion event, close the connection after sending
        if (event.type === 'completion') {
          this.close();
        }
      } catch (error) {
        // If send fails, queue the event
        this.queue.push(event);
        this.connected = false;
        // Try to reconnect
        this.connect();
      }
    } else {
      // Queue event if not connected
      this.queue.push(event);
      // Try to connect if not already trying
      if (!this.socket) {
        this.connect();
      }
    }
  }

  public close() {
    this.closing = true;
    if (this.socket) {
      this.socket.end();
      this.socket = null;
    }
    this.connected = false;
  }
}

// Export a singleton instance
export const uiClient = new UIClient();