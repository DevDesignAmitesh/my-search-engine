export function tokeizer(input: string): string[] {
  return input
    .replace(/[^a-zA-Z0-9\u0900-\u097F ]/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .split(" ")
    .filter((val) => val !== "");
}
