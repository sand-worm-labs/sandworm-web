"use client";

import { useState } from "react";
import { Card } from "@sandworm/ui/kit/card";
import { SegmentedControl } from "@sandworm/ui/kit/segmented-control";

import { site } from "@/config/site";
import { SectionHeader } from "@/components/Sections/SectionHeader";
import type { SectionCounts, SignalsFeed } from "@/types";
import { SignalsEmpty } from "@/components/Signals/SignalsEmpty";
import { SignalRow } from "@/components/Signals/SignalRow";
import { SignalStatusIcon } from "@/components/Signals/SignalStatusIcon";
import {
  filterSignals,
  groupByStatus,
  type SignalFilter,
} from "@/lib/signals/signal-state";

const FILTERS: readonly { id: SignalFilter; label: string }[] = [
  { id: "open", label: "All open" },
  { id: "New", label: "New" },
  { id: "Looking into it", label: "Looking into it" },
  { id: "Acting on it", label: "Acting on it" },
  { id: "Not for us", label: "Not for us" },
];

type SignalsScreenProps = {
  feed: SignalsFeed;
  counts: SectionCounts;
  viewer: { clientName: string };
};

export function SignalsScreen({ feed, counts, viewer }: SignalsScreenProps) {
  const [filter, setFilter] = useState<SignalFilter>("open");

  const filterOptions = FILTERS.map(option => ({
    ...option,
    count: filterSignals(feed.items, option.id).length,
  }));
  const groups = groupByStatus(filterSignals(feed.items, filter));

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        current="signals"
        title="Signals"
        subtitle={`What ${site.name} saw in ${viewer.clientName}'s data, and what it could mean.`}
        counts={counts}
      />
      {feed.items.length === 0 ? (
        <SignalsEmpty />
      ) : (
        <Card aria-label="Signals" className="flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-secondary px-5 py-4">
            <SegmentedControl
              label="Filter by status"
              options={filterOptions}
              value={filter}
              onChange={setFilter}
            />
            <span className="text-xs text-ink-400">
              Sizes are what we measured, not forecasts
            </span>
          </div>
          <div className="px-2 pb-2.5 pt-1">
            {groups.length === 0 && (
              <p className="px-3 py-10 text-center text-sm text-ink-400">
                Nothing here yet.
              </p>
            )}
            {groups.map(group => (
              <section
                key={group.status}
                aria-label={group.status}
                className="flex flex-col"
              >
                <h2 className="flex items-center gap-2 px-3 pb-1.5 pt-3.5 text-xs font-medium text-ink-500">
                  <SignalStatusIcon status={group.status} />
                  {group.status}
                  <span className="font-normal text-ink-400">
                    {group.items.length}
                  </span>
                </h2>
                {group.items.map((item, index) => (
                  <div
                    key={item.id}
                    className={
                      index > 0 ? "border-t border-border-secondary" : undefined
                    }
                  >
                    <SignalRow item={item} />
                  </div>
                ))}
              </section>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
