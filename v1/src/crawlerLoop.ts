import { hostManager } from "./host-manager";
import { htmlParser } from "./htmlparser";
import fs from "fs";
import { normalizeURLFn } from "./url-normalizer";

export async function crawlerLoop() {
  const now = Date.now();

  // getting per host url
  const { url, id } = hostManager.getNextHostUrl();
  if (!url) return;

  // get the html
  const { hrefs, html } = await htmlParser(url);

  if (!fs.existsSync("./raw/data"))
    fs.mkdirSync("./raw/data", { recursive: true });

  if (!fs.existsSync(`./raw/data/${id}html`))
    fs.writeFileSync(`./raw/data/${id}.html`, html);

  console.log("time-taken-in-a-single-crawl", Date.now() - now);

  for (const val of hrefs) {
    // if a in-valid url
    const normaliedUrl = normalizeURLFn(val);
    if (!normaliedUrl) return;

    // check if its already existing
    const existingUrl = hostManager.checkExistingUrl({ url: normaliedUrl });
    if (existingUrl) continue;

    hostManager.addUrlToHosts(normaliedUrl);
  }
}
