import { ResearchProgress } from './deep-research.js';

class OutputManager {
  private progressBar: string[] = [];
  private progressBarWidth = 20;

  log(...args: any[]) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}]`, ...args);
  }

  error(...args: any[]) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}]`, ...args);
  }

  cleanup() {
    // Clear progress bar
    this.progressBar = [];
  }

  updateProgress(progress: ResearchProgress) {
    const { completedQueries, totalQueries, currentQuery } = progress;

    // Calculate percentage, ensuring it doesn't exceed 100%
    const percent = Math.min(Math.round((completedQueries / Math.max(totalQueries, 1)) * 100), 100);

    // Create progress bar
    const filled = Math.round((percent / 100) * this.progressBarWidth);
    const empty = this.progressBarWidth - filled;
    const bar = `[${'█'.repeat(filled)}${'░'.repeat(Math.max(empty, 0))}]`;

    // Format output
    const status = `Overall Progress: ${bar} ${percent}%`;
    const details = `Depth: ${progress.currentDepth}/${progress.totalDepth} | Breadth: ${progress.currentBreadth}/${progress.totalBreadth} | Queries: ${completedQueries}/${totalQueries}`;
    const query = currentQuery ? `Current Query: ${currentQuery}` : '';

    // Update progress display
    this.log(status);
    this.log(details);
    if (query) this.log(query);

    // Update analysis progress if available
    if (progress.analysis) {
      this.log('Analysis Progress:', progress.analysis);
    }
  }
}

export const output = new OutputManager();
