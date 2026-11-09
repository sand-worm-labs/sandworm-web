import { BriefingKindId, OrganisationTypeId } from "@sandworm/types/terminal";

import type { OverviewData } from "@/types";

import { briefingEntry, gapEntry, kpi, signalEntry } from "./builders";
import { buildSetupProgress } from "./setup-progress";
import { standardLayout } from "./standard-layout";

export const acceleratorOverview: OverviewData = {
  clientKind: OrganisationTypeId.ACCELERATOR,
  typeName: "Accelerator",
  subtitle:
    "41 companies from the S26 and F26 batches tracked onchain. Data to 2 Nov, 23:59 UTC.",
  loadingNote:
    "Reading onchain activity for 41 companies in your S26 and F26 batches.",
  setup: buildSetupProgress({
    clientName: "Y Combinator",
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
      }),
      kpi({
        label: "Combined users",
        value: "486,000",
        delta: "▲ 14%",
        tone: "positive",
      }),
      kpi({
        label: "Median weekly growth",
        value: "6%",
        delta: "▲ 1 pt",
        tone: "positive",
      }),
      kpi({
        label: "Breakouts",
        value: "4",
        delta: "growing 20%+ a week",
        tone: "neutral",
        comparison: "",
      }),
    ],
    briefing: [
      briefingEntry({
        group: "Today",
        kind: BriefingKindId.METRIC,
        title: "Ferrite passed 50,000 users",
        summary: "Fastest in the batch, 9 weeks after launch.",
        entity: "Ferrite",
        time: "06:02",
        isUnread: true,
        route: "briefing",
      }),
      briefingEntry({
        group: "Today",
        kind: BriefingKindId.SIGNAL,
        title: "Two companies serve the same Kenya corridor",
        summary: "Paylane and Kito could share liquidity.",
        entity: "Kenya",
        time: "06:00",
        isUnread: true,
        route: "signal",
      }),
      briefingEntry({
        group: "Yesterday",
        kind: BriefingKindId.ANALYSIS,
        title: "F26 onchain traction, week 8",
        summary: "New report. 9 companies are above 10% weekly growth.",
        entity: "F26",
        time: "Mon 14:10",
        isUnread: true,
        route: "report",
      }),
      briefingEntry({
        group: "Yesterday",
        kind: BriefingKindId.SIGNAL,
        title: "Stablecoin payroll has no company in your batches",
        summary: "Users up 2.6× in six months.",
        entity: "Payroll",
        time: "Mon 11:32",
        isUnread: false,
        route: "signal",
      }),
      briefingEntry({
        group: "Last week",
        kind: BriefingKindId.ANALYSIS,
        title: "S26 against the last three batches",
        summary: "Median growth 6% a week, up from 4%.",
        entity: "S26",
        time: "Thu",
        isUnread: false,
        route: "report",
      }),
      briefingEntry({
        group: "Last week",
        kind: BriefingKindId.METRIC,
        title: "3 companies flat for 6 weeks",
        summary: "Driftwood, Lumo and Atlas Pay.",
        entity: "S26",
        time: "Wed",
        isUnread: false,
        route: "briefing",
      }),
    ],
    signals: [
      signalEntry({
        status: "New",
        title: "Introduce Paylane and Kito",
        observed: "Both route payouts through the same Kenya corridor.",
        kind: "Portfolio support",
        size: "2",
        sizeLabel: "companies",
        evidence: "Strong",
      }),
      signalEntry({
        status: "New",
        title: "Recruit a stablecoin payroll company",
        observed: "Users up 2.6× in six months; none in your batches.",
        kind: "Sourcing",
        size: "2.6×",
        sizeLabel: "user growth",
        evidence: "Some",
      }),
      signalEntry({
        status: "Looking into it",
        title: "Check in with three flat companies",
        observed: "No user growth for six weeks.",
        kind: "Portfolio support",
        size: "3",
        sizeLabel: "companies",
        evidence: "Strong",
      }),
    ],
    gaps: {
      subtitle: "Sectors with traction and no company in your batches.",
      items: [
        gapEntry({
          title: "Stablecoin payroll",
          detail: "Users up 2.6× in six months across 9 projects.",
          value: "2.6×",
          valueLabel: "users in 6 months",
          cta: "See signal",
          route: "signals",
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
