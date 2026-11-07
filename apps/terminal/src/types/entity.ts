import type { Tone } from "@sandworm/ui/kit/tone";

import type { RouteId } from "@/config/routes";
import type { ENTITY_KINDS } from "@/lib/analysis/entity/kinds";

import type { Confidence, SignalStatus } from "./signals";

export type EntityKind = (typeof ENTITY_KINDS)[number];

export type EntityKpi = {
  id: string;
  label: string;
  value: string;
  delta?: { text: string; tone: Tone };
  comparison?: string;
};

export type EntityInsight = {
  heading: string;
  text: string;
  action: { label: string; route: RouteId };
};

export type TableCell =
  | { _tag: "text"; text: string; isStrong?: boolean }
  | { _tag: "badge"; text: string; tone: Tone | "brand" }
  | { _tag: "entity"; name: string };

export type TableColumn = {
  id: string;
  label: string;
  align: "left" | "right";
};

export type TableRow = { id: string; cells: readonly TableCell[] };

export type ReportLink = {
  id: string;
  title: string;
  when: string;
  line?: string;
  isNew?: boolean;
};

export type SignalLink = {
  id: string;
  title: string;
  status: SignalStatus;
  confidence: Confidence;
  value: string;
};

type BlockBase = { id: string; title: string };

export type EntityBlock =
  | (BlockBase & {
      _tag: "dataTable";
      subtitle: string;
      columns: readonly TableColumn[];
      rows: readonly TableRow[];
    })
  | (BlockBase & { _tag: "reportList"; items: readonly ReportLink[] })
  | (BlockBase & {
      _tag: "signalList";
      items: readonly SignalLink[];
    });

export type RowSplit = "full" | "wide-narrow";

export type EntityRow = {
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
  kpis: readonly EntityKpi[];
  insight: EntityInsight;
  rows: readonly EntityRow[];
};
