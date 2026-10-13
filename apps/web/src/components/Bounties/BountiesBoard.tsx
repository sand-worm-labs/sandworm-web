"use client";

import { useGetBountiesQuery } from "@/generated/graphql";
import { useLocalStorage } from "@/hooks";
import { BoardStat, SectionHero } from "@/components/Showcase/BoardKit";
import { ConnectWalletButton } from "@/web3/components/ConnectWalletButton";

import type { BountyRef } from "./bounties";
import { BountiesToolbar } from "./BountiesToolbar";
import { BountyList, type BountyView } from "./BountyList";
import { BountiesEmpty } from "./BountiesEmpty";
import { useBountyFilter } from "./useBountyFilter";

const VIEW_STORAGE_KEY = "sandworm:bounties:view";

interface BountiesBoardProps {
  renderActions: (bounty: BountyRef) => React.ReactNode;
  detailHref: (slug: string) => string;
  headerAction?: React.ReactNode;
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
  const { data, loading, error } = useGetBountiesQuery();
  const [view, setView] = useLocalStorage<BountyView>(VIEW_STORAGE_KEY, "grid");
  const all = data?.getBounties ?? [];
  const { types, type, setType, query, setQuery, filtered, clearFilters } =
    useBountyFilter(all);
  const open = all.filter(bounty => bounty.status === "open").length;

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

      <BountiesToolbar
        query={query}
        onQueryChange={setQuery}
        types={types}
        type={type}
        onTypeChange={setType}
        view={view}
        onViewChange={setView}
      />

      {filtered.length === 0 ? (
        <BountiesEmpty
          loading={loading}
          failed={!!error}
          hasBounties={all.length > 0}
          query={query}
          type={type}
          onClear={clearFilters}
        />
      ) : (
        <div className="pb-10">
          <BountyList
            bounties={filtered}
            view={view}
            detailHref={detailHref}
            renderActions={renderActions}
          />
        </div>
      )}
    </div>
  );
};
