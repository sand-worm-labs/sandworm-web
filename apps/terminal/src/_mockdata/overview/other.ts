import type { OverviewData } from "@/types";

import { briefingEntry, gapEntry, kpi, signalEntry } from "./builders";
import { buildSetupProgress } from "./setup-progress";
import { standardLayout } from "./standard-layout";

export const otherOverview: OverviewData = {
  clientKind: "other",
  typeName: "General",
  subtitle: "Northwind's users and activity onchain. Data to 2 Nov, 23:59 UTC.",
  loadingNote:
    "Reading onchain activity for the contracts and wallets you added.",
  setup: buildSetupProgress({ clientName: "Northwind" }),
  library: [
    {
      id: "retention",
      name: "Retention cohorts",
      description: "How many users are still active weeks after they arrive",
    },
    {
      id: "top-wallets",
      name: "Top wallets",
      description: "The wallets that carry the most activity",
    },
    {
      id: "rivals",
      name: "Rival activity",
      description: "How similar products are growing next to yours",
    },
    {
      id: "movers",
      name: "Biggest movers",
      description: "Wallets and apps with the sharpest weekly change",
    },
  ],
  ...standardLayout({
    kpis: [
      kpi({
        label: "Active users",
        value: "58,400",
        delta: "▲ 5%",
        tone: "positive",
      }),
      kpi({
        label: "New users",
        value: "6,900",
        delta: "▼ 3%",
        tone: "negative",
      }),
      kpi({
        label: "Transactions",
        value: "412,000",
        delta: "▲ 8%",
        tone: "positive",
      }),
      kpi({
        label: "Still active after 90 days",
        value: "29%",
        delta: "▲ 1 pt",
        tone: "positive",
      }),
    ],
    briefing: [
      briefingEntry({
        group: "Today",
        kind: "Signal",
        title: "Users who leave go to the same two apps",
        summary: "1,900 of your lapsed wallets moved to them last month.",
        entity: "Churn",
        time: "06:02",
        isUnread: true,
        route: "signal",
      }),
      briefingEntry({
        group: "Today",
        kind: "Metric",
        title: "New users down 3% this week",
        summary: "Most of the drop came from referrals.",
        entity: "Northwind",
        time: "06:00",
        isUnread: true,
        route: "briefing",
      }),
      briefingEntry({
        group: "Yesterday",
        kind: "Analysis",
        title: "Who your most active users are",
        summary: "New report. 2% of wallets make 41% of transactions.",
        entity: "Northwind",
        time: "Mon 14:10",
        isUnread: true,
        route: "report",
      }),
      briefingEntry({
        group: "Yesterday",
        kind: "Signal",
        title: "A rival launched a rewards programme",
        summary: "Its weekly signups doubled in five days.",
        entity: "Rivals",
        time: "Mon 11:32",
        isUnread: false,
        route: "signal",
      }),
      briefingEntry({
        group: "Last week",
        kind: "Analysis",
        title: "Retention by signup month",
        summary: "Users who arrive in the first week of a month stay longer.",
        entity: "Retention",
        time: "Thu",
        isUnread: false,
        route: "report",
      }),
      briefingEntry({
        group: "Last week",
        kind: "Metric",
        title: "Transactions per user up 6%",
        summary: "Driven by a small group of repeat users.",
        entity: "Northwind",
        time: "Wed",
        isUnread: false,
        route: "briefing",
      }),
    ],
    signals: [
      signalEntry({
        status: "New",
        title: "Win back lapsed users",
        observed: "1,900 wallets moved to two other apps last month.",
        kind: "Retention",
        size: "1,900",
        sizeLabel: "wallets",
        evidence: "Strong",
      }),
      signalEntry({
        status: "New",
        title: "Match a rival's rewards programme",
        observed: "Its weekly signups doubled within five days.",
        kind: "Market share",
        size: "2×",
        sizeLabel: "rival signups",
        evidence: "Some",
      }),
      signalEntry({
        status: "Looking into it",
        title: "Reach your most active 2%",
        observed: "They make 41% of all transactions.",
        kind: "Product gap",
        size: "41%",
        sizeLabel: "of transactions",
        evidence: "Strong",
      }),
    ],
    gaps: {
      subtitle: "Things your users do somewhere else.",
      items: [
        gapEntry({
          title: "Rewards and referrals",
          detail: "Your users earn them on two rival apps instead.",
          value: "1,900",
          valueLabel: "wallets",
          cta: "See signal",
          route: "signals",
        }),
        gapEntry({
          title: "Cross-chain activity",
          detail: "A third of your users bridge out to use other apps.",
          value: "33%",
          valueLabel: "of users",
          cta: "Read analysis",
          route: "report",
        }),
        gapEntry({
          title: "Stablecoin yield",
          detail: "Users keep idle balances in other protocols.",
          value: "$14M",
          valueLabel: "idle balances",
          cta: "Read analysis",
          route: "report",
        }),
      ],
    },
  }),
};
