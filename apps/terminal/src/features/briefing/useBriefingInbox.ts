import { useCallback, useEffect, useMemo, useState } from "react";

import { markBriefingRead, markBriefingSeen } from "./actions";
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

  // Opening Briefing is a visit; an item opened from a link counts as read
  useEffect(() => {
    markBriefingSeen();
    if (opened) markBriefingRead([opened]);
  }, [opened]);

  const visibleItems = useMemo(
    () => filterItems(items, filter),
    [items, filter]
  );
  const select = useCallback(
    (id: string) => {
      setSelectedId(id);
      setReadIds(current =>
        current.includes(id) ? current : [...current, id]
      );
      if (items.find(item => item.id === id)?.isUnread) {
        markBriefingRead([id]);
      }
    },
    [items]
  );
  const markAllRead = useCallback(() => {
    setReadIds(items.map(item => item.id));
    markBriefingRead(items.filter(item => item.isUnread).map(item => item.id));
  }, [items]);

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
