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

export const chainOverview: OverviewData = {
  clientKind: "chain",
  typeName: "Blockchain",
  subtitle: "Base mainnet. Data to 2 Nov, 23:59 UTC.",
  loadingNote: "Reading 312M transactions on Base mainnet.",
  setup: buildSetupProgress({
    clientName: "Base",
  }),
  library: [
    {
      id: "developers",
      name: "Developer activity",
      description:
        "Contracts shipped and active developers, against other chains",
    },
    {
      id: "apps",
      name: "App leaderboard",
      description: "Top apps by users who are still active after 30 days",
    },
    {
      id: "bridges",
      name: "Bridge flows",
      description: "Value bridged in and out, by chain",
    },
    {
      id: "stablecoins",
      name: "Stablecoins by issuer",
      description: "USDC, USDT and others on your chain",
    },
  ],
  ...standardLayout({
    kpis: [
      kpi({
        label: "Daily active addresses",
        value: "1.42M",
        delta: "▲ 7%",
        tone: "positive",
        series: [8, 9, 9, 9, 10, 10, 10, 11, 11, 12, 12],
      }),
      kpi({
        label: "Fees, 30 days",
        value: "$4.1M",
        delta: "▲ 9%",
        tone: "positive",
        series: [8, 8, 9, 9, 10, 10, 10, 11, 11, 11, 12],
      }),
      kpi({
        label: "Stablecoin supply",
        value: "$4.6B",
        delta: "▲ 11%",
        tone: "positive",
        series: [7, 8, 8, 9, 9, 10, 10, 10, 11, 11, 12],
      }),
      kpi({
        label: "Active developers",
        value: "2,310",
        delta: "▲ 3%",
        tone: "positive",
        series: [10, 10, 10, 10, 11, 11, 11, 11, 11, 12, 12],
      }),
    ],
    briefing: [
      briefingEntry({
        group: "Today",
        kind: "Opportunity",
        title: "Payment apps your users love only exist on Solana",
        summary: "180,000 of your users pay with them there.",
        entity: "Solana",
        time: "06:02",
        isUnread: true,
        route: "opportunity",
      }),
      briefingEntry({
        group: "Today",
        kind: "Metric",
        title: "Stablecoin supply passed $4.6B",
        summary: "Up 11% in 30 days, mostly USDC.",
        entity: "Base",
        time: "06:00",
        isUnread: true,
        route: "briefing",
      }),
      briefingEntry({
        group: "Yesterday",
        kind: "Analysis",
        title: "Where Base users bridge out to",
        summary: "New report. Arbitrum and Solana take 53% of outflows.",
        entity: "Bridges",
        time: "Mon 14:10",
        isUnread: true,
        route: "report",
      }),
      briefingEntry({
        group: "Yesterday",
        kind: "Opportunity",
        title: "Back a Base-native NFT lending app",
        summary: "Base NFT traders borrow $14M a month on Ethereum.",
        entity: "NFT lending",
        time: "Mon 11:32",
        isUnread: false,
        route: "opportunity",
      }),
      briefingEntry({
        group: "Last week",
        kind: "Analysis",
        title: "Updated: top apps by users who stay",
        summary: "3 of the top 10 apps keep under 20% of users after 30 days.",
        entity: "Apps",
        time: "Thu",
        isUnread: false,
        route: "report",
      }),
      briefingEntry({
        group: "Last week",
        kind: "Metric",
        title: "Active developers up 3%",
        summary: "2,310 developers shipped contracts in October.",
        entity: "Base",
        time: "Wed",
        isUnread: false,
        route: "briefing",
      }),
    ],
    opportunities: [
      opportunityEntry({
        status: "New",
        title: "Bring Solana payment apps to Base",
        summary: "180,000 of your users already pay with them on Solana.",
        kind: "Ecosystem gap",
        value: "180,000",
        valueLabel: "users to win",
        confidence: "High",
      }),
      opportunityEntry({
        status: "New",
        title: "Back a Base-native NFT lending app",
        summary: "NFT traders borrow on Ethereum today.",
        kind: "Ecosystem gap",
        value: "$14M/mo",
        valueLabel: "borrowing",
        confidence: "Medium",
      }),
      opportunityEntry({
        status: "Reviewing",
        title: "Keep perps traders on Base",
        summary: "41,000 of your users trade perps on Hyperliquid.",
        kind: "Retention",
        value: "$2.3B/mo",
        valueLabel: "volume",
        confidence: "Medium",
      }),
    ],
    concentration: {
      title: "Who carries your activity",
      summary: "10 apps make 58% of transactions on Base.",
      segments: [
        segment("Top 10 apps", "10", 58),
        segment("Next 90 apps", "90", 27),
        segment("Every other app", "4,800", 15),
      ],
    },
    destinations: {
      title: "Where users bridge out to",
      summary: "Value bridged out of Base this month, by destination:",
      tone: "navy",
      rows: [
        destination("Arbitrum", 29, "29%"),
        destination("Solana", 24, "24%"),
        destination("Ethereum", 21, "21%"),
        destination("Optimism", 11, "11%"),
        destination("Others", 15, "15%"),
      ],
    },
    gaps: {
      subtitle: "Things your users do on other chains.",
      items: [
        gapEntry({
          title:
            "180,000 of your users pay with stablecoin apps that only exist on Solana",
          detail: "There is no Base version of the top three.",
          value: "$210M",
          valueLabel: "a month",
          cta: "See opportunity",
          route: "opportunities",
        }),
        gapEntry({
          title: "41,000 of your users trade perps on Hyperliquid",
          detail: "Base perps venues hold 12% of their volume.",
          value: "$2.3B",
          valueLabel: "a month",
          cta: "See opportunity",
          route: "opportunity",
        }),
        gapEntry({
          title: "Your NFT traders borrow on Ethereum",
          detail: "There is no NFT lending app on Base.",
          value: "$14M",
          valueLabel: "a month",
          cta: "Read analysis",
          route: "report",
        }),
      ],
    },
  }),
};
