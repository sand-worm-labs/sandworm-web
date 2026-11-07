import type { RouteId } from "@/config/routes";

export const ANALYSIS_SORTS = ["recent", "relevant", "alphabetical"] as const;

export type AnalysisSort = (typeof ANALYSIS_SORTS)[number];

export type AnalysisViewId = "projects" | "regions" | "sectors";

export type AnalysisRow = {
  id: string;
  slug: string;
  hasPage: boolean;
  name: string;
  kind: string;
  reportCount: number;
  latest: string;
  isNew: boolean;
  impact: string;
  impactSize: number;
  updated: string;
};

export type AnalysisView = {
  id: AnalysisViewId;
  label: string;
  columnName: string;
  impactColumnName: string;
  rowRoute: RouteId;
  rows: readonly AnalysisRow[];
};

export type AnalysisHighlight = {
  id: string;
  tag: "New report" | "Delivered";
  when: string;
  title: string;
  line: string;
  entity: string;
};

export type AnalysisCatalog = {
  highlights: readonly AnalysisHighlight[];
  views: readonly AnalysisView[];
  suggestion?: string;
};
