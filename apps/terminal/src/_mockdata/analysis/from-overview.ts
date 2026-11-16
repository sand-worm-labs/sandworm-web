import { BriefingKindId } from "@sandworm/types/terminal";

import type { AnalysisCatalog, OverviewData } from "@/types";
import { findBlock } from "@/lib/overview/blocks";
import { groupInOrder } from "@/lib/group-in-order";

import { analysisRow, highlight } from "./builders";

export function analysisFromOverview(data: OverviewData): AnalysisCatalog {
  const entries = findBlock(data.blocks, "briefing")?.entries ?? [];
  const reports = entries.filter(
    entry => entry.kind === BriefingKindId.ANALYSIS
  );

  return {
    highlights: reports
      .filter(entry => entry.isUnread)
      .map(entry =>
        highlight({
          tag: "New report",
          when: entry.time,
          title: entry.title,
          line: entry.summary,
          entity: entry.entity,
        })
      ),
    views: [
      {
        id: "projects",
        label: "Projects",
        columnName: "Project",
        rows: groupInOrder(reports, entry => entry.entity).map(
          ({ key, items }) =>
            analysisRow({
              name: key,
              kind: "Project",
              reportCount: items.length,
              latest: items[0]?.title ?? "",
              isNew: items.some(entry => entry.isUnread),
              impactSize: 0,
              updated: items[0]?.time ?? "",
            })
        ),
      },
    ],
  };
}
