import type { OverviewData } from "@/features/overview/types";

import {
  briefingEntry,
  destination,
  gapEntry,
  kpi,
  signalEntry,
  segment,
} from "./builders";
import { buildSetupProgress } from "./setup-progress";
import { standardLayout } from "./standard-layout";

export const nftOverview: OverviewData = {
  clientKind: "nft",
  typeName: "NFT marketplace",
  subtitle: "OpenSea on Ethereum, Base and Solana. Data to 2 Nov, 23:59 UTC.",
  loadingNote: "Reading 4.8M trades from OpenSea on Ethereum, Base and Solana.",
  setup: buildSetupProgress({
    clientName: "OpenSea",
  }),
  library: [
    {
      id: "leaderboard",
      name: "Collection leaderboard",
      description:
        "Your top collections against the same ones on rival marketplaces",
    },
    {
      id: "royalties",
      name: "Royalties paid",
      description: "Royalties paid to creators, by marketplace",
    },
    {
      id: "inorganic",
      name: "Inorganic volume",
      description: "Trading that looks like wash trading, by marketplace",
    },
    {
      id: "retention",
      name: "Retention by cohort",
      description:
        "How many new traders are still active after 30, 60 and 90 days",
    },
  ],
  ...standardLayout({
    kpis: [
      kpi({
        label: "Trading volume",
        value: "$412M",
        delta: "▲ 6%",
        tone: "positive",
        series: [8, 9, 9, 8, 9, 10, 10, 11, 10, 11, 12],
      }),
      kpi({
        label: "Market share",
        value: "41%",
        delta: "▲ 3 pts",
        tone: "positive",
        series: [9, 9, 9, 10, 10, 10, 11, 11, 11, 12, 12],
      }),
      kpi({
        label: "Unique traders",
        value: "186,000",
        delta: "▼ 2%",
        tone: "negative",
        series: [11, 11, 12, 11, 11, 10, 11, 10, 10, 10, 10],
      }),
      kpi({
        label: "Fees and royalties",
        value: "$3.9M",
        delta: "▲ 4%",
        tone: "positive",
        series: [9, 9, 10, 9, 10, 10, 10, 11, 11, 11, 11],
      }),
    ],
    briefing: [
      briefingEntry({
        group: "Today",
        kind: "Signal",
        title: "Solana collectors buy 4× more on Magic Eden",
        summary:
          "52,000 of your traders also buy there. Worth about $310K a month.",
        entity: "Solana",
        time: "06:02",
        isUnread: true,
        route: "signal",
      }),
      briefingEntry({
        group: "Today",
        kind: "Metric",
        title: "Market share reached 41%",
        summary: "Highest since March, up 3 points in 30 days.",
        entity: "OpenSea",
        time: "06:00",
        isUnread: true,
        route: "briefing",
      }),
      briefingEntry({
        group: "Yesterday",
        kind: "Analysis",
        title: "Who drives Blur's volume now",
        summary: "New report. The top 1% of traders make 61% of Blur's volume.",
        entity: "Blur",
        time: "Mon 14:10",
        isUnread: true,
        route: "report",
      }),
      briefingEntry({
        group: "Yesterday",
        kind: "Signal",
        title: "Offer loans against NFTs",
        summary: "4,100 of your collectors borrow on Blend today.",
        entity: "Blend",
        time: "Mon 11:32",
        isUnread: false,
        route: "signal",
      }),
      briefingEntry({
        group: "Last week",
        kind: "Analysis",
        title: "Updated: inorganic volume on rival marketplaces",
        summary: "Share of wash-like trading fell to 18%.",
        entity: "Market",
        time: "Thu",
        isUnread: false,
        route: "report",
      }),
      briefingEntry({
        group: "Last week",
        kind: "Metric",
        title: "Unique traders down 2%",
        summary: "Mostly in collections with floors under $1K.",
        entity: "OpenSea",
        time: "Wed",
        isUnread: false,
        route: "briefing",
      }),
    ],
    signals: [
      signalEntry({
        status: "New",
        title: "Win Solana collectors from Magic Eden",
        observed:
          "Lower fees on the Solana collections your traders already buy.",
        kind: "Market share",
        size: "$310K/mo",
        sizeLabel: "possible revenue",
        evidence: "Strong",
      }),
      signalEntry({
        status: "Looking into it",
        title: "Offer loans against NFTs",
        observed: "4,100 of your collectors borrow on Blend.",
        kind: "Product gap",
        size: "$22M",
        sizeLabel: "borrowed elsewhere",
        evidence: "Some",
      }),
      signalEntry({
        status: "New",
        title: "Bring royalty-paying creators back",
        observed: "340 creators moved collections to Zora this quarter.",
        kind: "Partnership",
        size: "$1.2M/mo",
        sizeLabel: "trading volume",
        evidence: "Some",
      }),
    ],
    concentration: {
      title: "Who carries your volume",
      summary:
        "1,860 traders, the top 1%, make 24% of volume. On Blur the top 1% make 61%.",
      segments: [
        segment("Top 1% of traders", "1,860", 24),
        segment("Next 9% of traders", "16,700", 41),
        segment("Everyone else", "167,440", 35),
      ],
    },
    destinations: {
      title: "Where your traders also trade",
      summary:
        "Share of your traders who also traded on another marketplace this month:",
      tone: "navy",
      rows: [
        destination("Blur", 38, "38%"),
        destination("Magic Eden", 27, "27%"),
        destination("Tensor", 11, "11%"),
        destination("Zora", 9, "9%"),
        destination("Others", 15, "15%"),
      ],
    },
    gaps: {
      subtitle: "Things your traders do somewhere else.",
      items: [
        gapEntry({
          title: "4,100 of your collectors borrow against NFTs on Blend",
          detail: "You don't offer NFT-backed loans.",
          value: "$22M",
          valueLabel: "borrowed",
          cta: "See signal",
          route: "signals",
        }),
        gapEntry({
          title: "52,000 of your traders buy Solana NFTs on Magic Eden",
          detail: "Your Solana listings are thinner in their top collections.",
          value: "$33M",
          valueLabel: "a month",
          cta: "See signal",
          route: "signal",
        }),
        gapEntry({
          title: "9,300 of your creators mint on Zora first",
          detail: "They list there, then here.",
          value: "310K",
          valueLabel: "mints a month",
          cta: "Read analysis",
          route: "report",
        }),
      ],
    },
  }),
};
