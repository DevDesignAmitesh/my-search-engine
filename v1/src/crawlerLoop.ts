import { hostManager } from "./host-manager";
import { htmlParser } from "./htmlparser";
import fs from "fs";
import { normalizeURLFn } from "./url-normalizer";
import { metadataManager } from "./metadata-manager";
import { indexerLoop } from "./indexerLoop";

export async function crawlerLoop() {
  console.log("running");

  const now = Date.now();

  // getting per host url
  const { url, id, host } = await hostManager.getNextHostUrl();

  if (!url || !id || !host) {
    setTimeout(crawlerLoop, 5 * 1000);
    return;
  }

  try {
    // get the html
    const { hrefs, html } = await htmlParser(url, "url");

    if (!fs.existsSync("./raw/data"))
      fs.mkdirSync("./raw/data", { recursive: true });

    const fileLocation = `./raw/data/${id}.html`;

    if (!fs.existsSync(fileLocation)) fs.writeFileSync(fileLocation, html);

    for (const val of hrefs) {
      // if a in-valid url
      const normaliedUrl = normalizeURLFn(val);
      if (!normaliedUrl) continue;

      // check if its already existing
      const existingUrl = hostManager.checkExistingUrl({ url: normaliedUrl });
      if (existingUrl) continue;

      hostManager.addUrlToHosts(normaliedUrl);
    }

    const crawlTime = Date.now() - now;

    console.log("crawelTime", crawlTime);

    // save meta-data
    metadataManager.add({
      id,
      host,
      url,
      status: "crawled",
      raw_file_location: fileLocation,
      crawl_itme: crawlTime,
    });

    crawlerLoop();
    indexerLoop({ id, host, url });
    hostManager.setNextAllowedTimeForHost({ host });
  } catch (e) {
    const crawlTime = Date.now() - now;

    // save meta-data
    metadataManager.add({
      id,
      host,
      url,
      status: "failed",
      crawl_itme: crawlTime,
    });

    crawlerLoop();
  }
}
