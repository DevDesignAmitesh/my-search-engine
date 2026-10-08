import { htmlParser } from "./htmlparser";
import { tokeizer } from "./tokenizer";
import { normalizeURL } from "./url-normalizer";

const { hrefs, raw_content, title } = await htmlParser("https://amitesh.work/");

console.log("title", title);

const tokens = tokeizer(raw_content);

console.log("tokens", tokens);

const urls = [];

for (let i = 0; i < hrefs.length; i++) {
  urls.push(normalizeURL(hrefs[i] ?? ""));
}

console.log("urls", urls);
