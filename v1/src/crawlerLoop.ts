import { htmlParser } from "./htmlparser";

export async function crawlerLoop(url: string) {
  // get the html
  const { hrefs, html } = await htmlParser(url);
}
