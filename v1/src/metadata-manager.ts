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

  add(payload: MetaDataPayload) {
    const key = `id:${payload.id}-url:${payload.url}-host:${payload.host}`;

    this.metadatas.set(key, payload);
  }
}

export const metadataManager = MetadataManager.getInstance();
