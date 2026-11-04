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

export const exchangeOverview: OverviewData = {
  clientKind: "exchange",
  typeName: "Trading app",
  subtitle: "Robinhood Wallet and Robinhood Chain. Data to 2 Nov, 23:59 UTC.",
  loadingNote:
    "Reading 1.2M transactions from Robinhood Wallet and Robinhood Chain.",
  setup: buildSetupProgress({
    clientName: "Robinhood",
  }),
  library: [
    {
      id: "retention",
      name: "Retention by cohort",
      description:
        "How many new users are still active after 30, 60 and 90 days",
    },
    {
      id: "regions",
      name: "Activity by region",
      description:
        "Where your users are, based on the cash-out routes they use",
    },
    {
      id: "moves",
      name: "Largest wallet moves",
      description: "Transfers over $1M from wallets that matter to you",
    },
    {
      id: "fees",
      name: "Fees against competitors",
      description: "What users pay with you and with the nearest rivals",
    },
  ],
  ...standardLayout({
    kpis: [
      kpi({
        label: "Swap volume",
        value: "$1.84B",
        delta: "▼ 9%",
        tone: "negative",
        series: [10, 11, 11, 12, 12, 11, 12, 11, 10, 10, 9],
      }),
      kpi({
        label: "Active wallets",
        value: "312,400",
        delta: "▲ 4%",
        tone: "positive",
        series: [8, 8, 9, 9, 9, 10, 10, 10, 11, 11, 11],
      }),
      kpi({
        label: "New wallets",
        value: "21,900",
        delta: "▼ 12%",
        tone: "negative",
        series: [12, 12, 11, 12, 11, 10, 10, 9, 9, 9, 8],
      }),
      kpi({
        label: "Still trading after 90 days",
        value: "34%",
        delta: "▼ 3 pts",
        tone: "negative",
        series: [11, 11, 10, 11, 10, 10, 10, 9, 9, 9, 9],
      }),
    ],
    briefing: [
      briefingEntry({
        group: "Today",
        kind: "Opportunity",
        title: "Argentina's off-ramps charge 2× Nigeria's fees",
        summary:
          "11,200 of your wallets cash out to pesos. Worth about $43K a month.",
        entity: "Argentina",
        time: "06:02",
        isUnread: true,
        route: "opportunity",
      }),
      briefingEntry({
        group: "Today",
        kind: "Metric",
        title: "Swap volume fell 9% this month",
        summary: "7 of your top 50 wallets traded less.",
        entity: "Robinhood Wallet",
        time: "06:00",
        isUnread: true,
        route: "briefing",
      }),
      briefingEntry({
        group: "Yesterday",
        kind: "Analysis",
        title: "Paycrest: who actually cashes out in Africa",
        summary: "New report. 2,140 of your users sent money through Paycrest.",
        entity: "Paycrest",
        time: "Mon 14:10",
        isUnread: true,
        route: "report",
      }),
      briefingEntry({
        group: "Yesterday",
        kind: "Opportunity",
        title: "Let users send money home with Paycrest",
        summary: "$5.1M a month already leaves your app to do this.",
        entity: "Paycrest",
        time: "Mon 11:32",
        isUnread: false,
        route: "opportunity",
      }),
      briefingEntry({
        group: "Last week",
        kind: "Analysis",
        title: "Updated: Phantom is gaining your Solana users",
        summary: "Leavers going to Phantom rose from 11% to 17%.",
        entity: "Phantom",
        time: "Thu",
        isUnread: false,
        route: "report",
      }),
      briefingEntry({
        group: "Last week",
        kind: "Metric",
        title: "Bridging to Solana tripled this quarter",
        summary: "$96M moved last month.",
        entity: "Solana",
        time: "Wed",
        isUnread: false,
        route: "briefing",
      }),
    ],
    opportunities: [
      opportunityEntry({
        status: "New",
        title: "Argentina's off-ramps charge 2× Nigeria's fees",
        summary: "Offer a cheaper cash-out to pesos inside Robinhood Wallet.",
        kind: "Market entry",
        value: "$43K/mo",
        valueLabel: "possible revenue",
        confidence: "High",
      }),
      opportunityEntry({
        status: "Reviewing",
        title: "Offer interest on stablecoins",
        summary: "38,000 of your wallets earn it on Aave instead.",
        kind: "Product gap",
        value: "$212M",
        valueLabel: "deposited elsewhere",
        confidence: "High",
      }),
      opportunityEntry({
        status: "New",
        title: "Let users send money home with Paycrest",
        summary: "2,140 of your users already leave your app to do it.",
        kind: "Partnership",
        value: "$5.1M/mo",
        valueLabel: "flow you could keep",
        confidence: "Medium",
      }),
    ],
    concentration: {
      title: "Who carries your volume",
      summary:
        "50 wallets make 38% of swap volume. If a few slow down, volume drops fast.",
      segments: [
        segment("Top 50 wallets", "50", 38),
        segment("Next 5,000 wallets", "5,000", 41),
        segment("Everyone else", "307,350", 21),
      ],
    },
    destinations: {
      title: "Where users go when they leave",
      summary:
        "9,840 wallets stopped using Robinhood Wallet this month. The wallet app they used next:",
      tone: "navy",
      rows: [
        destination("Coinbase Wallet", 31, "31%"),
        destination("MetaMask", 22, "22%"),
        destination("Phantom", 17, "17%"),
        destination("Uniswap Wallet", 9, "9%"),
        destination("Others", 21, "21%"),
      ],
    },
    gaps: {
      subtitle: "Things your users do somewhere else.",
      items: [
        gapEntry({
          title:
            "38,000 of your wallets earn interest on stablecoins with Aave",
          detail: "Robinhood Wallet has no way to earn on USDC.",
          value: "$212M",
          valueLabel: "deposited",
          cta: "See opportunity",
          route: "opportunities",
        }),
        gapEntry({
          title:
            "11,200 of your wallets cash out to pesos through costly ramps",
          detail: "They pay 2.2% on average. Nigeria pays 0.9%.",
          value: "$14.2M",
          valueLabel: "a month",
          cta: "See opportunity",
          route: "opportunity",
        }),
        gapEntry({
          title:
            "24,500 of your wallets bridge to Solana to trade tokens you don't list",
          detail: "Up 3× since July.",
          value: "$96M",
          valueLabel: "a month",
          cta: "Read analysis",
          route: "report",
        }),
      ],
    },
  }),
};
