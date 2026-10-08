# Test site answer key

Pages live in `testsites/` and are read **directly from disk** (no server).
Machine-readable version: `answer-key.json`.

**Conventions**
- Page IDs are paths relative to `testsites/` (e.g. `blog/post-1.html`).
- `http://localhost/X` maps to `testsites/X`.
- Fragments (`#...`) are stripped; a page + fragment is the same page.
- Duplicate links to the same target count once.
- Non-localhost `http(s)` links are external and must be skipped.

**Totals:** 30 pages, 78 unique internal edges, 3 external links.
Crawling from `index.html` should reach **29** pages; unreachable: `orphan.html`.

## Traps

| Trap | Where |
|---|---|
| Loop A↔B | `about.html` ↔ `contact.html` (also `ranking.html` ↔ `pagerank.html`) |
| Duplicate link | `cache.html` links `cache-eviction.html` twice |
| Fragment link | `crawler.html` → `indexer.html#top` (it also links plain `indexer.html`, so it should dedupe) |
| Relative `../` link | `blog/post-1.html` → `../index.html`, `../search-engine.html`; `blog/post-2.html` → `../cache.html`, `../empty.html`; `docs/intro.html` → `../system-design.html`, `../database.html` |
| Absolute localhost link | `load-balancing.html` → `http://localhost/index.html`; `docs/intro.html` → `http://localhost/search-engine.html` |
| External link | `kafka.html`, `replication.html`, `redis.html` |
| Orphan | `orphan.html` (nothing links to it; it links out to `index.html`) |
| Empty body | `empty.html` (has a `<title>`, empty `<body>`, no links) |
| Uppercase / punctuation | `shouting.html` |

## Outgoing links (normalized)

| Page | Title | Links to (internal) | External | Linked from |
|---|---|---|---|---|
| `index.html` | Home - Learning Systems | about.html, system-design.html, search-engine.html, database.html, cache.html, blog/post-1.html, docs/intro.html | — | about.html, contact.html, load-balancing.html, blog/post-1.html, shouting.html, orphan.html |
| `about.html` | About This Site | index.html, contact.html | — | index.html, contact.html |
| `contact.html` | Contact | index.html, about.html | — | about.html |
| `system-design.html` | System Design Basics | scalability.html, load-balancing.html, microservices.html, cache.html | — | index.html, scalability.html, load-balancing.html, microservices.html, docs/intro.html |
| `scalability.html` | Scalability | system-design.html, sharding.html, load-balancing.html | — | system-design.html, load-balancing.html, sharding.html |
| `load-balancing.html` | Load Balancing | scalability.html, system-design.html, index.html | — | system-design.html, scalability.html |
| `microservices.html` | Microservices | system-design.html, message-queue.html | — | system-design.html, message-queue.html |
| `message-queue.html` | Message Queues | microservices.html, kafka.html | — | microservices.html, kafka.html |
| `kafka.html` | Apache Kafka | message-queue.html | https://kafka.apache.org/ | message-queue.html |
| `search-engine.html` | How a Search Engine Works | crawler.html, indexer.html, ranking.html, inverted-index.html | — | index.html, crawler.html, ranking.html, blog/post-1.html, docs/intro.html |
| `crawler.html` | Web Crawler | search-engine.html, indexer.html | — | search-engine.html, indexer.html |
| `indexer.html` | Indexer | crawler.html, inverted-index.html, tokenizer.html | — | search-engine.html, crawler.html, inverted-index.html, tokenizer.html |
| `inverted-index.html` | Inverted Index | indexer.html, tokenizer.html, ranking.html | — | search-engine.html, indexer.html, tokenizer.html, tf-idf.html |
| `tokenizer.html` | Tokenizer | indexer.html, inverted-index.html, shouting.html | — | indexer.html, inverted-index.html |
| `ranking.html` | Ranking Results | search-engine.html, pagerank.html, tf-idf.html | — | search-engine.html, inverted-index.html, pagerank.html, tf-idf.html |
| `pagerank.html` | PageRank | ranking.html | — | ranking.html |
| `tf-idf.html` | TF-IDF | ranking.html, inverted-index.html | — | ranking.html |
| `database.html` | Databases | nosql.html, sharding.html, replication.html, cache.html | — | index.html, nosql.html, sharding.html, replication.html, cache.html, docs/intro.html |
| `nosql.html` | NoSQL Databases | database.html, sharding.html, redis.html | — | database.html, redis.html |
| `sharding.html` | Sharding | database.html, replication.html, scalability.html | — | scalability.html, database.html, nosql.html, replication.html |
| `replication.html` | Replication | database.html, sharding.html | https://en.wikipedia.org/wiki/Replication_(computing) | database.html, sharding.html |
| `cache.html` | Caching | database.html, cache-eviction.html, redis.html | — | index.html, system-design.html, database.html, cache-eviction.html, redis.html, blog/post-2.html, shouting.html |
| `cache-eviction.html` | Cache Eviction | cache.html, redis.html | — | cache.html |
| `redis.html` | Redis | cache.html, nosql.html | https://redis.io/ | nosql.html, cache.html, cache-eviction.html |
| `blog/post-1.html` | Blog: Building a Tiny Search Engine | index.html, blog/post-2.html, search-engine.html | — | index.html, blog/post-2.html |
| `blog/post-2.html` | Blog: Caching Search Results | blog/post-1.html, cache.html, empty.html | — | blog/post-1.html |
| `docs/intro.html` | Docs: Introduction | system-design.html, database.html, search-engine.html | — | index.html |
| `empty.html` | Empty Page | — | — | blog/post-2.html |
| `shouting.html` | !!! SEARCH ENGINE ALERT !!! | index.html, cache.html | — | tokenizer.html |
| `orphan.html` | Orphan Page | index.html | — | **none (orphan)** |

