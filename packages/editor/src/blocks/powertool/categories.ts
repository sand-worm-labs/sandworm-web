import type { ToolCategory } from "./types.js";

export const TOOL_CATEGORIES: ToolCategory[] = [
  {
    id: "primitives",
    name: "Primitives",
    description: "Foundational chain-agnostic building blocks — transfers, balances, gas, logs",
  },
  {
    id: "wallet",
    name: "Wallet",
    description: "Address-centric profiling — PnL, portfolio, fund flows, counterparties",
  },
  {
    id: "defi",
    name: "DeFi & Protocols",
    description: "DEX, lending, stablecoins, perps, governance, MEV, treasury",
  },
  {
    id: "nft",
    name: "NFT",
    description: "Collection analytics, holders, mint activity, wash trading detection",
  },
  {
    id: "staking",
    name: "Staking",
    description: "Validator stats, staking flows, rewards, liquid staking, restaking",
  },
  {
    id: "bridges",
    name: "Bridges",
    description: "Cross-chain volume, user flows, bridge fees, TVL, settlement time",
  },
  {
    id: "attestations",
    name: "Attestations & Identity",
    description: "EAS attestations by schema, attestors, recipients, Gitcoin Passport",
  },
  {
    id: "forensics",
    name: "Forensics",
    description: "Fund tracing, mixer detection, rug pulls, sandwich attacks, sanctions",
  },
  {
    id: "contracts",
    name: "Contracts",
    description: "Custom contract analytics — events, unique users, revenue, errors",
  },
  {
    id: "chains",
    name: "Chain & L2",
    description: "Network-level metrics — DAU, gas history, TPS, blobs, sequencer",
  },
];