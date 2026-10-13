import { SearchField } from "@/components/inputs/SearchField";
import {
  GRID_VIEW,
  LIST_VIEW,
  ViewToggle,
} from "@/components/inputs/ViewToggle";
import { toggleClass } from "@/components/Showcase/BoardKit";

import type { BountyView } from "./BountyList";

const VIEW_OPTIONS = [GRID_VIEW, LIST_VIEW];

interface BountiesToolbarProps {
  query: string;
  onQueryChange: (query: string) => void;
  types: string[];
  type: string;
  onTypeChange: (type: string) => void;
  view: BountyView;
  onViewChange: (view: BountyView) => void;
}

export const BountiesToolbar = ({
  query,
  onQueryChange,
  types,
  type,
  onTypeChange,
  view,
  onViewChange,
}: BountiesToolbarProps) => (
  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
    <div className="flex min-w-0 flex-wrap items-center gap-4">
      <SearchField
        placeholder="Search bounties..."
        value={query}
        onChange={onQueryChange}
      />
      <div
        className="flex max-w-full gap-1.5 overflow-x-auto"
        role="group"
        aria-label="Filter by type"
      >
        {types.map(option => (
          <button
            key={option}
            type="button"
            aria-pressed={type === option}
            onClick={() => onTypeChange(option)}
            className={toggleClass(type === option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>

    <ViewToggle value={view} onChange={onViewChange} options={VIEW_OPTIONS} />
  </div>
);
