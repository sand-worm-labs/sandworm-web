import { PiMagnifyingGlass, PiTrophy } from "react-icons/pi";

import { EmptyResults } from "@/components/EmptyState/EmptyResults";

import { ALL_TYPES } from "./useBountyFilter";

interface BountiesEmptyProps {
  loading: boolean;
  failed: boolean;
  hasBounties: boolean;
  query: string;
  type: string;
  onClear: () => void;
}

const filteredTitle = (query: string, type: string) => {
  if (query.trim()) return `No bounties matching "${query.trim()}"`;
  return `No ${type.toLowerCase()} bounties found`;
};

export const BountiesEmpty = ({
  loading,
  failed,
  hasBounties,
  query,
  type,
  onClear,
}: BountiesEmptyProps) => {
  if (loading || failed) {
    return (
      <p className="pb-10 text-sm text-ink-400">
        {loading
          ? "Loading bounties..."
          : "Could not load the bounties. Please try again."}
      </p>
    );
  }

  if (!hasBounties) {
    return <EmptyResults icon={PiTrophy} title="There are no bounties yet" />;
  }

  return (
    <EmptyResults
      icon={PiMagnifyingGlass}
      title={filteredTitle(query, type)}
      hint="Try a different search, or clear your filters to see every bounty."
      action={
        (query || type !== ALL_TYPES) && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-primary hover:underline"
          >
            Clear filters
          </button>
        )
      }
    />
  );
};
