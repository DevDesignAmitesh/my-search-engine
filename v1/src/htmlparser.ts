import { parse } from "node-html-parser";
import { convert } from "html-to-text";
import { readFile } from "node:fs/promises";

type SourceType = "file" | "url";

export async function htmlParser(source: string, type: SourceType) {
  let html: string;
  let baseUrl: string | undefined;

  if (type === "file") {
    html = await readFile(source, "utf-8");
  } else {
    const response = await fetch(source, {
      signal: AbortSignal.timeout(15_000),
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${source}: ${response.status}`);
    }

    html = await response.text();
    baseUrl = response.url || source;
  }

  const root = parse(html);

  const cleanText = (text: string) => text.replace(/\s+/g, " ").trim();

  // 1. Extract title
  const title =
    cleanText(root.querySelector("title")?.textContent ?? "") ||
    cleanText(
      root
        .querySelector('meta[property="og:title"]')
        ?.getAttribute("content") ?? "",
    ) ||
    cleanText(root.querySelector("h1")?.textContent ?? "") ||
    null;

  // 2. Extract headings while preserving hierarchy
  const headings = ["h1", "h2", "h3", "h4", "h5", "h6"]
    .flatMap((tag) =>
      root.getElementsByTagName(tag).map((element) => ({
        level: Number(tag[1]),
        text: cleanText(element.textContent),
      })),
    )
    .filter((heading) => heading.text.length > 0)
    .map((val) => val.text);

  // 3. Extract links with their text and resolved URLs
  const links = root
    .getElementsByTagName("a")
    .map((element) => {
      const href = element.getAttribute("href")?.trim();

      if (!href) return null;

      try {
        const resolvedUrl = baseUrl ? new URL(href, baseUrl) : new URL(href);

        // Keep web links only
        if (
          resolvedUrl.protocol !== "http:" &&
          resolvedUrl.protocol !== "https:"
        ) {
          return null;
        }

        // return {
        //   text: cleanText(element.textContent),
        //   href: resolvedUrl.href,
        // };

        return resolvedUrl.href;
      } catch {
        return null;
      }
    })
    .filter((link) => link !== null);

  // 4. Extract readable page text
  const rawText = convert(html, {
    wordwrap: false,
    selectors: [
      { selector: "script", format: "skip" },
      { selector: "style", format: "skip" },
      { selector: "nav", format: "skip" },
      { selector: "footer", format: "skip" },
    ],
  });

  return {
    html,
    title: title ?? headings[0] ?? "",
    hrefs: links,
    raw_text: rawText,
  };
}
