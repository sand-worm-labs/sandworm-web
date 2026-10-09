"use client";

import { useState } from "react";

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
  const { data, loading, error } = useGetBountiesQuery();
  const all = data?.getBounties ?? [];
  const types = Array.from(new Set(all.map(b => b.type)));
  const bounties = all.filter(b => type === "All" || b.type === type);
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

      <div
        className="flex gap-1.5 max-w-full overflow-x-auto pb-1 mb-6"
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
