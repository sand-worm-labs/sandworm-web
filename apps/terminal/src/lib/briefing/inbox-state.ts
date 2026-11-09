import type {
  BriefingItemData,
  BriefingKindId,
} from "@sandworm/types/terminal";

export type BriefingFilter = "all" | BriefingKindId;

export function filterItems(
  items: readonly BriefingItemData[],
  filter: BriefingFilter
): readonly BriefingItemData[] {
  return filter === "all" ? items : items.filter(item => item.kind === filter);
}

export function isUnread(
  item: BriefingItemData,
  readIds: readonly string[]
): boolean {
  return !item.isRead && !readIds.includes(item.id);
}

export function countUnread(
  items: readonly BriefingItemData[],
  readIds: readonly string[]
): number {
  return items.filter(item => isUnread(item, readIds)).length;
}

export function resolveSelected(
  visibleItems: readonly BriefingItemData[],
  selectedId: string | undefined
): BriefingItemData | undefined {
  return visibleItems.find(item => item.id === selectedId) ?? visibleItems[0];
}
