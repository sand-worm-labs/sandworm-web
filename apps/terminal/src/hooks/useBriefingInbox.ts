import { useCallback, useEffect, useMemo, useState } from "react";
import type { BriefingItemData } from "@sandworm/types/terminal";

import {
  useMarkTerminalBriefingReadMutation,
  useMarkTerminalBriefingSeenMutation,
} from "@/generated/graphql";
import { usePreview } from "@/providers/PreviewProvider";
import {
  countUnread,
  filterItems,
  resolveSelected,
  type BriefingFilter,
} from "@/lib/briefing/inbox-state";

// `initialId` is the item a link asked for, e.g. a row on the overview. It
// opens selected, and counts as read.
export function useBriefingInbox(
  items: readonly BriefingItemData[],
  initialId?: string
) {
  const { isForced } = usePreview();
  const [markRead] = useMarkTerminalBriefingReadMutation();
  const [markSeen] = useMarkTerminalBriefingSeenMutation();
  // A preview visitor has no session, so their reads stay in the page only
  const markBriefingRead = useCallback(
    (itemIds: string[]) => {
      if (!isForced && itemIds.length) markRead({ variables: { itemIds } });
    },
    [isForced, markRead]
  );
  const opened = items.find(item => item.id === initialId)?.id;
  const [filter, setFilter] = useState<BriefingFilter>("all");
  const [selectedId, setSelectedId] = useState(opened ?? items[0]?.id);
  const [readIds, setReadIds] = useState<readonly string[]>(
    opened ? [opened] : []
  );

  // Opening Briefing is a visit; an item opened from a link counts as read
  useEffect(() => {
    if (!isForced) markSeen();
    if (opened) markBriefingRead([opened]);
  }, [opened, isForced, markSeen, markBriefingRead]);

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
      if (items.find(item => item.id === id)?.isRead === false) {
        markBriefingRead([id]);
      }
    },
    [items, markBriefingRead]
  );
  const markAllRead = useCallback(() => {
    setReadIds(items.map(item => item.id));
    markBriefingRead(items.filter(item => !item.isRead).map(item => item.id));
  }, [items, markBriefingRead]);

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
