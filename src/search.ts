import { output } from './output-manager.js';
import {
  SearchProvider,
  SearchResult,
  suggestSearchProvider,
} from './search/providers.js';

export interface SearchItem {
  content?: string;
  source?: string;
}

export type SearchProviderType = 'brave' | 'venice' | 'hybrid';

let currentProvider: SearchProviderType = 'brave';

export function setSearchProvider(provider: SearchProviderType) {
  currentProvider = provider;
  output.log(`Search provider set to: ${provider}`);
}

export function getSearchProvider(): SearchProviderType {
  return currentProvider;
}

export async function search(query: string): Promise<SearchItem[]> {
  try {
    const searchQuery = String(query || '').trim();
    if (!searchQuery) {
      return [];
    }

    output.log(`Starting ${currentProvider} search...`);
    const results = await suggestSearchProvider({
      type: 'web',
      provider: currentProvider,
    }).search(searchQuery);
    return results.map(toSearchItem);
  } catch (error) {
    output.log('Search error:', error);
    return [];
  }
}

function toSearchItem(result: SearchResult): SearchItem {
  return {
    content: result.content,
    source: result.source,
  };
}
