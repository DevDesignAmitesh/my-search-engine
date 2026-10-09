import { createClient, type RedisClientType } from "redis";

class RedisManager {
  private static instance: RedisManager;
  private client: RedisClientType;

  constructor() {
    this.client = createClient();
  }

  static getInstance(): RedisManager {
    if (!RedisManager.instance) RedisManager.instance = new RedisManager();

    return RedisManager.instance;
  }

  checkAndAddUrl = async ({ url }: { url: string }) => {
    const key = "urls";

    return await this.client.sAdd(key, url);
  };

  addToCrawlerQueue = async ({ url }: { url: string }) => {
    const key = "crawler_queue";

    await this.client.lPush(key, JSON.stringify({ url }));
  };

  getFromCrawlerQueue = async () => {
    const key = "crawler_queue";

    return this.client.brPop(key, 0);
  };

  addToIndexerQueue = async (someData) => {
    const key = "indexer_queue";

    await this.client.lPush(key, JSON.stringify({ someData }));
  };

  getFromIndexerQueue = async () => {
    const key = "indexer_queue";

    return this.client.brPop(key, 0);
  };
}

export const redisManager = RedisManager.getInstance();
