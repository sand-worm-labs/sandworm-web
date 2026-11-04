import { analystFixture } from "@/features/session/fixtures";

import type { OverviewData } from "../types";

import {
  briefingEntry,
  destination,
  gapEntry,
  kpi,
  opportunityEntry,
  segment,
} from "./builders";
import { buildSetupProgress } from "./setup-progress";
import { standardLayout } from "./standard-layout";

export const acceleratorOverview: OverviewData = {
  clientKind: "accelerator",
  typeName: "Accelerator",
  subtitle:
    "41 companies from the S26 and F26 batches tracked onchain. Data to 2 Nov, 23:59 UTC.",
  loadingNote:
    "Reading onchain activity for 41 companies in your S26 and F26 batches.",
  setup: buildSetupProgress({
    clientName: "Y Combinator",
    analystName: analystFixture.name,
  }),
  library: [
    {
      id: "leaderboard",
      name: "Company leaderboard",
      description: "Every company in the batch, ranked by weekly growth",
    },
    {
      id: "stalled",
      name: "Stalled companies",
      description: "Companies with no growth for 4 weeks or more",
    },
    {
      id: "overlap",
      name: "Overlap map",
      description: "Companies that share users, routes or partners",
    },
    {
      id: "demo-day",
      name: "Demo day watch",
      description: "Traction for companies presenting next",
    },
  ],
  ...standardLayout({
    kpis: [
      kpi({
        label: "Companies live onchain",
        value: "41",
        delta: "▲ 6",
        tone: "positive",
        series: [7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12],
      }),
      kpi({
        label: "Combined users",
        value: "486,000",
        delta: "▲ 14%",
        tone: "positive",
        series: [7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12],
      }),
      kpi({
        label: "Median weekly growth",
        value: "6%",
        delta: "▲ 1 pt",
        tone: "positive",
        series: [9, 9, 9, 10, 10, 10, 10, 11, 11, 11, 11],
      }),
      kpi({
        label: "Breakouts",
        value: "4",
        delta: "growing 20%+ a week",
        tone: "neutral",
        comparison: "",
        series: [8, 8, 9, 9, 9, 10, 10, 10, 11, 11, 11],
      }),
    ],
    briefing: [
      briefingEntry({
        group: "Today",
        kind: "Metric",
        title: "Ferrite passed 50,000 users",
        summary: "Fastest in the batch, 9 weeks after launch.",
        entity: "Ferrite",
        time: "06:02",
        isUnread: true,
        route: "briefing",
      }),
      briefingEntry({
        group: "Today",
        kind: "Opportunity",
        title: "Two companies serve the same Kenya corridor",
        summary: "Paylane and Kito could share liquidity.",
        entity: "Kenya",
        time: "06:00",
        isUnread: true,
        route: "opportunity",
      }),
      briefingEntry({
        group: "Yesterday",
        kind: "Analysis",
        title: "F26 onchain traction, week 8",
        summary: "New report. 9 companies are above 10% weekly growth.",
        entity: "F26",
        time: "Mon 14:10",
        isUnread: true,
        route: "report",
      }),
      briefingEntry({
        group: "Yesterday",
        kind: "Opportunity",
        title: "Stablecoin payroll has no company in your batches",
        summary: "Users up 2.6× in six months.",
        entity: "Payroll",
        time: "Mon 11:32",
        isUnread: false,
        route: "opportunity",
      }),
      briefingEntry({
        group: "Last week",
        kind: "Analysis",
        title: "S26 against the last three batches",
        summary: "Median growth 6% a week, up from 4%.",
        entity: "S26",
        time: "Thu",
        isUnread: false,
        route: "report",
      }),
      briefingEntry({
        group: "Last week",
        kind: "Metric",
        title: "3 companies flat for 6 weeks",
        summary: "Driftwood, Lumo and Atlas Pay.",
        entity: "S26",
        time: "Wed",
        isUnread: false,
        route: "briefing",
      }),
    ],
    opportunities: [
      opportunityEntry({
        status: "New",
        title: "Introduce Paylane and Kito",
        summary: "Both route payouts through the same Kenya corridor.",
        kind: "Portfolio support",
        value: "2",
        valueLabel: "companies",
        confidence: "High",
      }),
      opportunityEntry({
        status: "New",
        title: "Recruit a stablecoin payroll company",
        summary: "Users up 2.6× in six months; none in your batches.",
        kind: "Sourcing",
        value: "2.6×",
        valueLabel: "user growth",
        confidence: "Medium",
      }),
      opportunityEntry({
        status: "Reviewing",
        title: "Check in with three flat companies",
        summary: "No user growth for six weeks.",
        kind: "Portfolio support",
        value: "3",
        valueLabel: "companies",
        confidence: "High",
      }),
    ],
    concentration: {
      title: "Which companies drive the batch",
      summary: "3 of 41 companies have 64% of the batches' users.",
      segments: [
        segment("Top 3 companies", "3", 64),
        segment("Next 10 companies", "10", 27),
        segment("Other 28 companies", "28", 9),
      ],
    },
    destinations: {
      title: "Your batches against others",
      summary: "Median weekly user growth in the first 10 weeks after launch:",
      tone: "brand",
      rows: [
        destination("S26", 100, "6.0%"),
        destination("F26", 90, "5.4%"),
        destination("S25", 68, "4.1%"),
        destination("F25", 58, "3.5%"),
        destination("Other accelerators", 47, "2.8%"),
      ],
    },
    gaps: {
      subtitle: "Sectors with traction and no company in your batches.",
      items: [
        gapEntry({
          title: "Stablecoin payroll",
          detail: "Users up 2.6× in six months across 9 projects.",
          value: "2.6×",
          valueLabel: "users in 6 months",
          cta: "See opportunity",
          route: "opportunities",
        }),
        gapEntry({
          title: "Agent payments",
          detail: "Transactions up 3.1× since June.",
          value: "3.1×",
          valueLabel: "transactions",
          cta: "Read analysis",
          route: "report",
        }),
        gapEntry({
          title: "Onchain FX",
          detail: "Volume up 80% as more non-dollar stablecoins launch.",
          value: "1.8×",
          valueLabel: "volume",
          cta: "Read analysis",
          route: "report",
        }),
      ],
    },
  }),
};
