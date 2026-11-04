import type {
  BriefingItemData,
  BriefingKindId,
  TerminalBriefing,
} from "@sandworm/types/terminal";

import { feedGroup, fullWhen, listTime, longDay } from "@/lib/dates";
import { webAppUrl } from "@/lib/web-app";

import type {
  BriefingDetail,
  BriefingFeed,
  BriefingItem,
  BriefingKind,
} from "./types";

const KIND: Record<BriefingKindId, BriefingKind> = {
  analysis: "Analysis",
  signal: "Signal",
  metric: "Metric",
};

// An analysis item opens its report; signals and metrics open their section.
function actionOf(item: BriefingItemData): BriefingItem["action"] {
  const url = item.sourcePath ? webAppUrl(item.sourcePath) : undefined;
  if (item.kind === "analysis") {
    return { label: "Read report", route: "report", url };
  }
  if (item.kind === "signal") return { label: "Open signal", route: "signals" };
  return { label: "See Overview", route: "overview" };
}

function toItem(item: BriefingItemData): BriefingItem {
  return {
    id: item.id,
    group: feedGroup(item.publishedAt),
    kind: KIND[item.kind],
    title: item.title,
    summary: item.summary,
    entity: item.subject,
    time: listTime(item.publishedAt),
    when: fullWhen(item.publishedAt),
    isUnread: !item.isRead,
    detail: item.detail as BriefingDetail,
    action: actionOf(item),
  };
}

export function briefingFromApi(data: TerminalBriefing): BriefingFeed {
  const since = data.lastSeenAt
    ? `Since your last visit, ${longDay(data.lastSeenAt)}`
    : "Your first briefing";
  const lastVisit = data.lastSeenAt
    ? ` since your last visit on ${fullWhen(data.lastSeenAt)}`
    : "";

  return {
    subtitle: since,
    items: data.items.map(toItem),
    upToDate: {
      subtitle: since,
      message: `Nothing new${lastVisit}. New analysis, new signals and big moves in your numbers show up here.`,
      archivedCount: data.archivedCount,
    },
  };
}
