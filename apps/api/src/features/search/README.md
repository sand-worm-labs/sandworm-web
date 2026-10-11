# Search

One public search across what anyone can open: protocols, chains, Showcase categories,
published notebooks, notebook dashboards, creators with a public page, and bounties.
`GET /api/search?q=&type=&limit=&offset=`. Nothing private is indexed, so every answer is
the same for everyone and can be cached.

## How it works

```
real tables ──▶ sources/*.source.ts ──▶ search_entry (one row per result) ──▶ SearchRepository ──▶ GET /api/search
   rebuilt by SearchIndexService              Postgres: prefix, full-text, trigram                    cached 30s in memory,
   (events + every 10 minutes)                                                                         60s at a CDN
```

- **`search_entry`** is a plain table the migration `add-search-index` creates. It holds only
  what the source tables hold, so it can be rebuilt at any time. Normalized text, a weighted
  `tsvector` and the trigram index are generated columns.
- **A source** (`sources/`) is one SELECT over the real tables that returns a fixed set of
  columns. It applies the same "is this public" rule as the page the result links to.
- **`SearchIndexService`** reads every source, stages the rows, and merges them in one
  transaction (insert new, update changed, delete gone), under an advisory lock so only one
  API instance rebuilds at a time. It runs at startup, 5 seconds after a
  `SEARCH_INDEX_STALE_EVENT`, and every 10 minutes as a safety net.
- **Ranking** (`search.repository.ts`): exact title, then title prefix, then a word in the
  title, then a word in the keywords or subtitle, then a near-spelling (only when nothing
  matched as typed). Kind, popularity and recency break ties. No text: the popular entries
  of each kind.

## Add a kind of result

1. Add it to `SEARCH_ENTRY_TYPES` (`search.types.ts`), and to `TYPE_BOOST` and `TYPE_ORDER`
   (`search.constants.ts`).
2. Write `sources/<kind>.source.ts` and add it to `sources/index.ts`.
3. Add its label and icon in `apps/web/src/components/SearchBar/searchData.ts`, and the type to
   `apps/web/src/lib/search/types.ts`.
4. Where its data changes, emit `SEARCH_INDEX_STALE_EVENT` (or rely on the 10-minute rebuild).

## Teach it a nickname

`SEARCH_ALIASES` in `search.constants.ts`: `uniswap: 'uni'`. Keys are normalized names.

## Things to know

- **Protocols are derived**, not stored: one per distinct name (by URL slug) with a published
  case study in an official workspace (`SHOWCASE_OFFICIAL_WORKSPACE_IDS`).
- **Dashboards** come from `yjs_app_document.has_dashboard`, set when a notebook is published.
  `DashboardFlagService` fills it in once for notebooks published before that.
- **Not audited** (`@NoAudit()`): the audit log records every REST call, and this is public
  and called on every keystroke.
- **Tests**: unit tests run everywhere. `search.integration.spec.ts` runs the real SQL against
  a database that has the migration (see the header of that file); it rolls back.

## When to outgrow it

The provider boundary is `SearchRepository`. If search needs more than Postgres gives (about a
hundred thousand entries, relevance that tuning cannot fix, or search using a noticeable share
of database CPU), feed a dedicated engine such as Meilisearch (MIT) from the same sources and
swap the repository. The sources, the events, the API and the web client stay.
