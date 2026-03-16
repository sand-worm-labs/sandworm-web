import type { ToolDefinition } from "../types.js";
import {
  CHAIN_OPTIONS,
  TIME_RANGE_OPTIONS,
  TOP_N_OPTIONS,
  HOP_OPTIONS,
  MIN_ETH_OPTIONS,
  MIN_USD_OPTIONS,
} from "../constants.js";

export const WALLET_DEFINITIONS: ToolDefinition[] = [
  {
    id: "wallet.pnl",
    templateId: "wallet.pnl",
    categoryId: "wallet",
    name: "Wallet PnL tracker",
    description: "Realised profit/loss for a wallet across all ERC20 tokens in a time window.",
    tags: ["pnl", "profit", "loss", "wallet", "trading", "portfolio"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "wallet", label: "Wallet address", type: "address", required: true, placeholder: "0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
    ],
  },

  {
    id: "wallet.portfolio_snapshot",
    templateId: "wallet.portfolio_snapshot",
    categoryId: "wallet",
    name: "Portfolio snapshot",
    description: "Current ERC20 token holdings for a wallet with USD values.",
    tags: ["portfolio", "holdings", "balance", "wallet", "tokens", "usd"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "wallet", label: "Wallet address", type: "address", required: true, placeholder: "0x..." },
    ],
  },

  {
    id: "wallet.activity_timeline",
    templateId: "wallet.activity_timeline",
    categoryId: "wallet",
    name: "Activity timeline",
    description: "Daily transaction activity for a wallet — identifies active periods and dormancy.",
    tags: ["activity", "timeline", "wallet", "history", "daily", "behaviour"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "wallet", label: "Wallet address", type: "address", required: true, placeholder: "0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "365" },
    ],
  },

  {
    id: "wallet.fund_flow_trace",
    templateId: "wallet.fund_flow_trace",
    categoryId: "wallet",
    name: "Fund flow trace",
    description: "Multi-hop ETH and token flows from an address — follow money N hops deep.",
    tags: ["fund flow", "trace", "hops", "follow", "money", "forensics"],
    uiHint: "graph-canvas",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "wallet", label: "Starting address", type: "address", required: true, placeholder: "0x..." },
      { key: "hops", label: "Hops depth", type: "select", required: true, options: HOP_OPTIONS, default: "2" },
      { key: "min_eth", label: "Min transfer value (ETH)", type: "select", required: true, options: MIN_ETH_OPTIONS, default: "0.1" },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
    ],
  },

  {
    id: "wallet.common_funder",
    templateId: "wallet.common_funder",
    categoryId: "wallet",
    name: "Common funder / clustering",
    description: "Finds wallets that funded a set of addresses — common-input heuristic for clustering.",
    tags: ["clustering", "funder", "common input", "identity", "forensics", "link"],
    uiHint: "list-builder",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "wallets", label: "Target addresses", type: "address[]", required: true, placeholder: "0x..." },
      { key: "days", label: "Look-back window", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "365" },
    ],
  },

  {
    id: "wallet.wallet_age",
    templateId: "wallet.wallet_age",
    categoryId: "wallet",
    name: "Wallet age & first activity",
    description: "First transaction date, wallet age in days, and first counterparty.",
    tags: ["age", "first tx", "wallet", "inception", "history", "sybil"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "wallet", label: "Wallet address", type: "address", required: true, placeholder: "0x..." },
    ],
  },

  {
    id: "wallet.counterparty_frequency",
    templateId: "wallet.counterparty_frequency",
    categoryId: "wallet",
    name: "Counterparty frequency",
    description: "Most frequent addresses a wallet interacts with — surfaces key relationships.",
    tags: ["counterparty", "frequency", "interactions", "wallet", "relationships"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "wallet", label: "Wallet address", type: "address", required: true, placeholder: "0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "90" },
      { key: "top_n", label: "Top N counterparties", type: "select", required: true, options: TOP_N_OPTIONS, default: "25" },
    ],
  },

  {
    id: "wallet.cex_interactions",
    templateId: "wallet.cex_interactions",
    categoryId: "wallet",
    name: "CEX interaction detector",
    description: "Deposits and withdrawals to/from known centralised exchange hot wallets.",
    tags: ["cex", "exchange", "binance", "coinbase", "kraken", "deposit", "withdrawal"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "wallet", label: "Wallet address", type: "address", required: true, placeholder: "0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "90" },
    ],
  },

  {
    id: "wallet.smart_money",
    templateId: "wallet.smart_money",
    categoryId: "wallet",
    name: "Smart money tracker",
    description: "Top profitable wallets trading a token — find who's consistently early.",
    tags: ["smart money", "alpha", "whale", "early", "profitable", "token"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "token_address", label: "Token address", type: "token_address", required: true, placeholder: "0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
      { key: "top_n", label: "Top N wallets", type: "select", required: true, options: TOP_N_OPTIONS, default: "25" },
    ],
  },

  {
    id: "wallet.whale_watcher",
    templateId: "wallet.whale_watcher",
    categoryId: "wallet",
    name: "Whale watcher",
    description: "Large token transfers above a USD threshold — whale movement for any token.",
    tags: ["whale", "large transfers", "token", "alert", "movement"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "token_address", label: "Token address", type: "token_address", required: true, placeholder: "0x..." },
      { key: "min_usd", label: "Min transfer value", type: "select", required: true, options: MIN_USD_OPTIONS, default: "100000" },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "7" },
    ],
  },

  {
    id: "wallet.multi_wallet_compare",
    templateId: "wallet.multi_wallet_compare",
    categoryId: "wallet",
    name: "Multi-wallet comparison",
    description: "Side-by-side activity metrics for a set of wallets — cohort and team analysis.",
    tags: ["compare", "multiple wallets", "cohort", "side by side", "activity"],
    uiHint: "list-builder",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "wallets", label: "Wallet addresses", type: "address[]", required: true, placeholder: "0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
    ],
  },

  {
    id: "wallet.realized_unrealized_gains",
    templateId: "wallet.realized_unrealized_gains",
    categoryId: "wallet",
    name: "Realised vs unrealised gains",
    description: "Token-level cost basis vs current value — which positions are in profit.",
    tags: ["gains", "pnl", "cost basis", "unrealized", "profit", "loss", "portfolio"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "wallet", label: "Wallet address", type: "address", required: true, placeholder: "0x..." },
    ],
  },
];