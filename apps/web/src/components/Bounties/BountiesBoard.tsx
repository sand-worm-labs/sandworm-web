"use client";

import { useState } from "react";
import { PiMagnifyingGlass } from "react-icons/pi";

import { useGetBountiesQuery } from "@/generated/graphql";
import {
  BoardStat,
  SectionHero,
  toggleClass,
} from "@/components/Showcase/BoardKit";
import { ConnectWalletButton } from "@/web3/components/ConnectWalletButton";

import type { BountyRef } from "./bounties";
import { BountyCard } from "./BountyCard";

interface BountiesBoardProps {
  renderActions: (bounty: BountyRef) => React.ReactNode;
  detailHref: (slug: string) => string;
  headerAction?: React.ReactNode;
  // A smaller headline, for the board shown inside a workspace.
  compact?: boolean;
  children?: React.ReactNode;
}

export const BountiesBoard = ({
  renderActions,
  detailHref,
  headerAction,
  compact = false,
  children,
}: BountiesBoardProps) => {
  const [type, setType] = useState("All");
  const [query, setQuery] = useState("");
  const { data, loading, error } = useGetBountiesQuery();
  const all = data?.getBounties ?? [];
  const types = Array.from(new Set(all.map(b => b.type)));
  const needle = query.trim().toLowerCase();
  const bounties = all.filter(
    b =>
      (type === "All" || b.type === type) &&
      (!needle ||
        [b.title, b.sponsor, b.summary].some(text =>
          text?.toLowerCase().includes(needle)
        ))
  );
  const open = all.filter(b => b.status === "open").length;

  return (
    <div className="container mx-auto font-body">
      <SectionHero
        compact={compact}
        eyebrow="Bounties · paid questions"
        title="Get paid to answer what a protocol wants to know."
        description="A sponsor posts a question and a reward. Answer it with a notebook, and the best one takes the money."
        aside={
          <div className="flex flex-col items-start lg:items-end gap-4">
            <dl className="flex gap-x-6">
              <BoardStat label="Open" count={open} />
              <BoardStat label="Listed" count={all.length} delay={90} />
            </dl>
            <div className="flex items-center gap-3">
              <ConnectWalletButton />
              {headerAction}
            </div>
          </div>
        }
      />

      {children}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div
          className="flex gap-1.5 max-w-full overflow-x-auto pb-1 sm:pb-0"
          role="group"
          aria-label="Filter by type"
        >
          {["All", ...types].map(option => (
            <button
              key={option}
              type="button"
              aria-pressed={type === option}
              onClick={() => setType(option)}
              className={toggleClass(type === option)}
            >
              {option}
            </button>
          ))}
        </div>

        <label className="relative block w-full sm:w-64">
          <PiMagnifyingGlass
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-300 pointer-events-none"
          />
          <input
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search bounties"
            aria-label="Search bounties"
            className="font-body h-8 w-full rounded-[5px] border border-border-secondary dark:border-border-tertiary bg-base-100 pl-8 pr-2.5 text-xs text-ink-100 dark:text-white placeholder:text-ink-300 outline-none focus:border-primary"
          />
        </label>
      </div>

      {all.length === 0 && (
        <p className="text-sm text-ink-400 pb-10">
          {loading && "Loading bounties..."}
          {error && "Could not load the bounties. Please try again."}
          {!loading && !error && "There are no bounties yet."}
        </p>
      )}

      {all.length > 0 && bounties.length === 0 && (
        <p className="text-sm text-ink-400 pb-10">
          No bounties match your search.
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
