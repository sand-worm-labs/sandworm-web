"use client";

import { useState } from "react";

import { useGetBountiesQuery } from "@/generated/graphql";
import { cn } from "@/lib/utils";

import type { Bounty } from "./bounties";
import { BountyCard } from "./BountyCard";

const STEPS = [
  {
    title: "Start",
    description:
      "Pick a bounty. A notebook is created for it in your workspace.",
  },
  {
    title: "Build",
    description: "Query the data, chart it and write up what you found.",
  },
  {
    title: "Submit",
    description:
      "Publish the notebook as your entry. You can keep improving it.",
  },
  {
    title: "Win",
    description:
      "The sponsor picks the winners, and they are shown on the bounty.",
  },
];

interface BountiesBoardProps {
  renderActions: (bounty: Bounty) => React.ReactNode;
}

export const BountiesBoard = ({ renderActions }: BountiesBoardProps) => {
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

      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className="rounded-2xl bg-base-100 border border-border-secondary dark:border-border-tertiary p-4"
          >
            <p className="text-sm font-bold text-ink-100 dark:text-white">
              {index + 1}. {step.title}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-ink-400">
              {step.description}
            </p>
          </li>
        ))}
      </ol>

      <div
        className="flex flex-wrap gap-2 mb-4"
        role="group"
        aria-label="Filter by type"
      >
        {["All", ...types].map(option => (
          <button
            key={option}
            type="button"
            aria-pressed={type === option}
            onClick={() => setType(option)}
            className={cn(
              "text-xs font-medium px-3 py-1.5 rounded-[10px] border transition-colors",
              type === option
                ? "bg-hover-bg dark:bg-white/[0.08] border-hover-border dark:border-transparent text-ink-100 dark:text-white"
                : "border-transparent text-ink-400 hover:bg-hover-bg dark:hover:bg-sidebar-hover"
            )}
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 pb-10">
        {bounties.map(bounty => (
          <BountyCard
            key={bounty.slug}
            bounty={bounty}
            actions={renderActions(bounty)}
          />
        ))}
      </div>
    </div>
  );
};
