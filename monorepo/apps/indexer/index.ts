import { redisManager } from "@repo/redis-manager/client";

async function main() {
  const response = await redisManager.getFromIndexerQueue();

  if (!response) {
  } else {
    const { element, key } = response;
    console.log("response in indexer-queue", element, key);
  }
}

setInterval(main, 5 * 1000);
