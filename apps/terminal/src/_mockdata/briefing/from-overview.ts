import type { TerminalBriefing } from "@sandworm/types/terminal";

import { ago } from "@/_mockdata/ago";
import type { OverviewData } from "@/types";
import { findBlock } from "@/lib/overview/blocks";

import { briefingItem } from "./builders";

const DAYS_AGO: Record<string, number> = {
  Today: 0,
  Yesterday: 1,
  "Last week": 5,
};

export function briefingFromOverview(data: OverviewData): TerminalBriefing {
  const entries = findBlock(data.blocks, "briefing")?.entries ?? [];

  return {
    lastSeenAt: ago(1, "18:40"),
    archivedCount: entries.length,
    items: entries.map(entry =>
      briefingItem({
        kind: entry.kind,
        title: entry.title,
        summary: entry.summary,
        subject: entry.entity,
        publishedAt: ago(
          DAYS_AGO[entry.group] ?? 8,
          /\d\d:\d\d/.exec(entry.time)?.[0]
        ),
        isRead: !entry.isUnread,
        detail: {},
      })
    ),
  };
}
