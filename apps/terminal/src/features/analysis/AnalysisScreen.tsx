"use client";

import { useState } from "react";
import { PiPlus } from "react-icons/pi";

import { AppLink } from "@/components/AppLink";
import { buttonClassName } from "@/components/Button";
import { Card } from "@/components/Card";
import { NativeSelect } from "@/components/form/NativeSelect";
import { SearchField } from "@/components/form/SearchField";
import { SegmentedControl } from "@/components/SegmentedControl";
import { SectionHeader } from "@/features/sections/SectionHeader";
import type { SectionCounts } from "@/features/sections/types";

import {
  describeCatalog,
  filterRows,
  resolveView,
  sortRows,
} from "./catalog-state";
import { AnalysisNoResults } from "./components/AnalysisNoResults";
import { AnalysisTable } from "./components/AnalysisTable";
import { HighlightCards } from "./components/HighlightCards";
import type { AnalysisCatalog, AnalysisSort } from "./types";

const SORT_OPTIONS: readonly { id: AnalysisSort; label: string }[] = [
  { id: "recent", label: "Most recent" },
  { id: "relevant", label: "Most relevant to you" },
  { id: "alphabetical", label: "A to Z" },
];

type AnalysisScreenProps = {
  catalog: AnalysisCatalog;
  counts: SectionCounts;
  viewer: { clientName: string };
};

export function AnalysisScreen({
  catalog,
  counts,
  viewer,
}: AnalysisScreenProps) {
  const [viewId, setViewId] = useState(catalog.views[0]?.id ?? "projects");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<AnalysisSort>("recent");

  const view = resolveView(catalog.views, viewId);
  const isSearching = query.trim() !== "";
  const rows = view ? sortRows(filterRows(view.rows, query), sort) : [];

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        current="analysis"
        title="Analysis"
        subtitle={describeCatalog(catalog, viewer.clientName)}
        counts={counts}
        actions={
          <AppLink
            route="commission"
            className={buttonClassName({ className: "gap-2" })}
          >
            <PiPlus size={14} />
            Commission research
          </AppLink>
        }
      />
      {!isSearching && catalog.highlights.length > 0 && (
        <HighlightCards highlights={catalog.highlights} />
      )}
      <Card aria-label="All analysis" className="flex flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-secondary px-5 py-4">
          {catalog.views.length > 1 ? (
            <SegmentedControl
              label="Group analysis by"
              options={catalog.views}
              value={view?.id ?? viewId}
              onChange={setViewId}
            />
          ) : (
            <span />
          )}
          <div className="flex flex-wrap items-center gap-2">
            <SearchField
              label="Search analysis"
              placeholder="Search reports, projects or regions"
              value={query}
              onChange={event => setQuery(event.target.value)}
              className="w-[280px] max-w-full"
            />
            <NativeSelect
              label="Sort analysis"
              value={sort}
              options={SORT_OPTIONS}
              onChange={setSort}
            />
          </div>
        </div>
        {view && rows.length > 0 ? (
          <AnalysisTable view={view} rows={rows} />
        ) : (
          <AnalysisNoResults
            query={query}
            suggestion={catalog.suggestion}
            onClear={() => setQuery("")}
          />
        )}
      </Card>
    </div>
  );
}
