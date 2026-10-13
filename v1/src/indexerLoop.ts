import { htmlParser } from "./htmlparser";
import { indexerManager } from "./index-manager";
import { metadataManager } from "./metadata-manager";
import { tokeizer } from "./tokenizer";

export async function indexerLoop() {
  const metadatas = metadataManager.getAll();

  for (const [key, val] of metadatas.entries()) {
    if (val.status !== "crawled") continue;

    const { raw_text, title } = await htmlParser(
      val.raw_file_location!,
      "file",
    );

    const tokens = tokeizer(raw_text);
    const snippet = raw_text.slice(0, 300);

    const existingMetaData = metadataManager.get({
      url: val.url,
      host: val.host,
      id: val.id,
    })!;

    metadataManager.add({
      ...existingMetaData,
      title,
      snippet,
      status: "indexed",
      tokens,
    });

    const pages = [val.url];

    for (const word of tokens) {
      if (word.length <= 3) continue;

      const existingMetaDatas = metadataManager.getAll();

      // for counting how many pages contain this word;
      for (const [key, val] of existingMetaDatas) {
        if (val.tokens.includes(word)) pages.push(val.url);
      }

      indexerManager.add({
        id: val.id,
        host: val.host,
        word,
        url: val.url,
        pages,
      });
    }
  }
}
