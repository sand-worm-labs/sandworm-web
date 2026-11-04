"use client";

import { useState } from "react";

import { AppLink } from "@/components/AppLink";
import { buttonClassName } from "@/components/Button";
import { Card } from "@/components/Card";
import { SegmentedControl } from "@/components/SegmentedControl";
import type { BriefingKind } from "@/features/briefing/types";
import { groupInOrder } from "@/lib/group-in-order";

import { BlockHeader } from "../components/BlockHeader";
import type { BriefingBlock } from "../types";

import { BriefingRow } from "./BriefingRow";

type BriefingFilter = "all" | BriefingKind;

const FILTERS: readonly { id: BriefingFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "Analysis", label: "Analysis" },
  { id: "Opportunity", label: "Opportunities" },
  { id: "Metric", label: "Metrics" },
];

export function BriefingCard({ block }: { block: BriefingBlock }) {
  const [filter, setFilter] = useState<BriefingFilter>("all");
  const titleId = `${block.id}-title`;

  const options = FILTERS.map(option => ({
    ...option,
    count:
      option.id === "all"
        ? block.entries.length
        : block.entries.filter(entry => entry.kind === option.id).length,
  }));
  const visibleEntries =
    filter === "all"
      ? block.entries
      : block.entries.filter(entry => entry.kind === filter);

  return (
    <Card
      aria-labelledby={titleId}
      className="flex h-full flex-col gap-3.5 px-4 pb-3 pt-[22px]"
    >
      <div className="px-2">
        <BlockHeader
          id={titleId}
          title={block.title}
          subtitle={block.subtitle}
          action={
            <AppLink
              route="briefing"
              className={buttonClassName({
                variant: "link",
                className: "whitespace-nowrap font-medium",
              })}
            >
              View all
            </AppLink>
          }
        />
      </div>
      <div className="px-2">
        <SegmentedControl
          label="Filter briefing"
          options={options}
          value={filter}
          onChange={setFilter}
        />
      </div>
      <div className="flex flex-col">
        {groupInOrder(visibleEntries, entry => entry.group).map(group => (
          <div key={group.key} className="flex flex-col">
            <div className="flex items-center gap-1.5 px-2 pb-1 pt-2.5 text-xs font-medium text-ink-400">
              {group.key}
              <span className="font-normal">{group.items.length}</span>
            </div>
            {group.items.map(entry => (
              <BriefingRow key={entry.id} entry={entry} />
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}
