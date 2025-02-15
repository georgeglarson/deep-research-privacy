import blessed from 'blessed';
import { DeepResearchEvent } from '../types/deep-research.js';

export class TerminalUI {
  private screen: blessed.Widgets.Screen;
  private progressBox: blessed.Widgets.BoxElement;
  private apiBox: blessed.Widgets.BoxElement;
  private searchBox: blessed.Widgets.BoxElement;
  private learningsBox: blessed.Widgets.BoxElement;

  constructor() {
    // Create blessed screen
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'Deep Research UI'
    });

    // Create layout
    this.progressBox = blessed.box({
      parent: this.screen,
      top: '0',
      left: '0',
      width: '100%',
      height: '20%',
      label: ' Progress ',
      border: { type: 'line' },
      scrollable: true,
      scrollbar: {
        ch: ' ',
        track: {
          bg: 'cyan'
        },
        style: {
          inverse: true
        }
      },
      alwaysScroll: true,
      tags: true
    });

    this.apiBox = blessed.box({
      parent: this.screen,
      top: '20%',
      left: '0',
      width: '50%',
      height: '40%',
      label: ' API Calls ',
      border: { type: 'line' },
      scrollable: true,
      scrollbar: {
        ch: ' ',
        track: {
          bg: 'cyan'
        },
        style: {
          inverse: true
        }
      },
      alwaysScroll: true,
      tags: true
    });

    this.searchBox = blessed.box({
      parent: this.screen,
      top: '20%',
      left: '50%',
      width: '50%',
      height: '40%',
      label: ' Search Results ',
      border: { type: 'line' },
      scrollable: true,
      scrollbar: {
        ch: ' ',
        track: {
          bg: 'cyan'
        },
        style: {
          inverse: true
        }
      },
      alwaysScroll: true,
      tags: true
    });

    this.learningsBox = blessed.box({
      parent: this.screen,
      top: '60%',
      left: '0',
      width: '100%',
      height: '40%',
      label: ' Learnings ',
      border: { type: 'line' },
      scrollable: true,
      scrollbar: {
        ch: ' ',
        track: {
          bg: 'cyan'
        },
        style: {
          inverse: true
        }
      },
      alwaysScroll: true,
      tags: true
    });

    // Quit on Escape, q, or Control-C
    this.screen.key(['escape', 'q', 'C-c'], () => process.exit(0));

    // Initial render
    this.screen.render();
  }

  public handleEvent(event: DeepResearchEvent): void {
    switch (event.type) {
      case 'progress':
        this.updateProgress(event);
        break;
      case 'api_call':
        this.updateApiCalls(event);
        break;
      case 'search_result':
        this.updateSearchResults(event);
        break;
      case 'learning':
        this.updateLearnings(event);
        break;
      case 'completion':
        this.showCompletion(event);
        break;
    }
    this.screen.render();
  }

  private updateProgress(event: DeepResearchEvent & { type: 'progress' }): void {
    const { stage, percentage, message } = event.data;
    const content = `{bold}${stage}{/bold} (${percentage}%)\n${message}\n`;
    this.progressBox.insertBottom(content);
    this.progressBox.setScrollPerc(100);
  }

  private updateApiCalls(event: DeepResearchEvent & { type: 'api_call' }): void {
    const { provider, endpoint, status, response, error } = event.data;
    let content = `{bold}${provider}{/bold} - ${endpoint}\n`;
    
    if (status === 'error') {
      content += `{red-fg}Status: ${status}{/red-fg}\n`;
      if (error) content += `{red-fg}Error: ${error}{/red-fg}\n`;
    } else {
      content += `Status: ${status}\n`;
      if (response) content += `Response: ${response}\n`;
    }
    content += '\n';
    
    this.apiBox.insertBottom(content);
    this.apiBox.setScrollPerc(100);
  }

  private updateSearchResults(event: DeepResearchEvent & { type: 'search_result' }): void {
    const { query, results } = event.data;
    let content = `{bold}Query:{/bold} ${query}\n`;
    results.forEach(result => {
      content += `{bold}${result.title}{/bold}\n${result.snippet}\n\n`;
    });
    this.searchBox.insertBottom(content);
    this.searchBox.setScrollPerc(100);
  }

  private updateLearnings(event: DeepResearchEvent & { type: 'learning' }): void {
    const { topic, content, confidence } = event.data;
    const text = `{bold}${topic}{/bold} (${confidence}%)\n${content}\n\n`;
    this.learningsBox.insertBottom(text);
    this.learningsBox.setScrollPerc(100);
  }

  private showCompletion(event: DeepResearchEvent & { type: 'completion' }): void {
    const { summary, outputFile } = event.data;
    
    // Clear progress box and show completion message
    this.progressBox.setContent('');
    
    if (summary === 'Failed to generate summary.') {
      // Show error state
      this.progressBox.insertBottom('{bold}{yellow-fg}Research Complete with Errors{/yellow-fg}{/bold}\n\n');
      this.progressBox.insertBottom('{yellow-fg}Note: Some API calls failed during research.{/yellow-fg}\n');
      this.progressBox.insertBottom('Check the API Calls panel for details.\n\n');
    } else {
      // Show success state
      this.progressBox.insertBottom('{bold}{green-fg}Research Complete!{/green-fg}{/bold}\n\n');
      this.progressBox.insertBottom('Summary:\n' + summary + '\n\n');
    }
    
    this.progressBox.insertBottom(`Results saved to: ${outputFile}\n`);
    this.progressBox.insertBottom('\nPress q, Escape, or Ctrl+C to exit');
    this.progressBox.setScrollPerc(100);

    // Update box titles to show completion state
    const state = summary === 'Failed to generate summary.' ? '(Completed with Errors)' : '(Complete)';
    this.progressBox.setLabel(` Progress ${state} `);
    this.apiBox.setLabel(` API Calls ${state} `);
    this.searchBox.setLabel(` Search Results ${state} `);
    this.learningsBox.setLabel(` Learnings ${state} `);

    // Add completion indicator to each panel
    const indicator = summary === 'Failed to generate summary.' ? 
      '{bold}{yellow-fg}Completed with Errors{/yellow-fg}{/bold}' :
      '{bold}{green-fg}Complete{/green-fg}{/bold}';
    
    this.apiBox.insertBottom(`\n${indicator}\n`);
    this.searchBox.insertBottom(`\n${indicator}\n`);
    this.learningsBox.insertBottom(`\n${indicator}\n`);

    // Scroll all panels to show completion
    this.apiBox.setScrollPerc(100);
    this.searchBox.setScrollPerc(100);
    this.learningsBox.setScrollPerc(100);
  }
}