import type { Tone } from "@sandworm/ui/kit/tone";

import type { RouteId } from "@/config/routes";
import type { BriefingKind } from "@/features/briefing/types";
import type {
  Opportunity,
  OpportunityStatus,
} from "@/features/opportunities/types";
import type { MockClientId } from "@/_mockdata/clients";

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

export type OpportunityEntry = Omit<Opportunity, "status" | "when"> & {
  status: Exclude<OpportunityStatus, "Passed">;
};

export type OpportunitiesBlock = BlockBase & {
  _tag: "opportunities";
  subtitle: string;
  items: readonly OpportunityEntry[];
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
  | OpportunitiesBlock
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
  clientKind: MockClientId;
  typeName: string;
  subtitle: string;
  loadingNote: string;
  blocks: readonly OverviewBlock[];
  layout: readonly LayoutRow[];
  library: readonly LibraryEntry[];
  setup: SetupProgress;
};

export type Overview = { status: OverviewStatus; data: OverviewData };