## Raw hrefs exactly as written

- `index.html`: `about.html`, `system-design.html`, `search-engine.html`, `database.html`, `cache.html`, `blog/post-1.html`, `docs/intro.html`
- `about.html`: `index.html`, `contact.html`
- `contact.html`: `index.html`, `about.html`
- `system-design.html`: `scalability.html`, `load-balancing.html`, `microservices.html`, `cache.html`
- `scalability.html`: `system-design.html`, `sharding.html`, `load-balancing.html`
- `load-balancing.html`: `scalability.html`, `system-design.html`, `http://localhost/index.html`
- `microservices.html`: `system-design.html`, `message-queue.html`
- `message-queue.html`: `microservices.html`, `kafka.html`
- `kafka.html`: `message-queue.html`, `https://kafka.apache.org/`
- `search-engine.html`: `crawler.html`, `indexer.html`, `ranking.html`, `inverted-index.html`
- `crawler.html`: `search-engine.html`, `indexer.html`, `indexer.html#top`
- `indexer.html`: `crawler.html`, `inverted-index.html`, `tokenizer.html`
- `inverted-index.html`: `indexer.html`, `tokenizer.html`, `ranking.html`
- `tokenizer.html`: `indexer.html`, `inverted-index.html`, `shouting.html`
- `ranking.html`: `search-engine.html`, `pagerank.html`, `tf-idf.html`
- `pagerank.html`: `ranking.html`
- `tf-idf.html`: `ranking.html`, `inverted-index.html`
- `database.html`: `nosql.html`, `sharding.html`, `replication.html`, `cache.html`
- `nosql.html`: `database.html`, `sharding.html`, `redis.html`
- `sharding.html`: `database.html`, `replication.html`, `scalability.html`
- `replication.html`: `database.html`, `sharding.html`, `https://en.wikipedia.org/wiki/Replication_(computing)`
- `cache.html`: `database.html`, `cache-eviction.html`, `cache-eviction.html`, `redis.html`
- `cache-eviction.html`: `cache.html`, `redis.html`
- `redis.html`: `cache.html`, `nosql.html`, `https://redis.io/`
- `blog/post-1.html`: `../index.html`, `post-2.html`, `../search-engine.html`
- `blog/post-2.html`: `post-1.html`, `../cache.html`, `../empty.html`
- `docs/intro.html`: `../system-design.html`, `../database.html`, `http://localhost/search-engine.html`
- `empty.html`: _(none)_
- `shouting.html`: `index.html`, `cache.html`
- `orphan.html`: `index.html`
