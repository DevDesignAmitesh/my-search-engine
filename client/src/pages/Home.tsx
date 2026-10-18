import { useEffect, useState } from "react";
import { ApiError, getMetadata, search, type RankedResult } from "../api";
import { Highlight } from "../components/Highlight";
import { SearchBox } from "../components/SearchBox";
import { Link, navigate, useLocation } from "../router";

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "done"; results: RankedResult[]; ms: number }
  | { kind: "error"; message: string };

const PAGE_SIZE = 10;

function displayUrl(url: string) {
  try {
    const u = new URL(url);
    const path = u.pathname === "/" ? "" : u.pathname.split("/").filter(Boolean).join(" › ");
    return { host: u.host, path };
  } catch {
    return { host: url, path: "" };
  }
}

export function Home() {
  const { search: qs } = useLocation();
  const query = new URLSearchParams(qs).get("q") ?? "";
  const [input, setInput] = useState(query);
  const [state, setState] = useState<State>({ kind: "idle" });
  const [page, setPage] = useState(1);
  const [indexed, setIndexed] = useState<{ pages: number; hosts: number } | null>(null);

  useEffect(() => setInput(query), [query]);

  useEffect(() => {
    if (query) return;
    getMetadata()
      .then((md) => {
        const done = md.filter((m) => m.status === "indexed");
        setIndexed({ pages: done.length, hosts: new Set(done.map((m) => m.host)).size });
      })
      .catch(() => setIndexed(null));
  }, [query]);

  useEffect(() => {
    if (!query) {
      setState({ kind: "idle" });
      return;
    }
    let cancelled = false;
    const started = performance.now();
    setState({ kind: "loading" });
    setPage(1);
    search(query)
      .then((results) => {
        if (!cancelled) setState({ kind: "done", results, ms: performance.now() - started });
      })
      .catch((e) => {
        if (!cancelled)
          setState({ kind: "error", message: e instanceof ApiError ? e.message : String(e) });
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  const submit = (value: string) => {
    if (!value) return;
    navigate(`/?q=${encodeURIComponent(value)}`);
  };

  if (!query) {
    return (
      <main className="home-hero">
        <div className="fade-rise">
          <p className="section-label">01 — Search</p>
          <h1 className="hero-title">
            Search the <span className="muted">index.</span>
          </h1>
          <SearchBox
            value={input}
            onChange={setInput}
            onSubmit={submit}
            placeholder="Search crawled pages"
            autoFocus
          />
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => submit(input.trim())}>
              Search
            </button>
            <Link href="/submit" className="link-arrow">
              Submit a URL →
            </Link>
          </div>
          <p className="hero-meta mono">
            {indexed
              ? `${indexed.pages.toLocaleString()} pages indexed · ${indexed.hosts.toLocaleString()} hosts`
              : "backend offline or index empty"}
          </p>
        </div>
      </main>
    );
  }

  const results = state.kind === "done" ? state.results : [];
  const visible = results.slice(0, page * PAGE_SIZE);

  return (
    <main className="results-page">
      <div className="results-bar">
        <SearchBox value={input} onChange={setInput} onSubmit={submit} compact />
      </div>

      <div className="results-body">
        {state.kind === "loading" && <p className="results-meta mono">searching…</p>}

        {state.kind === "error" && (
          <div className="notice error">
            <span className="mono">error</span> {state.message}
          </div>
        )}

        {state.kind === "done" && (
          <>
            <p className="results-meta mono">
              {results.length.toLocaleString()} result{results.length === 1 ? "" : "s"} ·{" "}
              {state.ms.toFixed(0)} ms
            </p>

            {results.length === 0 ? (
              <div className="empty">
                <p>
                  No pages matched <strong>{query}</strong>.
                </p>
                <p className="secondary">
                  Try different words, or{" "}
                  <Link href="/submit" className="link-arrow">
                    submit a URL to crawl →
                  </Link>
                </p>
              </div>
            ) : (
              <ol className="results">
                {visible.map((r) => {
                  const { host, path } = displayUrl(r.url);
                  return (
                    <li key={r.url} className="result fade-rise">
                      <a href={r.url} target="_blank" rel="noreferrer" className="result-link">
                        <span className="result-url mono">
                          {host}
                          {path && <span className="muted"> › {path}</span>}
                        </span>
                        <span className="result-title">
                          {r.title ? <Highlight text={r.title} query={query} /> : r.url}
                        </span>
                      </a>
                      {r.snippet && (
                        <p className="result-snippet">
                          <Highlight text={r.snippet} query={query} />
                        </p>
                      )}
                      {r.score > 1 && (
                        <span className="chip">
                          {r.score} terms matched
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}

            {visible.length < results.length && (
              <button className="btn-secondary" onClick={() => setPage((p) => p + 1)}>
                Show more results
              </button>
            )}
          </>
        )}
      </div>
    </main>
  );
}
