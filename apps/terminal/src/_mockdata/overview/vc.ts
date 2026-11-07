import type { OverviewData } from "@/lib/overview/types";

import { briefingEntry, gapEntry, kpi, signalEntry } from "./builders";
import { buildSetupProgress } from "./setup-progress";
import { standardLayout } from "./standard-layout";

export const vcOverview: OverviewData = {
  clientKind: "vc",
  typeName: "Investor",
  subtitle: "28 portfolio projects tracked onchain. Data to 2 Nov, 23:59 UTC.",
  loadingNote:
    "Reading activity for 28 portfolio projects and 140 of their competitors.",
  setup: buildSetupProgress({
    clientName: "Kestrel Ventures",
  }),
  library: [
    {
      id: "unlocks",
      name: "Token unlocks",
      description: "Upcoming unlocks across your holdings",
    },
    {
      id: "treasury",
      name: "Treasury balances",
      description: "Runway and treasury moves for each project",
    },
    {
      id: "holders",
      name: "Holder concentration",
      description: "How much of each token the top 10 holders own",
    },
    {
      id: "deal-flow",
      name: "Deal flow watchlist",
      description: "Fast-growing projects you do not hold",
    },
  ],
  ...standardLayout({
    kpis: [
      kpi({
        label: "Portfolio users",
        value: "2.1M",
        delta: "▲ 6%",
        tone: "positive",
      }),
      kpi({
        label: "Portfolio fees, 30 days",
        value: "$18.4M",
        delta: "▲ 12%",
        tone: "positive",
      }),
      kpi({
        label: "Projects growing",
        value: "17 of 28",
        delta: "▲ 2",
        tone: "positive",
      }),
      kpi({
        label: "Red flags",
        value: "3",
        delta: "▲ 2 new",
        tone: "negative",
      }),
    ],
    briefing: [
      briefingEntry({
        group: "Today",
        kind: "Metric",
        title: "Orbit Labs team wallet moved $4.2M",
        summary: "Sent to an exchange deposit address at 03:14.",
        entity: "Orbit Labs",
        time: "06:02",
        isUnread: true,
        route: "briefing",
      }),
      briefingEntry({
        group: "Today",
        kind: "Signal",
        title: "Stablecoin payments in Africa tripled",
        summary: "You hold no project in this sector.",
        entity: "Payments",
        time: "06:00",
        isUnread: true,
        route: "signal",
      }),
      briefingEntry({
        group: "Yesterday",
        kind: "Analysis",
        title: "Lumen DEX: users against rewards",
        summary: "New report. 68% of new users leave when rewards end.",
        entity: "Lumen DEX",
        time: "Mon 14:10",
        isUnread: true,
        route: "report",
      }),
      briefingEntry({
        group: "Yesterday",
        kind: "Signal",
        title: "Nimbus Pay is growing 40% a week",
        summary: "Not in your portfolio. 12,000 users and no token yet.",
        entity: "Nimbus Pay",
        time: "Mon 11:32",
        isUnread: false,
        route: "signal",
      }),
      briefingEntry({
        group: "Last week",
        kind: "Analysis",
        title: "Q3 portfolio review",
        summary: "17 projects grew, 11 shrank. Full table inside.",
        entity: "Portfolio",
        time: "Thu",
        isUnread: false,
        route: "report",
      }),
      briefingEntry({
        group: "Last week",
        kind: "Metric",
        title: "Token unlock: Lumen, 8% of supply on 14 Nov",
        summary: "Your position is 2.1% of supply.",
        entity: "Lumen DEX",
        time: "Wed",
        isUnread: false,
        route: "briefing",
      }),
    ],
    signals: [
      signalEntry({
        status: "New",
        title: "Look at Nimbus Pay before its round",
        summary: "Growing 40% a week with no token.",
        kind: "Sourcing",
        value: "12,000",
        valueLabel: "users, +40% a week",
        confidence: "Medium",
      }),
      signalEntry({
        status: "New",
        title: "Find a stablecoin payments company in Africa",
        summary: "Users tripled in six months; you hold nothing there.",
        kind: "Thesis gap",
        value: "3.0×",
        valueLabel: "user growth",
        confidence: "High",
      }),
      signalEntry({
        status: "Reviewing",
        title: "Ask Lumen DEX to rethink rewards",
        summary: "68% of new users leave when rewards end.",
        kind: "Portfolio support",
        value: "$1.1M/mo",
        valueLabel: "rewards spend",
        confidence: "High",
      }),
    ],
    gaps: {
      subtitle: "Sectors growing fast where you hold nothing.",
      items: [
        gapEntry({
          title: "Stablecoin payments in Africa",
          detail: "Users tripled in six months across 14 projects.",
          value: "3.0×",
          valueLabel: "users in 6 months",
          cta: "See signal",
          route: "signals",
        }),
        gapEntry({
          title: "Prediction markets",
          detail: "Fees more than doubled. You hold one small position.",
          value: "2.4×",
          valueLabel: "fees in 6 months",
          cta: "Read analysis",
          route: "report",
        }),
        gapEntry({
          title: "Onchain FX",
          detail: "Volume up 80% as more non-dollar stablecoins launch.",
          value: "1.8×",
          valueLabel: "volume in 6 months",
          cta: "Read analysis",
          route: "report",
        }),
      ],
    },
  }),
};
