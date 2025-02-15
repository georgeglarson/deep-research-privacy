import { output } from './output-manager.js';

/**
 * Generic rate limiter for API requests
 */
export class RateLimiter {
  private lastRequestTime: number = 0;
  private readonly minDelay: number;

  constructor(delayMs: number) {
    this.minDelay = delayMs;
    output.log(`RateLimiter initialized with ${delayMs}ms delay`);
  }

  async waitForNextSlot(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const waitTime = Math.max(0, this.minDelay - timeSinceLastRequest);

    output.log(`Rate limiter: Time since last request: ${timeSinceLastRequest}ms`);
    output.log(`Rate limiter: Wait time needed: ${waitTime}ms`);

    if (waitTime > 0) {
      output.log(`Rate limiter: Waiting ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      output.log('Rate limiter: Wait complete');
    } else {
      output.log('Rate limiter: No wait needed');
    }

    this.lastRequestTime = Date.now();
  }
}

/**
 * Removes common prefixes and question marks to focus on key terms
 */
export function cleanQuery(query: string): string {
  return query
    .replace(/^(what are |tell me about |explain |describe )/i, '')
    .replace(/\?+$/, '')
    .trim();
}

/**
 * Ensures a directory exists, creating it if necessary
 */
export async function ensureDir(
  fs: typeof import('fs/promises'),
  path: string,
): Promise<void> {
  try {
    await fs.access(path);
  } catch {
    await fs.mkdir(path, { recursive: true });
  }
}
