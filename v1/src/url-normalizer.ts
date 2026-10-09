import normalizeUrl from "normalize-url";

export function normalizeURLFn(url: string) {
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
