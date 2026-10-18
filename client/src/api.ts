let API_URL = "http://localhost:4000";
try {
  API_URL = process.env.BUN_PUBLIC_API_URL || API_URL;
} catch {}

export type SearchResult = {
  url: string;
  title?: string;
  snippet?: string;
};

export type RankedResult = SearchResult & { score: number };

export type MetaData = {
  id: string;
  url: string;
  host: string;
  status: "crawled" | "indexed" | "failed";
  crawl_itme: number;
  index_time?: number;
  raw_file_location?: string;
  title?: string;
  snippet?: string;
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError(0, `Cannot reach the backend at ${API_URL}`);
  }

  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, body.message ?? res.statusText);
  return body as T;
}

// Mirrors v1/src/tokenizer.ts so highlighting matches what the index matched.
export function tokenize(input: string): string[] {
  return input
    .replace(/[^a-zA-Z0-9ऀ-ॿ ]/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .split(" ")
    .filter((val) => val !== "");
}

export async function search(query: string): Promise<RankedResult[]> {
  const { suggestions } = await request<{ suggestions: SearchResult[] }>(
    `/search?query=${encodeURIComponent(query)}`,
  );

  // The backend emits one entry per matched query term, so a URL appearing
  // N times matched N terms. Collapse duplicates and rank by that count.
  const byUrl = new Map<string, RankedResult>();
  for (const s of suggestions) {
    const existing = byUrl.get(s.url);
    if (existing) existing.score += 1;
    else byUrl.set(s.url, { ...s, score: 1 });
  }

  return Array.from(byUrl.values()).sort((a, b) => b.score - a.score);
}

export function submitUrl(url: string) {
  return request<{ message: string; metaData: MetaData[] }>("/submit-url", {
    method: "POST",
    body: JSON.stringify({ url }),
  });
}

export async function getMetadata(): Promise<MetaData[]> {
  const { metaData } = await request<{ metaData: MetaData[] }>("/metadata");
  return metaData;
}
