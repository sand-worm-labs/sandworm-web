import { analystFixture } from "@/features/session/fixtures";

import type {
  ConcentrationBlock,
  DestinationsBlock,
  GapEntry,
  Kpi,
  BriefingEntry,
  LayoutRow,
  OverviewData,
  OpportunityEntry,
  OverviewBlock,
} from "../types";

type StandardContent = {
  kpis: readonly Kpi[];
  briefing: readonly BriefingEntry[];
  opportunities: readonly OpportunityEntry[];
  concentration: Pick<ConcentrationBlock, "title" | "summary" | "segments">;
  destinations: Pick<DestinationsBlock, "title" | "summary" | "tone" | "rows">;
  gaps: { subtitle: string; items: readonly GapEntry[] };
};

type Composition = Pick<OverviewData, "blocks" | "layout">;

const STANDARD_ROWS: readonly LayoutRow[] = [
  { id: "key-numbers", columns: [{ span: 12, blockIds: ["kpis"] }] },
  {
    id: "briefing",
    columns: [
      { span: 8, blockIds: ["briefing"] },
      { span: 4, blockIds: ["allowance", "analyst"] },
    ],
  },
  { id: "opportunities", columns: [{ span: 12, blockIds: ["opportunities"] }] },
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
      _tag: "allowance",
      id: "allowance",
      title: "This quarter",
      subtitle: "Your plan's allowance. Resets 1 Jan 2027.",
      isOptional: true,
      meters: [
        {
          id: "research",
          label: "Commissioned research",
          used: 2,
          total: 5,
          tone: "brand",
        },
        {
          id: "calls",
          label: "Analyst calls",
          used: 1,
          total: 4,
          tone: "navy",
        },
      ],
    },
    {
      _tag: "analyst",
      id: "analyst",
      title: "Your analyst",
      isOptional: false,
      analyst: analystFixture,
      message: "Questions about a report, or what to look at next.",
      footnote: "30 minutes, confidential, included in your plan",
    },
    {
      _tag: "opportunities",
      id: "opportunities",
      title: "Top opportunities",
      subtitle: "Ranked by estimated value",
      isOptional: true,
      items: content.opportunities,
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
