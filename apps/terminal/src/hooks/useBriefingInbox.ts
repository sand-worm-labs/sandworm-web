import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ApolloCache } from "@apollo/client";
import type { TerminalBriefing } from "@sandworm/types/terminal";

import {
  useArchiveTerminalBriefingMutation,
  useMarkTerminalBriefingReadMutation,
  useMarkTerminalBriefingSeenMutation,
  useMarkTerminalBriefingUnreadMutation,
} from "@/generated/graphql";
import { patchBriefingItems, stampBriefingSeen } from "@/lib/briefing/cache";
import {
  countByFilter,
  countUnread,
  filterItems,
  groupBriefing,
  neighbourOf,
  resolveSelected,
  stateOf,
  type BriefingFilter,
  type BriefingOverrides,
  type BriefingState,
} from "@/lib/briefing/inbox-state";
import { usePreview } from "@/providers/PreviewProvider";

// How long "Archived. Undo" stays
const UNDO_MS = 6000;

type Send = (options: {
  update: (cache: ApolloCache<unknown>) => void;
  onError: () => void;
}) => unknown;

// `initialId` is the item a link asked for, e.g. a row on the overview. It
// opens selected, and counts as read.
export function useBriefingInbox(feed: TerminalBriefing, initialId?: string) {
  const { isForced } = usePreview();
  const [markRead] = useMarkTerminalBriefingReadMutation();
  const [markUnread] = useMarkTerminalBriefingUnreadMutation();
  const [archive] = useArchiveTerminalBriefingMutation();
  const [markSeen] = useMarkTerminalBriefingSeenMutation();

  const { items } = feed;
  const opened = items.find(item => item.id === initialId)?.id;
  // The last visit as it was when this page opened; opening it is the next one
  const [lastSeenAt] = useState(feed.lastSeenAt);
  const [overrides, setOverrides] = useState<BriefingOverrides>(
    opened ? { [opened]: { isRead: true } } : {}
  );
  const [filter, setFilter] = useState<BriefingFilter>("all");
  const [selectedId, setSelectedId] = useState(opened);
  // On a phone the item opens on its own page
  const [isDetailOpen, setIsDetailOpen] = useState(opened !== undefined);
  const [undoIds, setUndoIds] = useState<string[]>([]);
  const hasPushedItem = useRef(false);

  // A preview visitor has no session, so what they do stays in the page
  const change = useCallback(
    (ids: string[], patch: Partial<BriefingState>, send: Send) => {
      if (ids.length === 0) return;
      setOverrides(current => ({
        ...current,
        ...Object.fromEntries(
          ids.map(id => [id, { ...current[id], ...patch }])
        ),
      }));
      if (isForced) return;
      send({
        update: cache => patchBriefingItems(cache, ids, patch),
        // The API did not take it: fall back to what it says
        onError: () =>
          setOverrides(current =>
            Object.fromEntries(
              Object.entries(current).filter(([id]) => !ids.includes(id))
            )
          ),
      });
    },
    [isForced]
  );

  const read = useCallback(
    (ids: string[]) =>
      change(ids, { isRead: true }, options =>
        markRead({ variables: { itemIds: ids }, ...options })
      ),
    [change, markRead]
  );
  const unread = useCallback(
    (ids: string[]) =>
      change(ids, { isRead: false, isArchived: false }, options =>
        markUnread({ variables: { itemIds: ids }, ...options })
      ),
    [change, markUnread]
  );
  const setArchived = useCallback(
    (ids: string[], isArchived: boolean) =>
      change(
        ids,
        isArchived ? { isRead: true, isArchived } : { isArchived },
        options =>
          archive({ variables: { itemIds: ids, isArchived }, ...options })
      ),
    [change, archive]
  );

  // Opening Briefing is a visit; an item opened from a link counts as read
  useEffect(() => {
    if (isForced) return;
    markSeen({ update: cache => stampBriefingSeen(cache, new Date()) });
  }, [isForced, markSeen]);
  useEffect(() => {
    if (opened) read([opened]);
    // Only the item a link opened on, once
  }, []);

  // The back button closes an item that opened on its own page
  useEffect(() => {
    const onPop = () =>
      setIsDetailOpen(new URLSearchParams(window.location.search).has("item"));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (undoIds.length === 0) return undefined;
    const timer = setTimeout(() => setUndoIds([]), UNDO_MS);
    return () => clearTimeout(timer);
  }, [undoIds]);

  const visible = useMemo(
    () => filterItems(items, overrides, filter),
    [items, overrides, filter]
  );
  const selected = resolveSelected(visible, selectedId);

  const openDetail = useCallback(
    (id: string) => {
      const url = `?item=${id}`;
      const isPhone = !window.matchMedia("(min-width: 1024px)").matches;
      if (isPhone && !isDetailOpen) {
        window.history.pushState(null, "", url);
        hasPushedItem.current = true;
      } else {
        window.history.replaceState(null, "", url);
      }
      setIsDetailOpen(true);
    },
    [isDetailOpen]
  );
  const closeDetail = useCallback(() => {
    if (hasPushedItem.current) {
      hasPushedItem.current = false;
      window.history.back();
    } else {
      window.history.replaceState(null, "", window.location.pathname);
      setIsDetailOpen(false);
    }
  }, []);

  const select = useCallback(
    (id: string) => {
      setSelectedId(id);
      openDetail(id);
      const item = items.find(candidate => candidate.id === id);
      if (item && !stateOf(item, overrides).isRead) read([id]);
    },
    [items, overrides, openDetail, read]
  );

  const toggleRead = useCallback(
    (id: string) => {
      const item = items.find(candidate => candidate.id === id);
      if (!item) return;
      if (stateOf(item, overrides).isRead) unread([id]);
      else read([id]);
    },
    [items, overrides, read, unread]
  );

  const archiveItem = useCallback(
    (id: string) => {
      if (selected?.id === id) setSelectedId(neighbourOf(visible, id));
      if (isDetailOpen) closeDetail();
      setArchived([id], true);
      setUndoIds([id]);
    },
    [selected, visible, isDetailOpen, closeDetail, setArchived]
  );
  const restoreItem = useCallback(
    (id: string) => {
      if (selected?.id === id) setSelectedId(neighbourOf(visible, id));
      setArchived([id], false);
    },
    [selected, visible, setArchived]
  );
  const undoArchive = useCallback(() => {
    setArchived(undoIds, false);
    setUndoIds([]);
  }, [undoIds, setArchived]);

  const markAllRead = useCallback(
    () => read(filterItems(items, overrides, "unread").map(item => item.id)),
    [items, overrides, read]
  );

  return {
    filter,
    setFilter,
    counts: countByFilter(items, overrides),
    unreadCount: countUnread(items, overrides),
    groups: useMemo(
      () => groupBriefing(visible, lastSeenAt),
      [visible, lastSeenAt]
    ),
    overrides,
    selected,
    isDetailOpen: isDetailOpen && selected !== undefined,
    lastSeenAt,
    select,
    closeDetail,
    toggleRead,
    archiveItem,
    restoreItem,
    markAllRead,
    undo:
      undoIds.length > 0 ? { count: undoIds.length, run: undoArchive } : null,
  };
}
