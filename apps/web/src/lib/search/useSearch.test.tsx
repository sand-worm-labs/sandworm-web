import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { SearchGroup, SearchResponse } from "./types";
import { searchClient, useSearch } from "./useSearch";

const hit = (id: string) => ({
  type: "protocol" as const,
  id,
  title: id,
  subtitle: null,
  url: `/p/${id}`,
  image: null,
});
const group = (ids: string[], total = ids.length): SearchGroup => ({
  type: "protocol",
  total,
  items: ids.map(hit),
});
const response = (groups: SearchGroup[]): SearchResponse => ({
  query: "",
  groups,
});

// Resolves a request by hand, so a test decides the order answers arrive in.
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(r => (resolve = r));
  return { promise, resolve };
}

describe("useSearch", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(searchClient, "peek").mockReturnValue(undefined);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("asks once for a word typed quickly, after a short pause", async () => {
    const search = vi
      .spyOn(searchClient, "search")
      .mockResolvedValue(response([group(["a"])]));
    const { rerender } = renderHook(
      ({ query }) => useSearch({ query, type: null, enabled: true }),
      { initialProps: { query: "u" } }
    );
    rerender({ query: "un" });
    rerender({ query: "uni" });
    expect(search).not.toHaveBeenCalled();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(150);
    });
    expect(search).toHaveBeenCalledTimes(1);
    expect(search.mock.calls[0]?.[0]).toEqual({ q: "uni" });
  });

  it("asks at once when nothing is typed", async () => {
    const search = vi
      .spyOn(searchClient, "search")
      .mockResolvedValue(response([]));
    renderHook(() => useSearch({ query: "", type: null, enabled: true }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(search).toHaveBeenCalledTimes(1);
  });

  it("keeps the last answer on screen while the next one loads", async () => {
    const second = deferred<SearchResponse>();
    vi.spyOn(searchClient, "search")
      .mockResolvedValueOnce(response([group(["first"])]))
      .mockReturnValueOnce(second.promise);
    const { result, rerender } = renderHook(
      ({ query }) => useSearch({ query, type: null, enabled: true }),
      { initialProps: { query: "" } }
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(result.current.groups[0]?.items[0]?.id).toBe("first");

    rerender({ query: "s" });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(150);
    });
    expect(result.current.loading).toBe(true);
    expect(result.current.groups[0]?.items[0]?.id).toBe("first");

    await act(async () => {
      second.resolve(response([group(["second"])]));
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.groups[0]?.items[0]?.id).toBe("second");
  });

  it("never lets an old answer replace a newer question", async () => {
    const slow = deferred<SearchResponse>();
    const search = vi.spyOn(searchClient, "search");
    search.mockImplementationOnce((_request, signal) => {
      signal?.addEventListener("abort", () =>
        slow.resolve(response([group(["old"])]))
      );
      return slow.promise;
    });
    search.mockResolvedValueOnce(response([group(["new"])]));

    const { result, rerender } = renderHook(
      ({ query }) => useSearch({ query, type: null, enabled: true }),
      { initialProps: { query: "a" } }
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(150);
    });
    rerender({ query: "ab" });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(150);
    });
    expect(result.current.groups[0]?.items[0]?.id).toBe("new");
  });

  it("shows one kind in full and adds the next page to it", async () => {
    const search = vi
      .spyOn(searchClient, "search")
      .mockResolvedValueOnce(response([group(["a", "b"], 3)]))
      .mockResolvedValueOnce(response([group(["c"], 3)]));
    const { result } = renderHook(() =>
      useSearch({ query: "", type: "protocol", enabled: true })
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(result.current.canLoadMore).toBe(true);
    expect(search.mock.calls[0]?.[0]).toEqual({
      q: "",
      type: "protocol",
      limit: 20,
      offset: 0,
    });

    act(() => result.current.loadMore());
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(search.mock.calls[1]?.[0]).toEqual({
      q: "",
      type: "protocol",
      limit: 20,
      offset: 2,
    });
    expect(result.current.groups[0]?.items.map(item => item.id)).toEqual([
      "a",
      "b",
      "c",
    ]);
    expect(result.current.canLoadMore).toBe(false);
  });

  it("starts a new question on its first page, never on the page the last one reached", async () => {
    const search = vi
      .spyOn(searchClient, "search")
      .mockResolvedValueOnce(response([group(["a", "b"], 5)]))
      .mockResolvedValueOnce(response([group(["c", "d"], 5)]))
      .mockResolvedValue(response([group(["x"], 1)]));
    const { result, rerender } = renderHook(
      ({ query }) => useSearch({ query, type: "protocol", enabled: true }),
      { initialProps: { query: "" } }
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    act(() => result.current.loadMore());
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(search.mock.calls[1]?.[0]).toMatchObject({ offset: 2 });

    rerender({ query: "aav" });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(150);
    });
    const asked = search.mock.calls.map(call => call[0]);
    expect(asked.at(-1)).toMatchObject({ q: "aav", offset: 0 });
    expect(
      asked.some(request => request.q === "aav" && (request.offset ?? 0) > 0)
    ).toBe(false);
    expect(result.current.groups[0]?.items.map(item => item.id)).toEqual(["x"]);
  });

  it("says so when the search fails, and does not ask while closed", async () => {
    const search = vi
      .spyOn(searchClient, "search")
      .mockRejectedValue(new Error("down"));
    const { result } = renderHook(() =>
      useSearch({ query: "x", type: null, enabled: true })
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(150);
    });
    expect(result.current.failed).toBe(true);

    search.mockClear();
    renderHook(() => useSearch({ query: "x", type: null, enabled: false }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    expect(search).not.toHaveBeenCalled();
  });
});
