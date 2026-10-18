import fs from "fs";

type MetaDataPayload = {
  id: string;
  url: string;
  host: string;
  status: "crawled" | "indexed" | "failed";
  crawl_itme: number;
  index_time?: number;
  raw_file_location?: string;
  title?: string;
  snippet?: string;
};

type MetaData = Map<string, MetaDataPayload>;

class MetadataManager {
  private static instance: MetadataManager;
  private metadatas: MetaData;

  constructor() {
    this.metadatas = new Map();
  }

  static getInstance(): MetadataManager {
    if (!MetadataManager.instance)
      MetadataManager.instance = new MetadataManager();
    return MetadataManager.instance;
  }

  save() {
    fs.writeFileSync("md.json", JSON.stringify(Array.from(this.metadatas)));
  }

  add(payload: MetaDataPayload) {
    const key = `url:${payload.url}-host:${payload.host}`;

    this.metadatas.set(key, payload);
  }

  get({ url, host }: { url: string; host: string }) {
    const key = `url:${url}-host:${host}`;

    return this.metadatas.get(key);
  }

  getAll() {
    return this.metadatas;
  }

  getMetaDataInArray() {
    return Array.from(this.metadatas.values());
  }
}

export const metadataManager = MetadataManager.getInstance();
