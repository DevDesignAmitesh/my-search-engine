import { tokenize } from "../api";

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function Highlight({ text, query }: { text: string; query: string }) {
  const terms = tokenize(query);
  if (!terms.length) return <>{text}</>;

  // Whole-word matches only, since the index stores whole tokens.
  const re = new RegExp(`(?<![a-zA-Z0-9])(${terms.map(escape).join("|")})(?![a-zA-Z0-9])`, "gi");
  const parts = text.split(re);

  return (
    <>
      {parts.map((part, i) => (i % 2 === 1 ? <mark key={i}>{part}</mark> : part))}
    </>
  );
}
