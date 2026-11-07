import clsx from "clsx";
import { Card } from "@sandworm/ui/kit/card";
import { SegmentedControl } from "@sandworm/ui/kit/segmented-control";
import {
  ROW_HOVER_CLASSNAME,
  ROW_SELECTED_CLASSNAME,
} from "@sandworm/ui/kit/interactive";

import { groupInOrder } from "@/lib/group-in-order";
import { isUnread, type BriefingFilter } from "@/features/briefing/inbox-state";
import type { BriefingItem } from "@/features/briefing/types";

import { BriefingKindTag } from "./BriefingKindTag";

type FilterOption = { id: BriefingFilter; label: string; count: number };

type BriefingListProps = {
  items: readonly BriefingItem[];
  readIds: readonly string[];
  selectedId: string | undefined;
  onSelect: (id: string) => void;
  filter: BriefingFilter;
  filterOptions: readonly FilterOption[];
  onFilterChange: (filter: BriefingFilter) => void;
  unreadCount: number;
};

export function BriefingList({
  items,
  readIds,
  selectedId,
  onSelect,
  filter,
  filterOptions,
  onFilterChange,
  unreadCount,
}: BriefingListProps) {
  return (
    <Card
      aria-label="Briefing items"
      className="flex flex-col gap-2.5 px-2 pb-2.5 pt-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 px-3">
        <SegmentedControl
          label="Filter briefing"
          options={filterOptions}
          value={filter}
          onChange={onFilterChange}
        />
        <span className="text-xs text-ink-400">
          {unreadCount === 0 ? "All read" : `${unreadCount} unread`}
        </span>
      </div>
      <div className="flex flex-col">
        {groupInOrder(items, item => item.group).map(group => (
          <div key={group.key} className="flex flex-col">
            <div className="flex items-center gap-1.5 px-3 pb-1 pt-2.5 text-xs font-medium text-ink-400">
              {group.key}
              <span className="font-normal">{group.items.length}</span>
            </div>
            {group.items.map(item => {
              const unread = isUnread(item, readIds);
              const isSelected = item.id === selectedId;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onSelect(item.id)}
                  className={clsx(
                    ROW_HOVER_CLASSNAME,
                    "grid w-full grid-cols-[8px_minmax(0,1fr)_auto] items-start gap-x-3 px-3 py-3 text-left",
                    isSelected && ROW_SELECTED_CLASSNAME
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={clsx(
                      "mt-2 size-2 rounded-full",
                      unread ? "bg-primary" : "bg-transparent"
                    )}
                  />
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="flex flex-wrap items-center gap-1.5">
                      <BriefingKindTag kind={item.kind} />
                      <span className="text-xs text-ink-400">
                        {item.entity}
                      </span>
                    </span>
                    <span
                      className={clsx(
                        "text-sm text-ink-100",
                        unread ? "font-semibold" : "font-medium"
                      )}
                    >
                      {item.title}
                    </span>
                    <span className="text-[13px] text-ink-400">
                      {item.summary}
                    </span>
                  </span>
                  <span className="whitespace-nowrap text-xs text-ink-400">
                    {item.time}
                    {unread && <span className="sr-only">, unread</span>}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </Card>
  );
}
