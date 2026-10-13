import { subscribe } from "./file-comm";
import { htmlParser } from "./htmlparser";
import { indexerManager } from "./index-manager";
import { metadataManager } from "./metadata-manager";
import { tokeizer } from "./tokenizer";

export async function indexerLoop() {
  console.log("indexing");

  const { data } = await subscribe();

  const { host, id, url } = JSON.parse(data);

  const val = metadataManager.get({ host, id, url });

  if (!val) return;
  if (val.status !== "crawled") return;

  const { raw_text, title } = await htmlParser(val.raw_file_location!, "file");

  const tokens = tokeizer(raw_text);
  const snippet = raw_text.slice(0, 300);

  for (const word of tokens) {
    indexerManager.add({
      word,
      url: val.url,
    });
  }

  metadataManager.add({
    ...val,
    title,
    snippet,
    status: "indexed",
    tokens,
  });

  metadataManager.save();
  indexerManager.save();
}
