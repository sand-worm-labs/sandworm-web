import { describe, expect, it, vi } from "vitest";

import { SearchClient, SearchError } from "./searchClient";
import type { SearchResponse } from "./types";

const answer = (query: string): SearchResponse => ({
  query,
  groups: [
    {
      type: "protocol",
      total: 1,
      items: [
        {
          type: "protocol",
          id: "uniswap",
          title: "Uniswap",
          subtitle: null,
          url: "/showcase/dex/uniswap",
          image: null,
        },
      ],
    },
  ],
});

function makeClient(overrides: { status?: number; now?: () => number } = {}) {
  const fetchImpl = vi.fn(
    async (url: RequestInfo | URL, _init?: RequestInit) => {
      const q = new URL(String(url), "http://x").searchParams.get("q") ?? "";
      return {
        ok: (overrides.status ?? 200) < 400,
        status: overrides.status ?? 200,
        json: async () => answer(q),
      } as Response;
    }
  );
  const client = new SearchClient(
    () => "http://api/api",
    fetchImpl as unknown as typeof fetch,
    overrides.now
  );
  return { client, fetchImpl };
}

describe("SearchClient", () => {
  it("asks /search with the text and only the options that were given", async () => {
    const { client, fetchImpl } = makeClient();
    await client.search({
      q: "Uni  Swap",
      type: "protocol",
      limit: 20,
      offset: 40,
    });
    await client.search({ q: "" });
    expect(fetchImpl.mock.calls[0]?.[0]).toBe(
      "http://api/api/search?q=uni+swap&type=protocol&limit=20&offset=40"
    );
    expect(fetchImpl.mock.calls[1]?.[0]).toBe("http://api/api/search");
  });

  it("answers a repeated question from memory, whatever its case or spacing", async () => {
    const { client, fetchImpl } = makeClient();
    await client.search({ q: "Sol" });
    await client.search({ q: " sol " });
    await client.search({ q: "SOL" });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    await client.search({ q: "sol", type: "chain" });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("asks again once an answer is old", async () => {
    let now = 0;
    const { client, fetchImpl } = makeClient({ now: () => now });
    await client.search({ q: "sol" });
    now = 59_000;
    await client.search({ q: "sol" });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    now = 61_000;
    await client.search({ q: "sol" });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("lets the UI read a known answer without waiting", async () => {
    const { client } = makeClient();
    expect(client.peek({ q: "sol" })).toBeUndefined();
    await client.search({ q: "sol" });
    expect(client.peek({ q: "Sol" })?.query).toBe("sol");
  });

  it("does not remember a failure", async () => {
    const { client, fetchImpl } = makeClient({ status: 503 });
    await expect(client.search({ q: "sol" })).rejects.toBeInstanceOf(
      SearchError
    );
    await expect(client.search({ q: "sol" })).rejects.toMatchObject({
      status: 503,
    });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("passes the abort signal to the request", async () => {
    const { client, fetchImpl } = makeClient();
    const controller = new AbortController();
    await client.search({ q: "sol" }, controller.signal);
    const init = fetchImpl.mock.calls[0]?.[1] as RequestInit;
    expect(init.signal).toBe(controller.signal);
  });

  it("warms an answer without ever throwing", async () => {
    const { client, fetchImpl } = makeClient({ status: 500 });
    expect(() => client.prefetch({ q: "" })).not.toThrow();
    await Promise.resolve();
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});
