import { BriefingKindId } from "@sandworm/types/terminal";

import type { OverviewData } from "@/types";

import { briefingEntry, gapEntry, kpi, signalEntry } from "./builders";
import { buildSetupProgress } from "./setup-progress";
import { standardLayout } from "./standard-layout";

// Every figure here comes from the team's Paycrest notebooks (the onchain deep
// dive to 17 Oct 2026, and the Argentina, Lemon Cash, Nexo, El Dorado, P2P.me,
// Resolva and PAJ Cash notebooks to 3 Nov 2026). Paycrest's totals cover 8 EVM gateways and are a
// minimum; Tron, Lisk, Asset Chain and Starknet are not included.
export const paycrestOverview: OverviewData = {
  clientKind: "paycrest",
  typeName: "Payments protocol",
  subtitle:
    "Paycrest's gateways on 8 chains, and the Latin American platforms it could grow with. Gateway data to 17 Oct 2026.",
  loadingNote:
    "Reading orders from Paycrest's gateways on 8 chains, and payouts from the platforms around them.",
  setup: buildSetupProgress({ clientName: "Paycrest" }),
  library: [
    {
      id: "corridors",
      name: "Corridor tracker",
      description: "Volume and refund rate for each currency Paycrest pays out",
    },
    {
      id: "lp-concentration",
      name: "Liquidity provider concentration",
      description: "How much of settled volume the largest providers fill",
    },
    {
      id: "competitor-prices",
      name: "Competitor prices",
      description:
        "What P2P.me and Binance pay a user next to Paycrest's quote",
    },
    {
      id: "nigeria-competitors",
      name: "Nigeria competitors",
      description: "Monthly naira volume of P2P.me, Resolva and PAJ Cash",
    },
    {
      id: "competitor-merchants",
      name: "Competitor merchants",
      description: "Who fills P2P.me's orders, and how concentrated they are",
    },
    {
      id: "latam-senders",
      name: "Latin American senders",
      description:
        "Platforms whose stablecoin payouts could route through Paycrest",
    },
  ],
  ...standardLayout({
    kpis: [
      kpi({
        label: "Lifetime volume",
        value: "$10.2M",
        delta: "8 chains, a minimum",
        tone: "neutral",
        comparison: "",
      }),
      kpi({
        label: "Orders",
        value: "59.8k",
        delta: "~5,800 users",
        tone: "neutral",
        comparison: "",
      }),
      kpi({
        label: "Protocol fees",
        value: "$31K",
        delta: "0.5% per order",
        tone: "neutral",
        comparison: "",
      }),
      kpi({
        label: "Median settlement",
        value: "0.7 min",
        delta: "most corridors refund ~5%",
        tone: "neutral",
        comparison: "",
      }),
    ],
    briefing: [
      briefingEntry({
        group: "Today",
        kind: BriefingKindId.SIGNAL,
        title: "Lemon Cash pays out about $16M a week in stablecoins",
        summary:
          "Paycrest has no peso corridor yet. Lemon already holds the pesos.",
        entity: "Argentina",
        time: "06:02",
        isUnread: true,
        route: "signal",
      }),
      briefingEntry({
        group: "Today",
        kind: BriefingKindId.METRIC,
        title: "P2P.me pays naira sellers 2.4% more than Paycrest's quote",
        summary: "Since 17 Sep, and from one merchant. It can close quickly.",
        entity: "Nigeria",
        time: "06:00",
        isUnread: true,
        route: "briefing",
      }),
      briefingEntry({
        group: "Today",
        kind: BriefingKindId.METRIC,
        title: "P2P.me's naira business rests on one merchant",
        summary: "About three-quarters of its naira orders.",
        entity: "Nigeria",
        time: "05:40",
        isUnread: true,
        route: "briefing",
      }),
      briefingEntry({
        group: "Yesterday",
        kind: BriefingKindId.ANALYSIS,
        title: "Paycrest: the onchain inside story",
        summary: "New report. 59.8k orders on 8 chains, $10.2M in volume.",
        entity: "Paycrest",
        time: "Mon 14:10",
        isUnread: true,
        route: "report",
      }),
      briefingEntry({
        group: "Yesterday",
        kind: BriefingKindId.SIGNAL,
        title: "Nexo bought Buenbit and opened a Latin American hub",
        summary:
          "About $1.3bn of USDC and USDT moved through Nexo in 2 months.",
        entity: "Nexo",
        time: "Mon 11:32",
        isUnread: false,
        route: "signal",
      }),
      briefingEntry({
        group: "Yesterday",
        kind: BriefingKindId.METRIC,
        title: "Three more naira off-ramps are growing next to Paycrest",
        summary:
          "P2P.me, Resolva and PAJ Cash each move $80K to $330K a month.",
        entity: "Nigeria",
        time: "Mon 09:20",
        isUnread: false,
        route: "briefing",
      }),
      briefingEntry({
        group: "Last week",
        kind: BriefingKindId.ANALYSIS,
        title: "Argentina: who should integrate Paycrest",
        summary: "29 companies scored. Belo is the safest first audit.",
        entity: "Argentina",
        time: "Thu",
        isUnread: false,
        route: "report",
      }),
      briefingEntry({
        group: "Last week",
        kind: BriefingKindId.METRIC,
        title: "Kenya volume grew about 90× in six months",
        summary: "One payout account drives most of it.",
        entity: "Kenya",
        time: "Wed",
        isUnread: false,
        route: "briefing",
      }),
    ],
    signals: [
      signalEntry({
        status: "New",
        title: "Open Argentina with Lemon Cash as the first peso provider",
        observed: "Lemon pays out about $16M a week and already holds pesos.",
        kind: "Market entry",
        size: "$16M",
        sizeLabel: "paid out a week",
        evidence: "Some",
      }),
      signalEntry({
        status: "New",
        title: "Sign Nexo as a sender, and Buenbit's peso desk as a provider",
        observed: "Nexo's Buenos Aires hub needs payout rails in 3 countries.",
        kind: "Partnership",
        size: "$1.3bn",
        sizeLabel: "moved in 2 months",
        evidence: "Some",
      }),
      signalEntry({
        status: "Looking into it",
        title: "Use El Dorado's agents as liquidity for Latin America",
        observed: "Agents pay out in 12 countries through 70+ local methods.",
        kind: "Partnership",
        size: "12",
        sizeLabel: "countries",
        evidence: "Some",
      }),
      signalEntry({
        status: "New",
        title: "Fix the Tanzania gap before opening more corridors",
        observed: "43% of Tanzanian orders were refunded in the last 90 days.",
        kind: "Reliability",
        size: "43%",
        sizeLabel: "refunded",
        evidence: "Strong",
      }),
      signalEntry({
        status: "New",
        title: "Name the platform behind P2P.me's naira cash-outs",
        observed: "One contract funds the wallets that make 82% of them.",
        kind: "Partnership",
        size: "82%",
        sizeLabel: "of P2P.me cash-outs",
        evidence: "Early",
      }),
      signalEntry({
        status: "New",
        title: "Talk to the merchant who fills P2P.me's naira orders",
        observed: "It runs a balanced book every day and already holds naira.",
        kind: "Liquidity",
        size: "~75%",
        sizeLabel: "of P2P.me naira volume",
        evidence: "Some",
      }),
      signalEntry({
        status: "Looking into it",
        title: "Quote closer to the street rate on naira sells",
        observed: "P2P.me's price comes from one merchant and can close fast.",
        kind: "Pricing",
        size: "+2.4%",
        sizeLabel: "more naira per USDC",
        evidence: "Some",
      }),
      signalEntry({
        status: "New",
        title: "Open Brazil on Polygon with BRLA and Transfero",
        observed:
          "Brazilian users already cash out about $500K a month on P2P.me.",
        kind: "Market entry",
        size: "$1.2B",
        sizeLabel: "moved in 90 days",
        evidence: "Some",
      }),
      signalEntry({
        status: "New",
        title: "Open Mexico with Bitso and MXNB as liquidity",
        observed: "P2P.me barely serves pesos, so nobody competes there yet.",
        kind: "Market entry",
        size: "$1.09B",
        sizeLabel: "Bitso paid out in 90 days",
        evidence: "Some",
      }),
      signalEntry({
        status: "New",
        title: "Pitch P2P.me's integrator apps on reliability",
        observed: "13 apps want an embedded ramp and complete 1 in 3 orders.",
        kind: "Sender leads",
        size: "13",
        sizeLabel: "apps",
        evidence: "Some",
      }),
    ],
    gaps: {
      subtitle: "What stands between Paycrest and Latin America.",
      items: [
        gapEntry({
          title: "No Argentine peso corridor",
          detail:
            "Paycrest pays out NGN, KES, UGX and TZS. Lemon alone paid out $144M in stablecoins in 2 months.",
          value: "$144M",
          valueLabel: "Lemon payouts, 2 months",
          cta: "See signal",
          route: "signals",
        }),
        gapEntry({
          title: "Most liquidity comes from one related group",
          detail:
            "Three providers that send their cNGN to the same two wallets filled 60% of settled volume.",
          value: "60%",
          valueLabel: "of settled volume",
          cta: "Read analysis",
          route: "report",
        }),
        gapEntry({
          title: "Argentina moves on USDT, not USDC on Base",
          detail:
            "Most of Paycrest's volume is on Base and BNB, but Argentine payouts are on BNB and Tron.",
          value: "0.5%",
          valueLabel: "of Lemon payouts on Base",
          cta: "Read analysis",
          route: "report",
        }),
        gapEntry({
          title: "P2P.me pays naira sellers more than your quote",
          detail:
            "Since 17 September, from one merchant. Both run a buy-versus-sell gap of about 1.1%.",
          value: "+2.4%",
          valueLabel: "more naira per USDC",
          cta: "Read the analysis",
          route: "briefing",
        }),
        gapEntry({
          title: "No Brazil or Mexico corridor",
          detail:
            "Real stablecoins in Brazil and Bitso payouts in Mexico moved $2.3B between them in 90 days, mostly on Polygon.",
          value: "$2.3B",
          valueLabel: "in 90 days",
          cta: "See signals",
          route: "signals",
        }),
      ],
    },
  }),
};
