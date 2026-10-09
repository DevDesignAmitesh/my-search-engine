import { hostManager } from "./host-manager";
import { htmlParser } from "./htmlparser";
import fs from "fs";
import { normalizeURLFn } from "./url-normalizer";

export async function crawlerLoop() {
  console.log("running");
  // getting per host url
  const { url, id } = hostManager.getNextHostUrl();
  console.log("url", url);
  if (!url) return;

  // get the html
  const { hrefs, html } = await htmlParser(url);

  if (!fs.existsSync("./raw/data"))
    fs.mkdirSync("./raw/data", { recursive: true });

  if (!fs.existsSync(`./raw/data/${id}`))
    fs.writeFileSync(`./raw/data/${id}`, html);

  for (const val of hrefs) {
    const normaliedUrl = normalizeURLFn(val);

    // check if its already existing
    const existingUrl = hostManager.checkExistingUrl({ url: normaliedUrl });
    if (existingUrl) return;

    hostManager.addUrlToHosts(normaliedUrl);
  }
}
