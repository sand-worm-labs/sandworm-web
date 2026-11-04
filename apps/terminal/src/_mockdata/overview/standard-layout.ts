import type {
  ConcentrationBlock,
  DestinationsBlock,
  GapEntry,
  Kpi,
  BriefingEntry,
  LayoutRow,
  OverviewData,
  SignalEntry,
  OverviewBlock,
} from "@/features/overview/types";

type StandardContent = {
  kpis: readonly Kpi[];
  briefing: readonly BriefingEntry[];
  signals: readonly SignalEntry[];
  concentration: Pick<ConcentrationBlock, "title" | "summary" | "segments">;
  destinations: Pick<DestinationsBlock, "title" | "summary" | "tone" | "rows">;
  gaps: { subtitle: string; items: readonly GapEntry[] };
};

type Composition = Pick<OverviewData, "blocks" | "layout">;

const STANDARD_ROWS: readonly LayoutRow[] = [
  { id: "key-numbers", columns: [{ span: 12, blockIds: ["kpis"] }] },
  {
    id: "briefing",
    columns: [{ span: 12, blockIds: ["briefing"] }],
  },
  { id: "signals", columns: [{ span: 12, blockIds: ["signals"] }] },
  {
    id: "signals",
    columns: [
      { span: 6, blockIds: ["concentration"] },
      { span: 6, blockIds: ["destinations"] },
    ],
  },
  { id: "gaps", columns: [{ span: 12, blockIds: ["gaps"] }] },
];

export function standardLayout(content: StandardContent): Composition {
  const blocks: OverviewBlock[] = [
    {
      _tag: "kpis",
      id: "kpis",
      title: "Key numbers",
      isOptional: true,
      items: content.kpis,
    },
    {
      _tag: "briefing",
      id: "briefing",
      title: "Briefing",
      subtitle: "Since your last visit, Tue 28 Oct",
      isOptional: true,
      entries: content.briefing,
    },
    {
      _tag: "signals",
      id: "signals",
      title: "Top signals",
      subtitle: "Ranked by estimated value",
      isOptional: true,
      items: content.signals,
    },
    {
      _tag: "concentration",
      id: "concentration",
      isOptional: true,
      ...content.concentration,
    },
    {
      _tag: "destinations",
      id: "destinations",
      isOptional: true,
      ...content.destinations,
    },
    {
      _tag: "gaps",
      id: "gaps",
      title: "Gaps",
      subtitle: content.gaps.subtitle,
      isOptional: true,
      items: content.gaps.items,
    },
  ];

  return { blocks, layout: STANDARD_ROWS };
}
