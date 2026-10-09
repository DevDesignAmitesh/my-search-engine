import { redisManager } from "@repo/redis-manager/client";

async function main() {
  const response = await redisManager.getFromCrawlerQueue();

  if (!response) return;

  const { element, key } = response;
  console.log("response in crawler-queue", element, key);

  const parsedData = JSON.parse(element);

  // get the html
  const res = await fetch(parsedData.url);
  const input = await res.text();

  // store html in object store
  const s3Metadata = await s3Manager.getSignedURLAndPut({ html: input });

  // store some-data in db like { url, content-hash, s3-location, statue: "crawled" }
  // push the event in index_queue
}

setInterval(main, 5 * 1000);
