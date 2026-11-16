import type { SubjectIcon } from "@sandworm/types/terminal";

type AnalysisViewId = "projects" | "regions" | "sectors";

export type AnalysisRow = {
  id: string;
  hasPage: boolean;
  name: string;
  icon: SubjectIcon | null;
  kind: string;
  reportCount: number;
  latest: string;
  isNew: boolean;
  impactSize: number;
  updated: string;
};

export type AnalysisView = {
  id: AnalysisViewId;
  label: string;
  columnName: string;
  rows: readonly AnalysisRow[];
};

export type AnalysisHighlight = {
  id: string;
  tag: "New report" | "Delivered";
  when: string;
  title: string;
  line: string;
  entity: string;
  icon: SubjectIcon | null;
  // The report in the web app; fixtures have none
  url?: string;
};

export type AnalysisCatalog = {
  highlights: readonly AnalysisHighlight[];
  views: readonly AnalysisView[];
  suggestion?: string;
};
