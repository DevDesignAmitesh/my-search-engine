import { parse } from "node-html-parser";
import { convert } from "html-to-text";

export async function htmlParser(url: string) {
  const respose = await fetch(url, { method: "GET" });
  const input = await respose.text();

  const root = parse(input);

  const hrefs = root
    .getElementsByTagName("a")
    .map((item) => item.attributes)
    .map((item) => {
      if (!item.href?.includes("http")) {
        return url + item.href;
      }
      return item.href;
    });

  const title = root
    .getElementsByTagName("title")
    .map((item) => item.innerText);

  const heading = root.getElementsByTagName("h1").map((item) => item.innerText);

  const raw_content = convert(input);

  return {
    raw_content,
    hrefs: hrefs,
    title: title[0] ?? heading[0]!,
  };
}

// console.log(await htmlParser("https://amitesh.work/"));
