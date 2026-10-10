import fs from "fs";
type IndexesPayload = { urls: string[]; count: number };

type Indexes = Map<string, IndexesPayload>;

class IndexerManager {
  private static instance: IndexerManager;
  private indexes: Indexes;

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

  add(key: string, url: string) {
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
}

export const indexerManager = IndexerManager.getInstance();
