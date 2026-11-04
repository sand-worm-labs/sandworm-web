import type { Tone } from "@sandworm/ui/kit/tone";

import type { RouteId } from "@/config/routes";
import type { BriefingKind } from "@/features/briefing/types";
import type { Signal, SignalStatus } from "@/features/signals/types";
import type { OrganisationTypeId } from "@/features/setup/options/organisation-types";

export const OVERVIEW_STATUSES = ["ready", "settingUp", "calculating"] as const;

export type OverviewStatus = (typeof OVERVIEW_STATUSES)[number];

export function isOverviewStatus(value: string): value is OverviewStatus {
  return OVERVIEW_STATUSES.some(status => status === value);
}

export type ColumnSpan = 4 | 6 | 8 | 12;

export type LayoutColumn = {
  span: ColumnSpan;
  blockIds: readonly string[];
};

export type LayoutRow = { id: string; columns: readonly LayoutColumn[] };

type BlockBase = {
  id: string;
  title: string;
  isOptional: boolean;
};

export type Kpi = {
  id: string;
  label: string;
  value: string;
  delta: string;
  tone: Tone;
  comparison: string;
  series: readonly number[];
};

export type KpisBlock = BlockBase & {
  _tag: "kpis";
  items: readonly Kpi[];
};

export type BriefingEntry = {
  id: string;
  group: string;
  kind: BriefingKind;
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

export type ConcentrationSegment = {
  id: string;
  label: string;
  count: string;
  share: number;
};

export type ConcentrationBlock = BlockBase & {
  _tag: "concentration";
  summary: string;
  segments: readonly ConcentrationSegment[];
};

export type DestinationRow = {
  id: string;
  name: string;
  share: number;
  label: string;
};

export type DestinationsBlock = BlockBase & {
  _tag: "destinations";
  summary: string;
  tone: "navy" | "loss" | "brand";
  rows: readonly DestinationRow[];
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
  | ConcentrationBlock
  | DestinationsBlock
  | GapsBlock;

export type BlockTag = OverviewBlock["_tag"];

export type LibraryEntry = { id: string; name: string; description: string };

export function findBlock<Tag extends BlockTag>(
  blocks: readonly OverviewBlock[],
  tag: Tag
): Extract<OverviewBlock, { _tag: Tag }> | undefined {
  return blocks.find(
    (block): block is Extract<OverviewBlock, { _tag: Tag }> =>
      block._tag === tag
  );
}

export type SetupStep = {
  id: string;
  title: string;
  detail: string;
  isDone: boolean;
  action?: { label: string; route: RouteId };
};

export type SetupProgress = {
  message: string;
  steps: readonly SetupStep[];
};

export type OverviewData = {
  clientKind: OrganisationTypeId;
  typeName: string;
  subtitle: string;
  loadingNote: string;
  blocks: readonly OverviewBlock[];
  layout: readonly LayoutRow[];
  library: readonly LibraryEntry[];
  setup: SetupProgress;
};

export type Overview = { status: OverviewStatus; data: OverviewData };
