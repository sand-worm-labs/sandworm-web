import type {
  BriefingItemData,
  BriefingKindId,
} from "@sandworm/types/terminal";

import { fullWhen, longDay } from "@/lib/dates";
import type { BriefingDetail } from "@/types";

export const KIND_LABEL: Record<BriefingKindId, string> = {
  analysis: "Analysis",
  signal: "Signal",
  metric: "Metric",
};

// The filters by kind, in the words a reader looks for
export const KIND_FILTER_LABEL: Record<BriefingKindId, string> = {
  analysis: "Analysis",
  signal: "Signals",
  metric: "Metrics",
};

export const detailOf = (item: BriefingItemData) =>
  item.detail as BriefingDetail;

export const sinceLabel = (lastSeenAt: string | null) =>
  lastSeenAt
    ? `Since your last visit, ${longDay(lastSeenAt)}`
    : "Your first briefing";

export const upToDateMessage = (lastSeenAt: string | null) =>
  `Nothing new${lastSeenAt ? ` since your last visit on ${fullWhen(lastSeenAt)}` : ""}. New analysis, new signals and big moves in your numbers show up here.`;
