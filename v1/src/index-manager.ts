import fs from "fs";
import { metadataManager } from "./metadata-manager";
type IndexesPayload = { urls: string[]; count: number };

type Indexes = Map<string, IndexesPayload>;

class IndexerManager {
  private static instance: IndexerManager;
  private indexes: Indexes;
  private count: number = 0;

  constructor() {
    this.indexes = new Map();

    setTimeout(() => {
      fs.writeFileSync(
        "indexes.json",
        JSON.stringify(Array.from(this.indexes)),
      );
    }, 20 * 1000);
  }

  static getInstance(): IndexerManager {
    if (!IndexerManager.instance)
      IndexerManager.instance = new IndexerManager();
    return IndexerManager.instance;
  }

  add({
    id,
    word,
    url,
    host,
  }: {
    id: string;
    host: string;
    word: string;
    url: string;
  }) {
    const key = `id:${id}-url:${url}-host:${host}-word:${word}`;

    if (!this.indexes.has(key)) {
      this.indexes.set(key, { count: 1, urls: [url] });
    } else {
      const existing = this.indexes.get(key)!;
      existing.count += 1;
      const existingUrl = existing.urls.find((val) => val == url);
      if (!existingUrl) existing.urls.push(url);
      this.indexes.set(key, existing);
    }
  }

  search(query: string) {
    const queries = query.split(/(\s+)/).filter((val) => val !== " ");
    const suggestions = [];

    for (const q of queries) {
      for (const [key, val] of this.indexes.entries()) {
        const id = key.split("id:")[1]?.split("-url")[0]!;
        const host = key.split("host:")[1]?.split("-word")[0]!;
        const url = key.split("url:")[1]?.split("-host")[0]!;
        const word = key.split("word:")[1]!;

        if (val.count > this.count && word.includes(q)) {
          this.count = val.count;

          const md = metadataManager.get({ host, id, url });

          suggestions.push({
            urls: val.urls,
            title: md?.title,
            snippet: md?.snippet,
          });
        }
      }
    }

    return suggestions;
  }
}

export const indexerManager = IndexerManager.getInstance();
