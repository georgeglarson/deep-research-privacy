import * as fs from 'fs/promises';
import * as path from 'path';
import * as readline from 'readline';

import { generateSummary } from './ai/providers.js';
import { ResearchEngine } from './deep-research.js';
import { output } from './output-manager.js';
import { ensureDir } from './utils.js';
import { uiClient } from 'deep-research-ui';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(query: string): Promise<string> {
  return new Promise(resolve => {
    rl.question(query, answer => {
      resolve(answer);
    });
  });
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 50); // Limit length
}

async function cleanup(error?: unknown) {
  rl.close();
  output.cleanup();

  if (error) {
    if (error instanceof Error) {
      output.log('Error:', error.message);
      if ('code' in error) {
        output.log('Code:', (error as { code: string }).code);
      }
    } else {
      output.log('Unknown error:', error);
    }
    process.exit(1);
  }

  process.exit(0);
}

interface ParsedArgs {
  options: { [key: string]: string | boolean };
  positional: string[];
}

function parseArgs(): ParsedArgs {
  const args = process.argv.slice(2);
  const options: { [key: string]: string | boolean } = {};
  const positional: string[] = [];
  let currentQuoted = '';
  let inQuotes = false;

  args.forEach((arg) => {
    if (arg.startsWith('--')) {
      const flag = arg.slice(2);
      options[flag] = true;
    } else if (inQuotes) {
      currentQuoted += ' ' + arg;
      if (arg.endsWith('"')) {
        inQuotes = false;
        positional.push(currentQuoted.slice(1, -1)); // Remove quotes
        currentQuoted = '';
      }
    } else if (arg.startsWith('"')) {
      if (arg.endsWith('"') && arg.length > 1) {
        positional.push(arg.slice(1, -1));
      } else {
        inQuotes = true;
        currentQuoted = arg;
      }
    } else {
      positional.push(arg);
    }
  });

  return { options, positional };
}

async function run() {
  try {
    const { options, positional } = parseArgs();
    const enableUI = 'ui' in options;

    if (enableUI) {
      output.log('\nNote: To use the UI visualization, run in a separate terminal:');
      output.log('npm run start:ui\n');
    }

    // Get research parameters
    let query = '';
    if (positional.length > 0) {
      query = positional.join(' ');
    } else {
      query = await askQuestion('What would you like to research? ');
    }

    if (!query.trim()) {
      throw new Error('Query cannot be empty');
    }

    const breadth = parseInt(
      positional[1] ||
        (await askQuestion('Enter research breadth (2-10)? [3] ')),
      10,
    ) || 3;

    const depth = parseInt(
      positional[2] ||
        (await askQuestion('Enter research depth (1-5)? [2] ')),
      10,
    ) || 2;

    output.log('\nStarting research...');
    output.log(`Query: ${query}`);
    output.log(`Depth: ${depth} Breadth: ${breadth}\n`);

    const engine = new ResearchEngine({
      query,
      breadth,
      depth,
      enableUI,
      onProgress: progress => {
        output.updateProgress(progress);
      },
    });

    const { learnings, sources } = await engine.research();

    output.log('\nGenerating narrative summary...');
    const summary = await generateSummary({
      query,
      learnings,
    });

    // Ensure research directory exists
    await ensureDir(fs, 'research');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const subject = slugify(query);
    const filename = path.join(
      'research',
      `research-${subject}-${timestamp}.md`,
    );

    const report = [
      '# Research Results',
      '----------------\n',
      '## Research Parameters',
      `- Query: ${query}`,
      `- Depth: ${depth}`,
      `- Breadth: ${breadth}`,
      '',
      '## Summary',
      summary,
      '',
      '## Key Learnings',
      ...learnings.map((l, i) => `${i + 1}. ${l}`),
      '',
      '## Sources',
      ...sources.map(s => `- ${s}`),
    ].join('\n');

    await fs.writeFile(filename, report);

    output.log('\nResearch Results:');
    output.log('----------------\n');
    output.log('Summary:');
    output.log(summary);
    output.log('\nKey Learnings:');
    learnings.forEach((l, i) => output.log(`${i + 1}. ${l}`));
    output.log('\nSources:');
    sources.forEach(s => output.log(`- ${s}`));
    output.log(`\nResults saved to ${filename}`);

    // Send completion event if UI is enabled
    if (enableUI) {
      uiClient.sendEvent({
        type: 'completion',
        timestamp: Date.now(),
        data: {
          summary,
          learnings,
          sources,
          outputFile: filename
        }
      });

      // Give the UI time to process the completion event
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    await cleanup();
  } catch (error) {
    await cleanup(error);
  }
}

run().catch(async error => {
  await cleanup(error);
});
