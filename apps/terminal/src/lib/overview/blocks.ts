import { exhaustiveCheck } from "@/lib/exhaustive";
import type {
  BlockTag,
  BriefingEntry,
  CellEntry,
  Kpi,
  OverviewBlock,
  OverviewData,
  SignalEntry,
} from "@/types";

export function findBlock<Tag extends BlockTag>(
  blocks: readonly OverviewBlock[],
  tag: Tag
): Extract<OverviewBlock, { _tag: Tag }> | undefined {
  return blocks.find(
    (block): block is Extract<OverviewBlock, { _tag: Tag }> =>
      block._tag === tag
  );
}

type LiveOverview = {
  subtitle: string;
  kpis: readonly Kpi[];
  briefing: { subtitle: string; entries: readonly BriefingEntry[] };
  signals: readonly SignalEntry[];
  cells: readonly CellEntry[];
};

// A live client's Overview: its own key numbers, briefing and signals, in the
// layout of its client type, then the notebook cells it follows. A block with
// nothing in the database is left out, and so is Gaps, which has no source yet.
// With no key numbers the preview ones stay, for the Overview that is still
// waiting for its first.
export function withLive(data: OverviewData, live: LiveOverview): OverviewData {
  const cells: OverviewBlock[] =
    live.cells.length > 0
      ? [
          {
            _tag: "cells",
            id: "cells",
            title: "Cells you follow",
            subtitle: "Charts from the notebooks behind your briefing",
            isOptional: true,
            items: live.cells,
          },
        ]
      : [];

  return {
    ...data,
    subtitle: live.subtitle,
    layout: [
      ...data.layout,
      { id: "cells", columns: [{ span: 12, blockIds: ["cells"] }] },
    ],
    blocks: [
      ...data.blocks.flatMap((block): OverviewBlock[] => {
        switch (block._tag) {
          case "kpis":
            return [
              live.kpis.length > 0 ? { ...block, items: live.kpis } : block,
            ];
          case "briefing":
            return live.briefing.entries.length > 0
              ? [{ ...block, ...live.briefing }]
              : [];
          case "signals":
            return live.signals.length > 0
              ? [{ ...block, items: live.signals }]
              : [];
          case "cells":
          case "gaps":
            return [];
          default:
            return exhaustiveCheck(block);
        }
      }),
      ...cells,
    ],
  };
}
