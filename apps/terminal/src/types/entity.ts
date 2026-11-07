import type { Tone } from "@sandworm/ui/kit/tone";

import type { EntityKind } from "@/lib/analysis/entity/kinds";

import type { Action } from "./common";
import type { Kpi } from "./kpi";
import type { NotebookSource } from "./notebook";
import type { Signal } from "./signals";

export type { EntityKind };

export type EntityInsight = { heading: string; text: string; action: Action };

export type EntityTableCell =
  | { _tag: "text"; text: string; isStrong?: boolean }
  | { _tag: "badge"; text: string; tone: Tone | "brand" }
  | { _tag: "entity"; name: string };

export type EntityTableColumn = {
  id: string;
  label: string;
  align: "left" | "right";
};

export type EntityTableRow = {
  id: string;
  cells: readonly EntityTableCell[];
};

export type EntityReportLink = {
  id: string;
  title: string;
  when: string;
  line?: string;
  isNew?: boolean;
};

export type EntitySignalLink = Pick<
  Signal,
  "id" | "title" | "status" | "confidence" | "value"
>;

type BlockBase = { id: string; title: string };

export type DataTableBlock = BlockBase & {
  _tag: "dataTable";
  subtitle: string;
  columns: readonly EntityTableColumn[];
  rows: readonly EntityTableRow[];
};

export type ReportListBlock = BlockBase & {
  _tag: "reportList";
  items: readonly EntityReportLink[];
};

export type SignalListBlock = BlockBase & {
  _tag: "signalList";
  items: readonly EntitySignalLink[];
};

export type EntityBlock = DataTableBlock | ReportListBlock | SignalListBlock;

export type RowSplit = "full" | "wide-narrow";

type EntityRow = {
  id: string;
  split: RowSplit;
  blocks: readonly EntityBlock[];
};

export type EntityPage = {
  slug: string;
  kind: EntityKind;
  name: string;
  tags: readonly string[];
  summary: string;
  kpis: readonly Kpi[];
  insight: EntityInsight;
  rows: readonly EntityRow[];
  source?: NotebookSource;
};
