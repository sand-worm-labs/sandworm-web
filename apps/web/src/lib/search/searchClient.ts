import type { SearchRequest, SearchResponse } from "./types";

export class SearchError extends Error {
  constructor(readonly status: number) {
    super(`Search failed with status ${status}`);
  }
}

// How long an answer is reused without asking again. The server keeps its own short
// cache, so this only has to cover the back-and-forth of typing and deleting.
const TTL_MS = 60_000;
const MAX_ENTRIES = 100;

// Lower case, single spaces: "Sol", "sol " and "SOL" are one question, so they share an answer.
const normalize = (q: string) => q.trim().replace(/\s+/g, " ").toLowerCase();

const keyOf = (request: SearchRequest) =>
  JSON.stringify([
    normalize(request.q),
    request.type ?? null,
    request.limit ?? null,
    request.offset ?? 0,
  ]);

// Asks the search endpoint and remembers recent answers. It has no state of its own about
// what is on screen: the hook that uses it decides that.
export class SearchClient {
  private readonly cache = new Map<
    string,
    { value: SearchResponse; expiresAt: number }
  >();

  constructor(
    private readonly baseUrl: () => string,
    private readonly fetchImpl: typeof fetch = (...args) => fetch(...args),
    private readonly now: () => number = Date.now
  ) {}

  // The answer from memory, if there is a fresh one. Lets the UI show it with no wait.
  peek(request: SearchRequest): SearchResponse | undefined {
    const key = keyOf(request);
    const hit = this.cache.get(key);
    if (!hit) return undefined;
    if (hit.expiresAt <= this.now()) {
      this.cache.delete(key);
      return undefined;
    }
    // Most recently used last, so the oldest is the first to go.
    this.cache.delete(key);
    this.cache.set(key, hit);
    return hit.value;
  }

  async search(
    request: SearchRequest,
    signal?: AbortSignal
  ): Promise<SearchResponse> {
    const cached = this.peek(request);
    if (cached) return cached;

    const params = new URLSearchParams();
    const q = normalize(request.q);
    if (q) params.set("q", q);
    if (request.type) params.set("type", request.type);
    if (request.limit) params.set("limit", String(request.limit));
    if (request.offset) params.set("offset", String(request.offset));

    const query = params.toString();
    const response = await this.fetchImpl(
      `${this.baseUrl()}/search${query ? `?${query}` : ""}`,
      { signal, headers: { Accept: "application/json" } }
    );
    if (!response.ok) throw new SearchError(response.status);

    const value = (await response.json()) as SearchResponse;
    this.cache.set(keyOf(request), {
      value,
      expiresAt: this.now() + TTL_MS,
    });
    if (this.cache.size > MAX_ENTRIES) {
      const oldest = this.cache.keys().next().value;
      if (oldest !== undefined) this.cache.delete(oldest);
    }
    return value;
  }

  // Warm the answer to what is shown before anything is typed. Failing is fine: the
  // palette asks again when it opens.
  prefetch(request: SearchRequest): void {
    void this.search(request).catch(() => {});
  }
}
