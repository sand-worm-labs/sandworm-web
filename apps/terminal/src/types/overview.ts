import type { Output } from "@sandworm/types";
import type {
  BriefingKindId,
  OrganisationTypeId,
} from "@sandworm/types/terminal";

import type { RouteId } from "@/config/routes";
import type { OverviewStatus } from "@/lib/overview/status";

import type { Action } from "./common";
import type { Kpi } from "./kpi";
import type { Signal, SignalStatus } from "./signals";

export type { OverviewStatus };

// The demo clients the preview can show: one of each client type, and named
// clients whose data comes from real research.
export type ClientKind = OrganisationTypeId | "paycrest";

export type ColumnSpan = 4 | 6 | 8 | 12;

type LayoutColumn = {
  span: ColumnSpan;
  blockIds: readonly string[];
};

export type LayoutRow = { id: string; columns: readonly LayoutColumn[] };

type BlockBase = {
  id: string;
  title: string;
  isOptional: boolean;
};

export type KpisBlock = BlockBase & {
  _tag: "kpis";
  items: readonly Kpi[];
};

// A briefing item as the overview lists it: no detail, and a plain route.
export type BriefingEntry = {
  id: string;
  group: string;
  kind: BriefingKindId;
  title: string;
  summary: string;
  entity: string;
  time: string;
  isUnread: boolean;
  route: RouteId;
};

export type BriefingBlock = BlockBase & {
  _tag: "briefing";
  subtitle: string;
  entries: readonly BriefingEntry[];
};

export type SignalEntry = Omit<Signal, "status" | "when"> & {
  status: Exclude<SignalStatus, "Not for us">;
};

export type SignalsBlock = BlockBase & {
  _tag: "signals";
  subtitle: string;
  items: readonly SignalEntry[];
};

// A notebook cell the client follows: a snapshot of what it drew
export type CellEntry = {
  id: string;
  title: string;
  outputs: readonly Output[];
};

export type CellsBlock = BlockBase & {
  _tag: "cells";
  subtitle: string;
  items: readonly CellEntry[];
};

export type GapEntry = {
  id: string;
  title: string;
  detail: string;
  value: string;
  valueLabel: string;
  cta: string;
  route: RouteId;
};

export type GapsBlock = BlockBase & {
  _tag: "gaps";
  subtitle: string;
  items: readonly GapEntry[];
};

export type OverviewBlock =
  | KpisBlock
  | BriefingBlock
  | SignalsBlock
  | CellsBlock
  | GapsBlock;

export type BlockTag = OverviewBlock["_tag"];

export type LibraryEntry = { id: string; name: string; description: string };

export type SetupStep = {
  id: string;
  title: string;
  detail: string;
  isDone: boolean;
  action?: Action;
};

export type SetupProgress = {
  message: string;
  steps: readonly SetupStep[];
};

export type OverviewData = {
  clientKind: ClientKind;
  typeName: string;
  subtitle: string;
  loadingNote: string;
  blocks: readonly OverviewBlock[];
  layout: readonly LayoutRow[];
  library: readonly LibraryEntry[];
  setup: SetupProgress;
};

export type Overview = { status: OverviewStatus; data: OverviewData };
