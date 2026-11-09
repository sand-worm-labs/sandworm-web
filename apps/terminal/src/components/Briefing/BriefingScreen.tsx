"use client";

import { PiChecks } from "react-icons/pi";
import {
  BriefingKindId,
  type TerminalBriefing,
} from "@sandworm/types/terminal";
import { BarLoader } from "@sandworm/ui/kit/bar-loader";
import { Button } from "@sandworm/ui/kit/button";

import { SectionHeader } from "@/components/Sections/SectionHeader";
import { sinceLabel, upToDateMessage } from "@/lib/briefing/display";
import type { SectionCounts } from "@/types";
import { filterItems, type BriefingFilter } from "@/lib/briefing/inbox-state";
import { useBriefing } from "@/hooks/useBriefing";
import { useBriefingInbox } from "@/hooks/useBriefingInbox";

import { BriefingDetailPanel } from "./BriefingDetailPanel";
import { BriefingList } from "./BriefingList";
import { BriefingUpToDate } from "./BriefingUpToDate";

const FILTERS: readonly { id: BriefingFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: BriefingKindId.ANALYSIS, label: "Analysis" },
  { id: BriefingKindId.SIGNAL, label: "Signals" },
  { id: BriefingKindId.METRIC, label: "Metrics" },
];

type BriefingScreenProps = {
  counts: SectionCounts;
  viewer: { clientName: string };
  // The item to open on, from ?item=
  initialItemId?: string;
};

export function BriefingScreen(props: BriefingScreenProps) {
  const { data: feed, error } = useBriefing();
  if (error) {
    return (
      <p className="text-sm text-ink-400">
        Could not load the briefing. Please try again.
      </p>
    );
  }
  return feed ? (
    <BriefingInbox feed={feed} {...props} />
  ) : (
    <div className="flex min-h-[60vh] items-center justify-center">
      <BarLoader />
    </div>
  );
}

function BriefingInbox({
  feed,
  counts,
  viewer,
  initialItemId,
}: BriefingScreenProps & { feed: TerminalBriefing }) {
  const inbox = useBriefingInbox(feed.items, initialItemId);
  const hasItems = feed.items.length > 0;
  const since = sinceLabel(feed.lastSeenAt);

  const filterOptions = FILTERS.map(option => ({
    ...option,
    count: filterItems(feed.items, option.id).length,
  }));

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        current="briefing"
        title="Briefing"
        subtitle={since}
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
          message={upToDateMessage(feed.lastSeenAt)}
          archivedCount={feed.archivedCount}
        />
      )}
    </div>
  );
}
