"use client";

import { PiChecks } from "react-icons/pi";
import { Button } from "@sandworm/ui/kit/button";

import { SectionHeader } from "@/components/Sections/SectionHeader";
import type { BriefingFeed, SectionCounts } from "@/types";
import { filterItems, type BriefingFilter } from "@/lib/briefing/inbox-state";
import { useBriefingInbox } from "@/hooks/useBriefingInbox";

import { BriefingDetailPanel } from "./BriefingDetailPanel";
import { BriefingList } from "./BriefingList";
import { BriefingUpToDate } from "./BriefingUpToDate";

const FILTERS: readonly { id: BriefingFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "Analysis", label: "Analysis" },
  { id: "Signal", label: "Signals" },
  { id: "Metric", label: "Metrics" },
];

type BriefingScreenProps = {
  feed: BriefingFeed;
  counts: SectionCounts;
  viewer: { clientName: string };
  // The item to open on, from ?item=
  initialItemId?: string;
};

export function BriefingScreen({
  feed,
  counts,
  viewer,
  initialItemId,
}: BriefingScreenProps) {
  const inbox = useBriefingInbox(feed.items, initialItemId);
  const hasItems = feed.items.length > 0;

  const filterOptions = FILTERS.map(option => ({
    ...option,
    count: filterItems(feed.items, option.id).length,
  }));

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        current="briefing"
        title="Briefing"
        subtitle={hasItems ? feed.subtitle : feed.upToDate.subtitle}
        counts={counts}
        actions={
          hasItems && (
            <Button
              variant="secondary"
              className="gap-2"
              disabled={inbox.unreadCount === 0}
              onClick={inbox.markAllRead}
            >
              <PiChecks size={16} className="text-ink-navy" />
              Mark all as read
            </Button>
          )
        }
      />
      {hasItems && inbox.selected ? (
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
          <BriefingList
            items={inbox.visibleItems}
            readIds={inbox.readIds}
            selectedId={inbox.selected.id}
            onSelect={inbox.select}
            filter={inbox.filter}
            filterOptions={filterOptions}
            onFilterChange={inbox.setFilter}
            unreadCount={inbox.unreadCount}
          />
          <BriefingDetailPanel
            item={inbox.selected}
            clientName={viewer.clientName}
          />
        </div>
      ) : (
        <BriefingUpToDate
          message={feed.upToDate.message}
          archivedCount={feed.upToDate.archivedCount}
        />
      )}
    </div>
  );
}
