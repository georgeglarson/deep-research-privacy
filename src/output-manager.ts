import { ResearchProgress } from './deep-research.js';

export class OutputManager {
  private progressBarWidth = 20;
  private spinnerStates = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  private spinnerIndex = 0;
  private spinnerInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.spinnerInterval = setInterval(() => {
      this.spinnerIndex = (this.spinnerIndex + 1) % this.spinnerStates.length;
    }, 80);
  }

  log(...args: unknown[]): void {
    console.log(...args);
  }

  updateProgress(progress: ResearchProgress): void {
    const totalSteps = progress.totalDepth * progress.totalBreadth;
    const completedSteps = progress.completedQueries || 0;
    const percent = Math.min(
      100,
      Math.max(0, Math.round((completedSteps / totalSteps) * 100)),
    );
    const filledLength = Math.min(
      this.progressBarWidth,
      Math.max(0, Math.round((this.progressBarWidth * percent) / 100)),
    );

    const bar =
      '[' +
      '█'.repeat(filledLength) +
      '░'.repeat(this.progressBarWidth - filledLength) +
      ']';

    process.stdout.write(
      `\rOverall Progress: ${bar} ${percent}%\nDepth: ${progress.currentDepth}/${progress.totalDepth} | Breadth: ${progress.currentBreadth}/${progress.totalBreadth} | Queries: ${progress.completedQueries}/${progress.totalQueries}\nCurrent Query: ${progress.currentQuery || 'Initializing...'}${this.spinnerStates[this.spinnerIndex]}`,
    );
  }

  cleanup(): void {
    if (this.spinnerInterval) {
      clearInterval(this.spinnerInterval);
      this.spinnerInterval = null;
    }
  }
}

export const output = new OutputManager();
