import { useCallback, useMemo, useState } from "react";

import {
  countUnread,
  filterItems,
  resolveSelected,
  type BriefingFilter,
} from "./inbox-state";
import type { BriefingItem } from "./types";

export function useBriefingInbox(items: readonly BriefingItem[]) {
  const [filter, setFilter] = useState<BriefingFilter>("all");
  const [selectedId, setSelectedId] = useState(items[0]?.id);
  const [readIds, setReadIds] = useState<readonly string[]>([]);

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
