"use client";

import { useState } from "react";
import { Card } from "@sandworm/ui/kit/card";
import { SegmentedControl } from "@sandworm/ui/kit/segmented-control";

import { SectionHeader } from "@/features/sections/SectionHeader";
import type { SectionCounts } from "@/features/sections/types";

import { OpportunitiesEmpty } from "./components/OpportunitiesEmpty";
import { OpportunityRow } from "./components/OpportunityRow";
import { OpportunityStatusIcon } from "./components/OpportunityStatusIcon";
import {
  filterOpportunities,
  groupByStatus,
  type OpportunityFilter,
} from "./opportunity-state";
import type { OpportunitiesFeed } from "./types";

const FILTERS: readonly { id: OpportunityFilter; label: string }[] = [
  { id: "open", label: "All open" },
  { id: "New", label: "New" },
  { id: "Reviewing", label: "Reviewing" },
  { id: "Pursuing", label: "Pursuing" },
  { id: "Passed", label: "Passed" },
];

type OpportunitiesScreenProps = {
  feed: OpportunitiesFeed;
  counts: SectionCounts;
  viewer: { clientName: string; analystName: string };
};

export function OpportunitiesScreen({
  feed,
  counts,
  viewer,
}: OpportunitiesScreenProps) {
  const [filter, setFilter] = useState<OpportunityFilter>("open");

  const filterOptions = FILTERS.map(option => ({
    ...option,
    count: filterOpportunities(feed.items, option.id).length,
  }));
  const groups = groupByStatus(filterOpportunities(feed.items, filter));

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        current="opportunities"
        title="Opportunities"
        subtitle={`Moves for ${viewer.clientName}, ranked by estimated value.`}
        counts={counts}
      />
      {feed.items.length === 0 ? (
        <OpportunitiesEmpty analystName={viewer.analystName} />
      ) : (
        <Card aria-label="Opportunities" className="flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-secondary px-5 py-4">
            <SegmentedControl
              label="Filter by status"
              options={filterOptions}
              value={filter}
              onChange={setFilter}
            />
            <span className="text-xs text-ink-400">
              Values are Sandworm estimates
            </span>
          </div>
          <div className="px-3 pb-2.5 pt-1">
            {groups.length === 0 && (
              <p className="px-2 py-10 text-center text-sm text-ink-400">
                Nothing here yet.
              </p>
            )}
            {groups.map(group => (
              <section
                key={group.status}
                aria-label={group.status}
                className="flex flex-col"
              >
                <h2 className="flex items-center gap-2 px-2 pb-1.5 pt-3.5 text-xs font-medium text-ink-500">
                  <OpportunityStatusIcon status={group.status} />
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
                    <OpportunityRow item={item} />
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
