"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { NEXT_PUBLIC_API_URL } from "@/utils/env";

import { SearchClient } from "./searchClient";
import type { SearchEntryType, SearchGroup, SearchRequest } from "./types";

export const searchClient = new SearchClient(() => NEXT_PUBLIC_API_URL());

// Wait this long after the last keystroke before asking. Long enough that typing a word
// is one request, short enough to feel instant.
const DEBOUNCE_MS = 120;
// Results per page when one kind is shown in full.
export const PAGE_SIZE = 20;

type State = {
  groups: SearchGroup[];
  loading: boolean;
  failed: boolean;
};

// The results of a search, for a palette that opens on a text field.
//
// - Typing is debounced, and an answer that is no longer wanted is cancelled, so a fast
//   typist makes few requests and an old answer never lands on a newer question.
// - While the next answer loads, the last one stays on screen instead of flashing empty.
// - With a `type`, one kind is shown in full, and `loadMore` fetches the next page.
export function useSearch(options: {
  query: string;
  type: SearchEntryType | null;
  enabled: boolean;
}) {
  const { query, type, enabled } = options;
  const [state, setState] = useState<State>({
    groups: [],
    loading: false,
    failed: false,
  });
  // The page being shown belongs to the question it was asked for, so a different question
  // starts at the first page at once, with no render in between that mixes the two.
  const questionKey = JSON.stringify([query.trim().toLowerCase(), type]);
  const [paging, setPaging] = useState({ key: questionKey, offset: 0 });
  const offset = paging.key === questionKey ? paging.offset : 0;
  // Which question the groups on screen answer, so "more" is appended only to that one.
  const answered = useRef("");

  useEffect(() => {
    if (!enabled) return () => {};

    const request: SearchRequest = type
      ? { q: query, type, limit: PAGE_SIZE, offset }
      : { q: query };
    // Already known: show it at once, with no wait and no request.
    const known = searchClient.peek(request);
    if (known) {
      setState(previous => ({
        groups: mergeAnswer(
          previous.groups,
          known.groups,
          offset > 0 && answered.current === questionKey
        ),
        loading: false,
        failed: false,
      }));
      answered.current = questionKey;
      return () => {};
    }

    const controller = new AbortController();
    setState(previous => ({ ...previous, loading: true, failed: false }));
    const wait = query.trim() && offset === 0 ? DEBOUNCE_MS : 0;
    const timer = setTimeout(() => {
      searchClient
        .search(request, controller.signal)
        .then(answer => {
          setState(previous => ({
            groups: mergeAnswer(
              previous.groups,
              answer.groups,
              offset > 0 && answered.current === questionKey
            ),
            loading: false,
            failed: false,
          }));
          answered.current = questionKey;
        })
        .catch(error => {
          if (controller.signal.aborted || error?.name === "AbortError") return;
          setState(previous => ({ ...previous, loading: false, failed: true }));
        });
    }, wait);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [enabled, query, type, offset, questionKey]);

  const shown = type
    ? state.groups.filter(group => group.type === type)
    : state.groups;
  const group = type ? shown[0] : undefined;
  const canLoadMore =
    !!group && group.items.length < group.total && !state.loading;
  const loadMore = useCallback(() => {
    if (canLoadMore)
      setPaging({ key: questionKey, offset: group!.items.length });
  }, [canLoadMore, group, questionKey]);

  return {
    groups: shown,
    loading: state.loading,
    failed: state.failed,
    canLoadMore,
    loadMore,
  };
}

// A page after the first adds to the kind already shown; anything else replaces it.
function mergeAnswer(
  current: SearchGroup[],
  incoming: SearchGroup[],
  append: boolean
): SearchGroup[] {
  const first = incoming[0];
  const have = current[0];
  if (!append || !first || !have || have.type !== first.type) return incoming;
  const seen = new Set(have.items.map(item => item.id));
  return [
    {
      ...first,
      items: [...have.items, ...first.items.filter(item => !seen.has(item.id))],
    },
  ];
}
