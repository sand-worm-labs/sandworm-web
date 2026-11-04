import { useCallback, useMemo, useState } from "react";

import {
  countUnread,
  filterItems,
  resolveSelected,
  type BriefingFilter,
} from "./inbox-state";
import type { BriefingItem } from "./types";

// `initialId` is the item a link asked for, e.g. a row on the overview. It
// opens selected, and counts as read.
export function useBriefingInbox(
  items: readonly BriefingItem[],
  initialId?: string
) {
  const opened = items.find(item => item.id === initialId)?.id;
  const [filter, setFilter] = useState<BriefingFilter>("all");
  const [selectedId, setSelectedId] = useState(opened ?? items[0]?.id);
  const [readIds, setReadIds] = useState<readonly string[]>(
    opened ? [opened] : []
  );

  const visibleItems = useMemo(
    () => filterItems(items, filter),
    [items, filter]
  );
  const select = useCallback((id: string) => {
    setSelectedId(id);
    setReadIds(current => (current.includes(id) ? current : [...current, id]));
  }, []);
  const markAllRead = useCallback(
    () => setReadIds(items.map(item => item.id)),
    [items]
  );

  return {
    filter,
    setFilter,
    visibleItems,
    selected: resolveSelected(visibleItems, selectedId),
    select,
    readIds,
    markAllRead,
    unreadCount: countUnread(items, readIds),
  };
}
