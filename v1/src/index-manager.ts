import fs from "fs";

type IndexesPayload = { urls: string[]; count: number; totalPages: number };

type Indexes = Map<string, IndexesPayload>;

class IndexerManager {
  private static instance: IndexerManager;
  private indexes: Indexes;

  constructor() {
    this.indexes = new Map();
  }

  static getInstance(): IndexerManager {
    if (!IndexerManager.instance)
      IndexerManager.instance = new IndexerManager();
    return IndexerManager.instance;
  }

  save() {
    fs.writeFileSync("indexes.json", JSON.stringify(Array.from(this.indexes)));
  }

  add({ word, url }: { word: string; url: string }) {
    const key = word;

    if (!this.indexes.has(key)) {
      this.indexes.set(key, { count: 1, urls: [url], totalPages: 1 });
    } else {
      const existing = this.indexes.get(key)!;
      existing.count += 1;

      const existingUrl = existing.urls.find((val) => val == url);
      if (!existingUrl) existing.urls.push(url);
      existing.totalPages = existing.urls.length;

      this.indexes.set(key, existing);
    }
  }

  search(query: string) {
    const queries = query.split(/(\s+)/).filter((val) => val !== " ");
    const suggestions: Map<string, string> = new Map();

    for (const q of queries) {
      for (const [key, val] of this.indexes.entries()) {
        const isOccured = checkOccurrence(q, key);

        if (isOccured) {
          for (const url of val.urls) {
            if (!suggestions.has(url)) suggestions.set(url, url);
          }
        }
      }
    }

    return Array.from(suggestions.values());
  }
}

export const indexerManager = IndexerManager.getInstance();

function checkOccurrence(query: string, compareWith: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedCompareWith = compareWith.trim().toLowerCase();

  for (let i = 0; i < normalizedCompareWith.length; i++) {
    let j;

    for (j = 0; j < normalizedQuery.length; j++) {
      if (normalizedCompareWith[i + j] !== normalizedQuery[j]) break;
    }

    if (j === normalizedQuery.length) {
      return true;
    }
  }

  return false;
}
