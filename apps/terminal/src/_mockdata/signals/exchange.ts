import type { SignalsFeed } from "@/types";

import { signal } from "./builders";

export const exchangeSignals: SignalsFeed = {
  items: [
    signal({
      status: "New",
      title: "Argentina's off-ramps charge 2× Nigeria's fees",
      observed:
        "11,200 of your wallets cash out to pesos, paying 2.2% on average.",
      couldMean:
        "A cheaper peso route inside your app could keep some of that flow.",
      kind: "Market",
      size: "$14.2M/mo",
      sizeLabel: "cashed out to pesos",
      evidence: "Strong",
      when: "Today",
    }),
    signal({
      status: "New",
      title: "Your users send money home through Paycrest",
      observed: "2,140 of your users moved $5.1M through Paycrest last month.",
      couldMean:
        "Sending money home from inside the app may be something they want.",
      kind: "Partner",
      size: "$5.1M/mo",
      sizeLabel: "sent through Paycrest",
      evidence: "Some",
      when: "Mon",
    }),
    signal({
      status: "New",
      title: "Your users bridge to Solana for tokens you don't list",
      observed:
        "24,500 of your wallets bridged to Solana and bought tokens there.",
      couldMean:
        "Some of that trading might stay with you if those tokens were listed.",
      kind: "Product",
      size: "$96M/mo",
      sizeLabel: "traded on Solana",
      evidence: "Some",
      when: "Wed",
    }),
    signal({
      status: "Looking into it",
      title: "Your users earn on stablecoins elsewhere",
      observed: "38,000 of your wallets hold $212M in Aave stablecoin pools.",
      couldMean: "Interest on stablecoins in-app could bring some of it back.",
      kind: "Product",
      size: "$212M",
      sizeLabel: "deposited in Aave",
      evidence: "Strong",
      when: "27 Oct",
    }),
    signal({
      status: "Looking into it",
      title: "Brazilian users buy crypto through Pix in other apps",
      observed: "19,600 of your wallets in Brazil top up through other apps.",
      couldMean: "Pix inside your app may shorten that path.",
      kind: "Market",
      size: "19,600",
      sizeLabel: "wallets in Brazil",
      evidence: "Some",
      when: "16 Oct",
    }),
    signal({
      status: "Acting on it",
      title: "More of your leavers go to Phantom",
      observed:
        "1,670 of your leavers went to Phantom in October, up from 11% to 17%.",
      couldMean: "What Phantom offers on Solana may be part of why they leave.",
      kind: "Retention",
      size: "1,670",
      sizeLabel: "wallets in October",
      evidence: "Some",
      when: "9 Oct",
    }),
    signal({
      status: "Not for us",
      title: "Few of your users trade NFTs",
      observed: "Your users traded $0.4M of NFTs last month.",
      couldMean: "Too small to say much yet.",
      kind: "Product",
      size: "$0.4M/mo",
      sizeLabel: "NFT volume",
      evidence: "Early",
      when: "2 Oct",
    }),
  ],
};
