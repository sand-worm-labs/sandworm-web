import type {
  KpiComparison,
  KpiDirection,
  KpiFormat,
  KpiSource,
} from "@sandworm/types/terminal";

import type { Kpi } from "./kpi";

export type {
  ClientStatusId,
  InviteTimingId,
  PlanId,
  TeamClientDetail,
  TeamClientDraft,
  TeamClientSource,
  TeamClientSummary,
  TeamSourceRun,
} from "@sandworm/types/terminal";

// A key number as the team edits it: its definition, and how it reads now
export type TeamKpi = {
  id: string;
  subjectId: string | null;
  key: string;
  label: string;
  description: string;
  position: number;
  isVisible: boolean;
  format: KpiFormat;
  direction: KpiDirection;
  comparison: KpiComparison;
  source: KpiSource;
  display: Kpi;
  lastReadingAt: string | null;
};

export type StarterResearch = {
  id: string;
  title: string;
  fits: string;
  data: "public" | "shared";
};
