"use client";

import { useState } from "react";
import { PiPlus } from "react-icons/pi";
import { BarLoader } from "@sandworm/ui/kit/bar-loader";
import { buttonClassName } from "@sandworm/ui/kit/button";
import { Card } from "@sandworm/ui/kit/card";
import { NativeSelect } from "@sandworm/ui/kit/form/native-select";
import { SearchField } from "@sandworm/ui/kit/form/search-field";
import { SegmentedControl } from "@sandworm/ui/kit/segmented-control";

import { AppLink } from "@/components/AppLink";
import { SectionHeader } from "@/components/Sections/SectionHeader";
import { useAnalysis } from "@/hooks/useAnalysis";
import type { AnalysisCatalog, SectionCounts } from "@/types";
import { AnalysisSort } from "@/lib/analysis/sorts";
import {
  describeCatalog,
  filterRows,
  resolveView,
  sortRows,
} from "@/lib/analysis/catalog-state";

import { AnalysisNoResults } from "./AnalysisNoResults";
import { AnalysisTable } from "./AnalysisTable";
import { HighlightCards } from "./HighlightCards";

const SORT_OPTIONS: readonly { id: AnalysisSort; label: string }[] = [
  { id: AnalysisSort.RECENT, label: "Most recent" },
  { id: AnalysisSort.RELEVANT, label: "Most relevant to you" },
  { id: AnalysisSort.ALPHABETICAL, label: "A to Z" },
];

type AnalysisScreenProps = {
  counts: SectionCounts;
  viewer: { clientName: string };
};

export function AnalysisScreen(props: AnalysisScreenProps) {
  const { data: catalog, error } = useAnalysis();
  if (error) {
    return (
      <p className="text-sm text-ink-400">
        Could not load the analysis. Please try again.
      </p>
    );
  }
  return catalog ? (
    <AnalysisCatalogView catalog={catalog} {...props} />
  ) : (
    <div className="flex min-h-[60vh] items-center justify-center">
      <BarLoader />
    </div>
  );
}

function AnalysisCatalogView({
  catalog,
  counts,
  viewer,
}: AnalysisScreenProps & { catalog: AnalysisCatalog }) {
  const [viewId, setViewId] = useState(catalog.views[0]?.id ?? "projects");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<AnalysisSort>(AnalysisSort.RECENT);

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
            route="newRequest"
            className={buttonClassName({ className: "gap-2" })}
          >
            <PiPlus size={14} />
            Submit a request
          </AppLink>
        }
      />
      {!isSearching && catalog.highlights.length > 0 && (
        <HighlightCards highlights={catalog.highlights} />
      )}
      <Card bleed aria-label="All analysis" className="flex flex-col">
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
          <div className="flex w-full flex-wrap items-center gap-2 md:w-auto">
            <SearchField
              label="Search analysis"
              placeholder="Search reports, projects or regions"
              value={query}
              onChange={event => setQuery(event.target.value)}
              className="w-full md:w-[280px]"
            />
            <NativeSelect
              label="Sort analysis"
              value={sort}
              options={SORT_OPTIONS}
              onChange={setSort}
              size="sm"
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
