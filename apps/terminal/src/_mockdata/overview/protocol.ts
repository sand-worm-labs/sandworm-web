import type { OverviewData } from "@/features/overview/types";

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

export const protocolOverview: OverviewData = {
  clientKind: "protocol",
  typeName: "DeFi protocol",
  subtitle: "Aave v3 on Ethereum, Base and Arbitrum. Data to 2 Nov, 23:59 UTC.",
  loadingNote: "Reading 2.6M deposits, borrows and withdrawals on Aave v3.",
  setup: buildSetupProgress({
    clientName: "Aave",
  }),
  library: [
    {
      id: "rates",
      name: "Rates against competitors",
      description:
        "Your supply and borrow rates next to Morpho, Spark and Compound",
    },
    {
      id: "liquidations",
      name: "Liquidation watch",
      description: "Large positions close to liquidation",
    },
    {
      id: "rewards",
      name: "Rewards efficiency",
      description: "What incentives cost per dollar kept 90 days",
    },
    {
      id: "retention",
      name: "Retention by cohort",
      description: "How many new depositors stay after 30, 60 and 90 days",
    },
  ],
  ...standardLayout({
    kpis: [
      kpi({
        label: "Deposits",
        value: "$28.4B",
        delta: "▲ 2%",
        tone: "positive",
        series: [10, 10, 10, 11, 11, 11, 11, 12, 12, 12, 12],
      }),
      kpi({
        label: "Fees, 30 days",
        value: "$62M",
        delta: "▲ 5%",
        tone: "positive",
        series: [9, 9, 10, 10, 10, 11, 10, 11, 11, 12, 12],
      }),
      kpi({
        label: "Revenue, 30 days",
        value: "$9.1M",
        delta: "▲ 4%",
        tone: "positive",
        series: [9, 10, 10, 10, 10, 11, 11, 11, 11, 12, 12],
      }),
      kpi({
        label: "Active users",
        value: "98,600",
        delta: "▼ 1%",
        tone: "negative",
        series: [11, 11, 11, 11, 10, 11, 10, 10, 10, 10, 10],
      }),
    ],
    briefing: [
      briefingEntry({
        group: "Today",
        kind: "Opportunity",
        title: "Your borrowers take cbBTC on Morpho",
        summary:
          "3,400 of your users borrow it there. Worth about $1.2M a month in fees.",
        entity: "Morpho",
        time: "06:02",
        isUnread: true,
        route: "opportunity",
      }),
      briefingEntry({
        group: "Today",
        kind: "Metric",
        title: "Top 10 depositors withdrew $410M",
        summary: "Two of them moved to Spark.",
        entity: "Aave v3",
        time: "06:00",
        isUnread: true,
        route: "briefing",
      }),
      briefingEntry({
        group: "Yesterday",
        kind: "Analysis",
        title: "Spark's deposit rewards, sized",
        summary:
          "New report. Rewards cost Spark $3.10 for every $100 kept 90 days.",
        entity: "Spark",
        time: "Mon 14:10",
        isUnread: true,
        route: "report",
      }),
      briefingEntry({
        group: "Yesterday",
        kind: "Opportunity",
        title: "List USDe as collateral on Base",
        summary: "$640M of USDe sits idle in your users' wallets.",
        entity: "Ethena",
        time: "Mon 11:32",
        isUnread: false,
        route: "opportunity",
      }),
      briefingEntry({
        group: "Last week",
        kind: "Analysis",
        title: "Updated: who borrows on Base",
        summary: "Loopers now make 44% of Base borrowing.",
        entity: "Base",
        time: "Thu",
        isUnread: false,
        route: "report",
      }),
      briefingEntry({
        group: "Last week",
        kind: "Metric",
        title: "Active users down 1%",
        summary: "Accounts under $1K left first.",
        entity: "Aave v3",
        time: "Wed",
        isUnread: false,
        route: "briefing",
      }),
    ],
    opportunities: [
      opportunityEntry({
        status: "New",
        title: "List cbBTC borrowing on more markets",
        summary: "3,400 of your users borrow it on Morpho.",
        kind: "Product gap",
        value: "$1.2M/mo",
        valueLabel: "fees",
        confidence: "High",
      }),
      opportunityEntry({
        status: "New",
        title: "List USDe as collateral on Base",
        summary: "$640M sits idle in your users' wallets.",
        kind: "Product gap",
        value: "$640M",
        valueLabel: "possible deposits",
        confidence: "Medium",
      }),
      opportunityEntry({
        status: "Reviewing",
        title: "Win back depositors from Spark",
        summary: "Two top-10 depositors moved there this month.",
        kind: "Retention",
        value: "$410M",
        valueLabel: "deposits at risk",
        confidence: "High",
      }),
    ],
    concentration: {
      title: "Who carries your deposits",
      summary: "20 wallets hold 31% of deposits. Two of them left this month.",
      segments: [
        segment("Top 20 wallets", "20", 31),
        segment("Next 2,000 wallets", "2,000", 44),
        segment("Everyone else", "96,580", 25),
      ],
    },
    destinations: {
      title: "Where withdrawn funds go",
      summary:
        "Funds that left Aave this month, by where they were deposited next:",
      tone: "navy",
      rows: [
        destination("Morpho", 34, "34%"),
        destination("Spark", 22, "22%"),
        destination("Compound", 12, "12%"),
        destination("Fluid", 9, "9%"),
        destination("Others", 23, "23%"),
      ],
    },
    gaps: {
      subtitle: "Things your users do somewhere else.",
      items: [
        gapEntry({
          title: "3,400 of your users borrow cbBTC on Morpho",
          detail: "Rates there are 0.8 points lower.",
          value: "$1.2M",
          valueLabel: "fees a month",
          cta: "See opportunity",
          route: "opportunities",
        }),
        gapEntry({
          title: "$640M of USDe sits idle in your users' wallets",
          detail: "You don't accept it as collateral on Base.",
          value: "$640M",
          valueLabel: "idle",
          cta: "See opportunity",
          route: "opportunity",
        }),
        gapEntry({
          title: "6,800 of your users loop stETH on Spark",
          detail: "For about 1.4 points more yield.",
          value: "$1.9B",
          valueLabel: "looped",
          cta: "Read analysis",
          route: "report",
        }),
      ],
    },
  }),
};
