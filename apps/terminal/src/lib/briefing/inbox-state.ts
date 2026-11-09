import {
  BriefingKindId,
  type BriefingItemData,
} from "@sandworm/types/terminal";

import { feedGroup, longDay } from "@/lib/dates";
import { groupInOrder } from "@/lib/group-in-order";

export type BriefingState = { isRead: boolean; isArchived: boolean };

// What the member has done on this page, on top of what the feed says
export type BriefingOverrides = Readonly<
  Record<string, Partial<BriefingState>>
>;

// Archived items are put away; everything else is one of these
export type BriefingFilter = "all" | "unread" | "archived" | BriefingKindId;

export const stateOf = (
  item: BriefingItemData,
  overrides: BriefingOverrides
): BriefingState => ({
  isRead: item.isRead,
  isArchived: item.isArchived,
  ...overrides[item.id],
});

export function filterItems(
  items: readonly BriefingItemData[],
  overrides: BriefingOverrides,
  filter: BriefingFilter
): BriefingItemData[] {
  return items.filter(item => {
    const { isRead, isArchived } = stateOf(item, overrides);
    if (filter === "archived") return isArchived;
    if (isArchived) return false;
    if (filter === "unread") return !isRead;
    return filter === "all" || item.kind === filter;
  });
}

export const countUnread = (
  items: readonly BriefingItemData[],
  overrides: BriefingOverrides
) => filterItems(items, overrides, "unread").length;

export function countByFilter(
  items: readonly BriefingItemData[],
  overrides: BriefingOverrides
): Record<BriefingFilter, number> {
  const filters: BriefingFilter[] = [
    "all",
    "unread",
    "archived",
    ...Object.values(BriefingKindId),
  ];
  return Object.fromEntries(
    filters.map(filter => [
      filter,
      filterItems(items, overrides, filter).length,
    ])
  ) as Record<BriefingFilter, number>;
}

// The item to show: the one asked for if it is in the list, else the first
export function resolveSelected(
  visibleItems: readonly BriefingItemData[],
  selectedId: string | undefined
): BriefingItemData | undefined {
  return visibleItems.find(item => item.id === selectedId) ?? visibleItems[0];
}

// The item to move to when `id` leaves the list: the one after it, or the one before
export function neighbourOf(
  visibleItems: readonly BriefingItemData[],
  id: string
): string | undefined {
  const index = visibleItems.findIndex(item => item.id === id);
  return (visibleItems[index + 1] ?? visibleItems[index - 1])?.id;
}

export type BriefingGroup = {
  key: string;
  label: string;
  isNew: boolean;
  items: BriefingItemData[];
};

// What arrived since the member's last visit comes first, then days: the way a
// notification list reads when it is opened. A first visit has no "new".
export function groupBriefing(
  items: readonly BriefingItemData[],
  lastSeenAt: string | null,
  now = new Date()
): BriefingGroup[] {
  const seen = lastSeenAt === null ? null : new Date(lastSeenAt);
  const isNew = (item: BriefingItemData) =>
    seen !== null && new Date(item.publishedAt) > seen;

  const fresh = items.filter(isNew);
  const days = groupInOrder(
    items.filter(item => !isNew(item)),
    item => feedGroup(item.publishedAt, now)
  ).map(group => ({ ...group, label: group.key, isNew: false }));

  return fresh.length > 0 && lastSeenAt !== null
    ? [
        {
          key: "new",
          label: `New since ${longDay(lastSeenAt)}`,
          isNew: true,
          items: fresh,
        },
        ...days,
      ]
    : days;
}
