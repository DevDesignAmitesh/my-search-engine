import { hostManager } from "./host-manager";
import { htmlParser } from "./htmlparser";
import fs from "fs";
import { normalizeURLFn } from "./url-normalizer";
import { metadataManager } from "./metadata-manager";

export async function crawlerLoop() {
  const now = Date.now();

  // getting per host url
  const { url, id, host } = hostManager.getNextHostUrl();
  if (!url || !id || !host) return;

  try {
    // get the html
    const { hrefs, html } = await htmlParser(url, "url");

    if (!fs.existsSync("./raw/data"))
      fs.mkdirSync("./raw/data", { recursive: true });

    const fileLocation = `./raw/data/${id}.html`;

    if (!fs.existsSync(fileLocation)) fs.writeFileSync(fileLocation, html);

    const crawlTime = Date.now() - now;

    console.log("time-taken-in-a-single-crawl", crawlTime);

    // save meta-data
    metadataManager.add({
      id,
      host,
      url,
      status: "crawled",
      raw_file_location: fileLocation,
      crawl_itme: crawlTime,
    });

    for (const val of hrefs) {
      // if a in-valid url
      const normaliedUrl = normalizeURLFn(val);
      if (!normaliedUrl) continue;

      // check if its already existing
      const existingUrl = hostManager.checkExistingUrl({ url: normaliedUrl });
      if (existingUrl) continue;

      console.log("existingURL", existingUrl);

      hostManager.addUrlToHosts(normaliedUrl);
    }
  } catch (e) {
    console.log("error", e);

    const crawlTime = Date.now() - now;

    // save meta-data
    metadataManager.add({
      id,
      host,
      url,
      status: "failed",
      crawl_itme: crawlTime,
    });
  }
}
