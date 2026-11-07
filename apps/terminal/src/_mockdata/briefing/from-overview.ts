import type { RouteId } from "@/config/routes";
import { findBlock, type OverviewData } from "@/lib/overview/types";
import type { BriefingFeed, BriefingItem } from "@/lib/briefing/types";

type Action = BriefingItem["action"];

const ACTION_BY_ROUTE: Partial<Record<RouteId, Action>> = {
  signal: { label: "Open signal", route: "signal" },
  report: { label: "Read report", route: "report" },
  briefing: { label: "See Overview", route: "overview" },
};

export function briefingFromOverview(data: OverviewData): BriefingFeed {
  const entries = findBlock(data.blocks, "briefing")?.entries ?? [];

  return {
    subtitle: "Since your last visit, Tue 28 Oct",
    upToDate: {
      subtitle: "Since your last visit, Sun 2 Nov",
      message:
        "Nothing new since your last visit on Sun 2 Nov at 18:40. New analysis, new signals and big moves in your numbers show up here.",
      archivedCount: entries.length,
    },
    items: entries.map(entry => ({
      id: entry.id,
      group: entry.group,
      kind: entry.kind,
      title: entry.title,
      summary: entry.summary,
      entity: entry.entity,
      time: entry.time,
      when: entry.time,
      isUnread: entry.isUnread,
      detail: {},
      action: ACTION_BY_ROUTE[entry.route] ?? {
        label: "Open",
        route: entry.route,
      },
    })),
  };
}
