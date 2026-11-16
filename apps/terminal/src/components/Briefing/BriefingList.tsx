import { useState } from "react";
import { PiCaretDown, PiCaretRight } from "react-icons/pi";
import { Button } from "@sandworm/ui/kit/button";
import { Card } from "@sandworm/ui/kit/card";
import { SegmentedControl } from "@sandworm/ui/kit/segmented-control";
import {
  BriefingKindId,
  type BriefingItemData,
} from "@sandworm/types/terminal";

import { KIND_FILTER_LABEL } from "@/lib/briefing/display";
import type { BriefingFilter, BriefingGroup } from "@/lib/briefing/inbox-state";

import { BriefingRow } from "./BriefingRow";

// Past this many items the older days start folded, so the list opens on what is recent
const FOLD_AFTER = 12;
const FOLDED_GROUPS = ["Last week", "Earlier"];

const EMPTY_MESSAGE: Record<BriefingFilter, string> = {
  all: "Nothing in your briefing.",
  unread: "You're all caught up.",
  archived: "Nothing archived.",
  [BriefingKindId.ANALYSIS]: "No analysis here.",
  [BriefingKindId.SIGNAL]: "No signals here.",
  [BriefingKindId.METRIC]: "No metrics here.",
};

type BriefingListProps = {
  groups: readonly BriefingGroup[];
  filter: BriefingFilter;
  counts: Record<BriefingFilter, number>;
  unreadCount: number;
  selectedId: string | undefined;
  isUnread: (item: BriefingItemData) => boolean;
  onFilter: (filter: BriefingFilter) => void;
  onSelect: (id: string) => void;
  onToggleRead: (id: string) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  undo: { count: number; run: () => void } | null;
};

export function BriefingList({
  groups,
  filter,
  counts,
  unreadCount,
  selectedId,
  isUnread,
  onFilter,
  onSelect,
  onToggleRead,
  onArchive,
  onRestore,
  undo,
}: BriefingListProps) {
  const [unfolded, setUnfolded] = useState<readonly string[]>([]);
  const total = groups.reduce((sum, group) => sum + group.items.length, 0);

  // Only the filters that have something, so a phone is not offered empty ones
  const option = (id: BriefingFilter, label: string) => ({
    id,
    label,
    count: counts[id],
  });
  const options = [
    option("all", "All"),
    option("unread", "Unread"),
    ...Object.values(BriefingKindId)
      .filter(kind => counts[kind] > 0)
      .map(kind => option(kind, KIND_FILTER_LABEL[kind])),
    ...(counts.archived > 0 || filter === "archived"
      ? [option("archived", "Archived")]
      : []),
  ];

  return (
    <Card
      bleed
      aria-label="Briefing items"
      className="flex flex-col lg:max-h-[calc(100vh-3rem)]"
    >
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-border-secondary px-3 pb-3 pt-4">
        <SegmentedControl
          label="Filter briefing"
          options={options}
          value={filter}
          onChange={onFilter}
        />
        <span className="text-xs text-ink-400">
          {unreadCount === 0 ? "All read" : `${unreadCount} unread`}
        </span>
      </div>
      <div className="flex min-h-0 flex-col overflow-y-auto px-2 pb-2.5">
        {total === 0 && (
          <p className="px-3 py-10 text-center text-sm text-ink-400">
            {EMPTY_MESSAGE[filter]}
          </p>
        )}
        {groups.map(group => {
          const isFolded =
            total > FOLD_AFTER &&
            FOLDED_GROUPS.includes(group.key) &&
            !unfolded.includes(group.key);
          const canFold =
            total > FOLD_AFTER && FOLDED_GROUPS.includes(group.key);
          return (
            <div key={group.key} className="flex flex-col">
              {canFold ? (
                <button
                  type="button"
                  aria-expanded={!isFolded}
                  onClick={() =>
                    setUnfolded(current =>
                      isFolded
                        ? [...current, group.key]
                        : current.filter(key => key !== group.key)
                    )
                  }
                  className="sticky top-0 z-10 flex items-center gap-1.5 bg-block-surface px-3 pb-1 pt-3 text-left text-xs font-medium text-ink-400"
                >
                  {isFolded ? (
                    <PiCaretRight size={12} aria-hidden />
                  ) : (
                    <PiCaretDown size={12} aria-hidden />
                  )}
                  {group.label}
                  <span className="font-normal">{group.items.length}</span>
                </button>
              ) : (
                <div className="sticky top-0 z-10 flex items-center gap-1.5 bg-block-surface px-3 pb-1 pt-3 text-xs font-medium text-ink-400">
                  {group.isNew && (
                    <span
                      aria-hidden="true"
                      className="size-1.5 rounded-full bg-primary"
                    />
                  )}
                  {group.label}
                  <span className="font-normal">{group.items.length}</span>
                </div>
              )}
              {!isFolded &&
                group.items.map(item => (
                  <BriefingRow
                    key={item.id}
                    item={item}
                    isUnread={isUnread(item)}
                    isArchived={filter === "archived"}
                    isSelected={item.id === selectedId}
                    onSelect={() => onSelect(item.id)}
                    onToggleRead={() => onToggleRead(item.id)}
                    onArchive={() => onArchive(item.id)}
                    onRestore={() => onRestore(item.id)}
                  />
                ))}
            </div>
          );
        })}
      </div>
      {undo && (
        <div
          role="status"
          className="flex shrink-0 items-center justify-between gap-3 border-t border-border-secondary px-4 py-2.5 text-[13px] text-ink-500"
        >
          {undo.count === 1 ? "Archived" : `Archived ${undo.count} items`}
          <Button
            variant="link"
            className="text-[13px] font-medium"
            onClick={undo.run}
          >
            Undo
          </Button>
        </div>
      )}
    </Card>
  );
}
