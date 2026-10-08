import normalizeUrl from "normalize-url";

export function normalizeURL(url: string) {
  try {
    return normalizeUrl(url, {
      removeExplicitPort: true,
      stripHash: true,
      stripTextFragment: true,
    });
  } catch (e) {
    console.log("this is the culprit", url);
    return "";
  }
}

// console.log(normalizeURL("https://amitesh/work//amitesh.pdf"));
