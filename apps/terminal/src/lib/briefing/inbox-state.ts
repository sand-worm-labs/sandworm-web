import type { BriefingItem, BriefingKind } from "@/types";

export type BriefingFilter = "all" | BriefingKind;

export function filterItems(
  items: readonly BriefingItem[],
  filter: BriefingFilter
): readonly BriefingItem[] {
  return filter === "all" ? items : items.filter(item => item.kind === filter);
}

export function isUnread(
  item: BriefingItem,
  readIds: readonly string[]
): boolean {
  return item.isUnread && !readIds.includes(item.id);
}

export function countUnread(
  items: readonly BriefingItem[],
  readIds: readonly string[]
): number {
  return items.filter(item => isUnread(item, readIds)).length;
}

export function resolveSelected(
  visibleItems: readonly BriefingItem[],
  selectedId: string | undefined
): BriefingItem | undefined {
  return visibleItems.find(item => item.id === selectedId) ?? visibleItems[0];
}
