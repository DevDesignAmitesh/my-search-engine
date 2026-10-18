import fs from "fs";
import { tokeizer } from "./tokenizer";
import { metadataManager } from "./metadata-manager";
import { hostManager } from "./host-manager";

type IndexesPayload = {
  count: number;
  totalPages: number;
  countPerPage: Map<string, number>;
  pageLength: number;
};

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

  add({
    word,
    url,
    pageLength,
  }: {
    word: string;
    url: string;
    pageLength: number;
  }) {
    const key = word;

    if (!this.indexes.has(key)) {
      this.indexes.set(key, {
        count: 1,
        totalPages: 1,
        countPerPage: new Map().set(url, 1),
        pageLength,
      });
    } else {
      const existing = this.indexes.get(key)!;
      existing.count += 1;

      const existingPerPageUrl = existing.countPerPage.get(url);

      if (existingPerPageUrl) {
        existing.countPerPage.set(url, existingPerPageUrl + 1);
      } else {
        existing.countPerPage.set(url, 1);
      }

      this.indexes.set(key, existing);
    }
  }

  search(query: string) {
    const queries = tokeizer(query);

    const commonUrl = new Set();

    for (const q of queries) {
      const val = this.indexes.get(q);

      if (val) {
        for (const url of Array.from(val.countPerPage.keys())) {
          const host = hostManager.getHost(url);
          const md = metadataManager.get({ url, host });

          commonUrl.add({
            url,
            title: md?.title,
            snippet: md?.snippet,
          });
        }
      }
    }

    return Array.from(commonUrl.values());
  }
}

export const indexerManager = IndexerManager.getInstance();

// function checkOccurrence(query: string, compareWith: string): boolean {
//   const normalizedQuery = query.trim().toLowerCase();
//   const normalizedCompareWith = compareWith.trim().toLowerCase();

//   for (let i = 0; i < normalizedCompareWith.length; i++) {
//     let j;

//     for (j = 0; j < normalizedQuery.length; j++) {
//       if (normalizedCompareWith[i + j] !== normalizedQuery[j]) break;
//     }

//     if (j === normalizedQuery.length) {
//       return true;
//     }
//   }

//   return false;
// }
