import { htmlParser } from "./htmlparser";
import { indexerManager } from "./index-manager";
import { metadataManager } from "./metadata-manager";
import { tokeizer } from "./tokenizer";
import fs from "fs";

export async function indexerLoop({
  host,
  id,
  url,
}: {
  host: string;
  id: string;
  url: string;
}) {
  try {
    const val = metadataManager.get({ host, url });

    if (!val) return;
    if (val.status !== "crawled") return;

    const { raw_text, title } = await htmlParser(
      val.raw_file_location!,
      "file",
    );

    const tokens = tokeizer(raw_text);
    const snippet = raw_text.slice(0, 300);

    for (const word of tokens) {
      indexerManager.add({
        word,
        url: val.url,
        pageLength: tokens.length,
      });
    }

    metadataManager.add({
      ...val,
      title,
      snippet,
      status: "indexed",
    });

    fs.unlinkSync(val.raw_file_location!);
  } catch (e) {
    console.log("error in indexloop", e);
  }
}
