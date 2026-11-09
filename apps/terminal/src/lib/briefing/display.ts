import {
  BriefingKindId,
  type BriefingItemData,
} from "@sandworm/types/terminal";

import { fullWhen, longDay } from "@/lib/dates";
import { webAppUrl } from "@/lib/web-app";
import type { Action, BriefingDetail } from "@/types";

export const KIND_LABEL: Record<BriefingKindId, string> = {
  analysis: "Analysis",
  signal: "Signal",
  metric: "Metric",
};

export const detailOf = (item: BriefingItemData) =>
  item.detail as BriefingDetail;

// An analysis item opens its report; signals and metrics open their section.
export function actionOf(item: BriefingItemData): Action {
  if (item.kind === BriefingKindId.ANALYSIS) {
    return {
      label: "Read report",
      route: "report",
      url: item.sourcePath ? webAppUrl(item.sourcePath) : undefined,
    };
  }
  if (item.kind === BriefingKindId.SIGNAL) {
    return { label: "Open signal", route: "signals" };
  }
  return { label: "See Overview", route: "overview" };
}

export const sinceLabel = (lastSeenAt: string | null) =>
  lastSeenAt
    ? `Since your last visit, ${longDay(lastSeenAt)}`
    : "Your first briefing";

export const upToDateMessage = (lastSeenAt: string | null) =>
  `Nothing new${lastSeenAt ? ` since your last visit on ${fullWhen(lastSeenAt)}` : ""}. New analysis, new signals and big moves in your numbers show up here.`;
