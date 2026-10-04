"use client";

import { useState } from "react";

import { useGetBountiesQuery } from "@/generated/graphql";
import {
  segmentedTabClass,
  segmentedTabsClass,
} from "@/components/SegmentedTabs";

import type { BountyRef } from "./bounties";
import { BountyCard } from "./BountyCard";

interface BountiesBoardProps {
  renderActions: (bounty: BountyRef) => React.ReactNode;
  detailHref: (slug: string) => string;
}

export const BountiesBoard = ({
  renderActions,
  detailHref,
}: BountiesBoardProps) => {
  const [type, setType] = useState("All");
  const { data, loading, error } = useGetBountiesQuery();
  const all = data?.getBounties ?? [];
  const types = Array.from(new Set(all.map(b => b.type)));
  const bounties = all.filter(b => type === "All" || b.type === type);

  return (
    <div className="container mx-auto font-body">
      <h1 className="text-xl font-bold text-ink-100 dark:text-white mt-4">
        Bounties
      </h1>
      <p className="text-ink-200 dark:text-placeholder-muted text-sm mt-1 mb-6">
        Answer a sponsor&apos;s question with a notebook and compete for the
        reward.
      </p>

      <div
        className={`${segmentedTabsClass} px-1.5 py-1.5 w-fit max-w-full overflow-x-auto mb-6`}
        role="group"
        aria-label="Filter by type"
      >
        {["All", ...types].map(option => (
          <button
            key={option}
            type="button"
            aria-pressed={type === option}
            onClick={() => setType(option)}
            className={segmentedTabClass(type === option)}
          >
            {option}
          </button>
        ))}
      </div>

      {all.length === 0 && (
        <p className="text-sm text-ink-400 pb-10">
          {loading && "Loading bounties..."}
          {error && "Could not load the bounties. Please try again."}
          {!loading && !error && "There are no bounties yet."}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 pb-10">
        {bounties.map(bounty => (
          <BountyCard
            key={bounty.slug}
            bounty={bounty}
            href={detailHref(bounty.slug)}
            actions={renderActions(bounty)}
          />
        ))}
      </div>
    </div>
  );
};
