import type { ToolDefinition } from "../types.js";
import { CHAIN_OPTIONS, TIME_RANGE_OPTIONS } from "../constants.js";

const GRANULARITY_OPTIONS = [
  { label: "Hourly", value: "hour" },
  { label: "Daily", value: "day" },
  { label: "Weekly", value: "week" },
];

const GAS_PERCENTILE_OPTIONS = [
  { label: "p50 (median)", value: "0.5" },
  { label: "p75", value: "0.75" },
  { label: "p90", value: "0.90" },
  { label: "p95", value: "0.95" },
  { label: "p99", value: "0.99" },
];

export const CHAIN_DEFINITIONS: ToolDefinition[] = [
  {
    id: "chains.dau_tps",
    templateId: "chains.dau_tps",
    categoryId: "chains",
    name: "Chain DAU / TPS",
    description: "Daily active users and transactions per second for any supported chain.",
    tags: ["chain", "dau", "tps", "activity", "users", "growth"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "90" },
      { key: "granularity", label: "Granularity", type: "select", required: true, options: GRANULARITY_OPTIONS, default: "day" },
    ],
  },

  {
    id: "chains.l2_sequencer",
    templateId: "chains.l2_sequencer",
    categoryId: "chains",
    name: "L2 sequencer activity",
    description: "Batch submission frequency, batch size, and compression ratio for an L2 sequencer.",
    tags: ["l2", "sequencer", "batch", "rollup", "optimism", "base", "arbitrum"],
    uiHint: "form",
    params: [
      { key: "chain", label: "L2 chain", type: "chain", required: true, options: [
        { label: "Base", value: "base" },
        { label: "Optimism", value: "optimism" },
        { label: "Arbitrum", value: "arbitrum" },
        { label: "Scroll", value: "scroll" },
        { label: "Linea", value: "linea" },
        { label: "zkSync Era", value: "zksync" },
      ], default: "base" },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
    ],
  },

  {
    id: "chains.l2_vs_l1_cost",
    templateId: "chains.l2_vs_l1_cost",
    categoryId: "chains",
    name: "L2 vs L1 cost comparison",
    description: "Transaction cost savings on L2 compared to Ethereum mainnet over time.",
    tags: ["l2", "fees", "gas", "cost", "savings", "ethereum"],
    uiHint: "form",
    params: [
      { key: "l2_chain", label: "L2 chain", type: "chain", required: true, options: [
        { label: "Base", value: "base" },
        { label: "Optimism", value: "optimism" },
        { label: "Arbitrum", value: "arbitrum" },
      ], default: "base" },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
    ],
  },

  {
    id: "chains.cross_chain_comparison",
    templateId: "chains.cross_chain_comparison",
    categoryId: "chains",
    name: "Cross-chain activity comparison",
    description: "DAU, TPS, and fees side-by-side across multiple chains.",
    tags: ["compare", "chains", "multichain", "dau", "fees", "market share"],
    uiHint: "form",
    params: [
      { key: "chains", label: "Chains to compare", type: "chain[]", required: true, options: CHAIN_OPTIONS, default: ["ethereum", "base", "arbitrum"] },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
    ],
  },

  {
    id: "chains.l2_bridge_flows",
    templateId: "chains.l2_bridge_flows",
    categoryId: "chains",
    name: "L2 bridge deposits / withdrawals",
    description: "Official L2 bridge inflows and outflows — net capital movement.",
    tags: ["l2", "bridge", "deposit", "withdrawal", "canonical", "tvl"],
    uiHint: "form",
    params: [
      { key: "chain", label: "L2 chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "base" },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "90" },
    ],
  },

  {
    id: "chains.blob_usage",
    templateId: "chains.blob_usage",
    categoryId: "chains",
    name: "Blob usage (EIP-4844)",
    description: "Blob transaction volume, fees saved, and L2 blob submission breakdown since Dencun.",
    tags: ["blob", "eip-4844", "dencun", "l2", "data availability", "proto-danksharding"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: [
        { label: "Ethereum", value: "ethereum" },
      ], default: "ethereum" },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "90" },
    ],
  },

  {
    id: "chains.gas_price_history",
    templateId: "chains.gas_price_history",
    categoryId: "chains",
    name: "Gas price history & percentiles",
    description: "Base fee, priority fee percentiles, and gas price distribution over time.",
    tags: ["gas", "base fee", "priority fee", "gwei", "history", "eip-1559"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
      { key: "granularity", label: "Granularity", type: "select", required: true, options: GRANULARITY_OPTIONS, default: "hour" },
    ],
  },

  {
    id: "chains.market_share",
    templateId: "chains.market_share",
    categoryId: "chains",
    name: "Chain market share over time",
    description: "Relative share of total L2 transaction volume and TVL across the ecosystem.",
    tags: ["market share", "l2", "ecosystem", "tvl", "volume", "dominance"],
    uiHint: "form",
    params: [
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "180" },
      { key: "granularity", label: "Granularity", type: "select", required: true, options: GRANULARITY_OPTIONS, default: "week" },
    ],
  },

  {
    id: "chains.l2_user_overlap",
    templateId: "chains.l2_user_overlap",
    categoryId: "chains",
    name: "L2 ecosystem user overlap",
    description: "Wallets active on multiple L2s — measures multi-chain user behaviour.",
    tags: ["l2", "user overlap", "multi-chain", "wallets", "ecosystem", "retention"],
    uiHint: "form",
    params: [
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
    ],
  },

  {
    id: "chains.sequencer_decentralization",
    templateId: "chains.sequencer_decentralization",
    categoryId: "chains",
    name: "Sequencer decentralization tracker",
    description: "Tracks progress toward sequencer decentralization — forced inclusion, downtime events.",
    tags: ["sequencer", "decentralization", "l2", "censorship resistance", "forced inclusion"],
    uiHint: "form",
    params: [
      { key: "chain", label: "L2 chain", type: "chain", required: true, options: [
        { label: "Base", value: "base" },
        { label: "Optimism", value: "optimism" },
        { label: "Arbitrum", value: "arbitrum" },
      ], default: "base" },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "90" },
    ],
  },
];