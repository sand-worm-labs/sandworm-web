import {
  BriefingKindId,
  type TerminalBriefing,
} from "@sandworm/types/terminal";

import { ago } from "../ago";

import { briefingItem } from "./builders";

export const exchangeBriefing = (): TerminalBriefing => ({
  lastSeenAt: ago(1, "18:40"),
  archivedCount: 9,
  items: [
    briefingItem({
      kind: BriefingKindId.SIGNAL,
      title: "Argentina's off-ramps charge 2× Nigeria's fees",
      summary:
        "11,200 of your wallets cash out to pesos. Worth about $43K a month.",
      subject: "Argentina",
      publishedAt: ago(0, "06:02"),
      isRead: false,
      detail: {
        headline: {
          value: "2.2%",
          label: "average fee to cash out to pesos",
          delta: { text: "Nigeria: 0.9%", tone: "neutral" },
        },
        what: "Cashing out stablecoins to pesos costs 2.2% on average, more than twice what it costs in Nigeria. Argentina's ramps have stayed this expensive for six months while volume kept growing.",
        why: "11,200 of your wallets cash out to pesos every month, about $14.2M. A cheaper route inside Acme Wallet could keep that flow and earn about $43K a month.",
      },
    }),
    briefingItem({
      kind: BriefingKindId.METRIC,
      title: "Swap volume fell 9% this month",
      summary: "7 of your top 50 wallets traded less.",
      subject: "Acme Wallet",
      publishedAt: ago(0, "06:00"),
      isRead: false,
      detail: {
        headline: {
          value: "$1.84B",
          label: "swap volume in October",
          delta: { text: "▼ 9% vs September", tone: "negative" },
        },
        what: "7 of your 50 largest wallets traded 41% less than in September. Everyone else traded about the same as before.",
        why: "Your top 50 wallets make 38% of swap volume, so a few of them slowing down moves the whole number.",
      },
    }),
    briefingItem({
      kind: BriefingKindId.ANALYSIS,
      title: "Paycrest: who actually cashes out in Africa",
      summary: "New report. 2,140 of your users sent money through Paycrest.",
      subject: "Paycrest",
      publishedAt: ago(1, "14:10"),
      isRead: false,
      detail: {
        headline: {
          value: "2,140",
          label: "of your users sent money through Paycrest in October",
          delta: { text: "▲ 18% vs September", tone: "positive" },
        },
        what: "A new report on who uses Paycrest, which countries the money goes to and what each route costs.",
        why: "Your users already rely on it to send money to Nigeria, Kenya and Ghana. The report shows how big that flow is and how fast it grows.",
      },
    }),
    briefingItem({
      kind: BriefingKindId.SIGNAL,
      title: "Let users send money home with Paycrest",
      summary: "$5.1M a month already leaves your app to do this.",
      subject: "Paycrest",
      publishedAt: ago(1, "11:32"),
      isRead: true,
      detail: {
        headline: {
          value: "$5.1M",
          label: "a month leaves your app to send money home",
          delta: { text: "2,140 users", tone: "neutral" },
        },
        what: "Your users move stablecoins out of Acme Wallet, then send them home through Paycrest.",
        why: "A partnership could keep that $5.1M a month inside Acme Wallet and earn a share of the fees.",
      },
    }),
    briefingItem({
      kind: BriefingKindId.METRIC,
      title: "New wallets down 12%",
      summary: "Most of the drop is in Brazil and Mexico.",
      subject: "Acme Wallet",
      publishedAt: ago(1, "06:00"),
      isRead: true,
      detail: {
        headline: {
          value: "21,900",
          label: "new wallets in October",
          delta: { text: "▼ 12% vs September", tone: "negative" },
        },
        what: "October had the fewest new wallets since May. Brazil and Mexico account for most of the drop.",
        why: "Fewer new wallets now means fewer active wallets in three months, when 34% of them would still be trading.",
      },
    }),
    briefingItem({
      kind: BriefingKindId.ANALYSIS,
      title: "Updated: Phantom is gaining your Solana users",
      summary: "Leavers going to Phantom rose from 11% to 17%.",
      subject: "Phantom",
      publishedAt: ago(3, "09:00"),
      isRead: true,
      detail: {
        headline: {
          value: "17%",
          label: "of your leavers now use Phantom next",
          delta: { text: "up from 11% in July", tone: "negative" },
        },
        what: "We updated the report with October. Phantom took a larger share of the wallets that stopped using Acme Wallet.",
        why: "Most of these users trade Solana tokens you do not list yet.",
      },
    }),
    briefingItem({
      kind: BriefingKindId.METRIC,
      title: "Bridging to Solana tripled this quarter",
      summary: "$96M moved last month.",
      subject: "Solana",
      publishedAt: ago(4, "09:00"),
      isRead: true,
      detail: {
        headline: {
          value: "$96M",
          label: "bridged to Solana by your users in October",
          delta: { text: "3× July", tone: "neutral" },
        },
        what: "24,500 of your wallets bridged to Solana in October, most of them to trade tokens you do not list.",
        why: "Every bridge is a trade that happens somewhere else.",
      },
    }),
    briefingItem({
      kind: BriefingKindId.ANALYSIS,
      title: "Stablecoin yields: where your users earn",
      summary: "New report. 38,000 of your wallets earn on Aave.",
      subject: "Aave",
      publishedAt: ago(5, "09:00"),
      isRead: true,
      detail: {
        headline: {
          value: "$212M",
          label: "your users keep in Aave to earn interest",
          delta: { text: "38,000 wallets", tone: "neutral" },
        },
        what: "A new report on where your users earn interest on stablecoins and how much they keep there.",
        why: "Acme Wallet has no way to earn on USDC, so this money sits elsewhere.",
      },
    }),
    briefingItem({
      kind: BriefingKindId.ANALYSIS,
      title: "Delivered: LatAm cash-out sizing",
      summary: "The research Alex requested on 14 Oct.",
      subject: "Your request",
      publishedAt: ago(6, "09:00"),
      isRead: true,
      detail: {
        headline: {
          value: "12 days",
          label: "from request to delivery",
          delta: { text: "Delivered", tone: "positive" },
        },
        what: "Sandworm delivered the research you asked for: how much your users cash out in Argentina, Brazil and Mexico, and what they pay.",
        why: "It sizes the Argentina signal and two smaller ones in Brazil and Mexico.",
      },
    }),
  ],
});
