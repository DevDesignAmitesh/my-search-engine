import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ApiError, getMetadata, submitUrl, type MetaData } from "../api";

type Status = MetaData["status"];
type Filter = "all" | Status;

type Notice = { kind: "success" | "error"; text: string } | null;

const POLL_MS = 3000;
const PAGE_SIZE = 50;

// Loose comparison against backend-normalized URLs (normalize-url strips
// trailing slashes, default ports, etc).
const loose = (url: string) =>
  url
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/#.*$/, "")
    .replace(/\/+$/, "");

function StatusChip({ status }: { status: Status | "queued" }) {
  return <span className={`chip status-${status}`}>{status}</span>;
}

export function Submit() {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<MetaData[]>([]);
  const [offline, setOffline] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [limit, setLimit] = useState(PAGE_SIZE);

  // Crawling is async on the backend, so poll for progress while on this page.
  useEffect(() => {
    let alive = true;
    const tick = () =>
      getMetadata()
        .then((md) => {
          if (!alive) return;
          setMetadata(md);
          setOffline(false);
        })
        .catch(() => alive && setOffline(true));
    tick();
    const id = setInterval(tick, POLL_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const value = url.trim();
    if (!value) return;
    const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;

    setBusy(true);
    setNotice(null);
    try {
      const res = await submitUrl(withProtocol);
      setMetadata(res.metaData);
      setSubmitted(withProtocol);
      setNotice({ kind: "success", text: "Accepted. The crawler will pick it up shortly." });
      setUrl("");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setSubmitted(withProtocol);
        setNotice({ kind: "error", text: "This URL is already queued or crawled." });
      } else if (err instanceof ApiError && err.status === 400) {
        setNotice({ kind: "error", text: "That doesn't look like a valid URL." });
      } else {
        setNotice({ kind: "error", text: err instanceof Error ? err.message : String(err) });
      }
    } finally {
      setBusy(false);
    }
  };

  const counts = useMemo(() => {
    const c = { all: metadata.length, indexed: 0, crawled: 0, failed: 0 };
    for (const m of metadata) c[m.status] += 1;
    return c;
  }, [metadata]);

  const hosts = useMemo(() => new Set(metadata.map((m) => m.host)).size, [metadata]);

  const tracked = useMemo(
    () => (submitted ? metadata.find((m) => loose(m.url) === loose(submitted)) : undefined),
    [metadata, submitted],
  );

  // Newest first: the backend Map preserves insertion order.
  const rows = useMemo(() => {
    const list = filter === "all" ? metadata : metadata.filter((m) => m.status === filter);
    return [...list].reverse();
  }, [metadata, filter]);

  const avgCrawl = useMemo(() => {
    if (!metadata.length) return 0;
    return metadata.reduce((sum, m) => sum + (m.crawl_itme ?? 0), 0) / metadata.length;
  }, [metadata]);

  return (
    <main className="submit-page">
      <section className="submit-hero fade-rise">
        <p className="section-label">02 — Submit</p>
        <h1 className="hero-title">
          Submit a <span className="muted">URL.</span>
        </h1>
        <p className="lede">
          Seed the crawler with a page. Links it finds are queued too, one request per host every
          two seconds.
        </p>

        <form className="submit-form" onSubmit={submit}>
          <input
            type="text"
            inputMode="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            aria-label="URL to crawl"
            spellCheck={false}
            autoFocus
          />
          <button className="btn-primary" type="submit" disabled={busy || !url.trim()}>
            {busy ? "Submitting…" : "Submit"}
          </button>
        </form>

        {notice && (
          <div className={`notice ${notice.kind}`} role="status">
            {notice.text}
          </div>
        )}

        {submitted && (
          <div className="tracked card">
            <div className="card-header">
              <span>Your URL</span>
              <StatusChip status={tracked?.status ?? "queued"} />
            </div>
            <div className="tracked-body">
              <a href={submitted} target="_blank" rel="noreferrer" className="mono url">
                {tracked?.url ?? submitted}
              </a>
              {tracked?.title && <p className="tracked-title">{tracked.title}</p>}
              {tracked?.snippet && <p className="secondary small">{tracked.snippet}</p>}
              {tracked && (
                <p className="mono muted small">
                  host {tracked.host} · crawl {tracked.crawl_itme} ms · id {tracked.id.slice(0, 8)}
                </p>
              )}
            </div>
          </div>
        )}
      </section>

      <section className="metadata fade-rise">
        <div className="metadata-head">
          <p className="section-label">03 — Metadata</p>
          <span className="mono muted small">
            {offline ? (
              <span className="error-text">backend unreachable</span>
            ) : (
              <>
                <span className="live-dot" /> live · every {POLL_MS / 1000}s
              </>
            )}
          </span>
        </div>

        <div className="stats">
          <div className="stat">
            <span className="stat-label">Pages</span>
            <span className="stat-value">{counts.all.toLocaleString()}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Indexed</span>
            <span className="stat-value success-text">{counts.indexed.toLocaleString()}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Failed</span>
            <span className="stat-value error-text">{counts.failed.toLocaleString()}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Hosts</span>
            <span className="stat-value">{hosts.toLocaleString()}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Avg crawl</span>
            <span className="stat-value">
              {avgCrawl.toFixed(0)}
              <span className="muted small"> ms</span>
            </span>
          </div>
        </div>

        <div className="filters" role="tablist">
          {(["all", "indexed", "crawled", "failed"] as const).map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              className="filter"
              onClick={() => {
                setFilter(f);
                setLimit(PAGE_SIZE);
              }}
            >
              {f} <span className="muted">{counts[f]}</span>
            </button>
          ))}
        </div>

        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Page</th>
                <th className="hide-sm">Host</th>
                <th className="num">Crawl</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-row">
                    {offline ? "Start the backend on :4000 to see metadata." : "Nothing crawled yet."}
                  </td>
                </tr>
              ) : (
                rows.slice(0, limit).map((m) => (
                  <tr
                    key={m.id}
                    className={submitted && loose(m.url) === loose(submitted) ? "row-highlight" : ""}
                  >
                    <td>
                      <StatusChip status={m.status} />
                    </td>
                    <td>
                      <div className="cell-page">
                        {m.title && <span className="cell-title">{m.title}</span>}
                        <a href={m.url} target="_blank" rel="noreferrer" className="mono url">
                          {m.url}
                        </a>
                      </div>
                    </td>
                    <td className="mono secondary hide-sm">{m.host}</td>
                    <td className="mono num">{m.crawl_itme} ms</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {rows.length > limit && (
          <button className="btn-secondary" onClick={() => setLimit((l) => l + PAGE_SIZE)}>
            Show more ({(rows.length - limit).toLocaleString()} remaining)
          </button>
        )}
      </section>
    </main>
  );
}
