"use client";

import { useState } from "react";
import { QueryTabs } from "./QueryTabs";
import { ViewControls } from "./ViewControls";
import { QueryCard } from "./QueryCard";
import { queries } from "./DummyData";
import { ThemeTogggle } from "../Theme/ThemeToggle";

export type ViewMode = "compact" | "detailed";
export type SortOption =
  | "trending"
  | "most-popular"
  | "recently-viewed"
  | "your-favourites";

export function QueriesList() {
  const [viewMode, setViewMode] = useState<ViewMode>("compact");
  const [sortBy, setSortBy] = useState<SortOption>("trending");

  return (
    <div className="flex flex-col gap-2">
      {/* <ThemeTogggle/> */}
      <div>
        <p className="text-sm text-muted-foreground mb-2">
          See what others are creating on sandworm
        </p>
        <div className="flex items-end justify-between">
          <QueryTabs />
          <ViewControls
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </div>
      </div>

      <div className="space-y-8 flex flex-col gap-2">
        {queries.map(query => (
          <QueryCard key={query.id} query={query} viewMode={viewMode} />
        ))}
      </div>
    </div>
  );
}
