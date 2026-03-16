import type { ToolDefinition } from "../types.js";
import {
  CHAIN_OPTIONS,
  TIME_RANGE_OPTIONS,
  TOP_N_OPTIONS,
  DEX_OPTIONS,
  LENDING_OPTIONS,
  PERP_OPTIONS,
} from "../constants.js";

const GRANULARITY_OPTIONS = [
  { label: "Hourly", value: "hour" },
  { label: "Daily", value: "day" },
];

const FLASHLOAN_PROTOCOL_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Aave V3", value: "aave_v3" },
  { label: "Aave V2", value: "aave_v2" },
  { label: "Balancer", value: "balancer" },
  { label: "dYdX", value: "dydx" },
];

const ALL_PROTOCOL_OPTIONS = [
  ...DEX_OPTIONS.slice(1),
  ...LENDING_OPTIONS,
];

export const DEFI_DEFINITIONS: ToolDefinition[] = [
  {
    id: "defi.dex_volume",
    templateId: "defi.dex_volume",
    categoryId: "defi",
    name: "DEX swap volume",
    description: "Daily trading volume and swap count for a token across DEXes.",
    tags: ["dex", "swap", "volume", "trading", "uniswap", "token"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "token_address", label: "Token address", type: "token_address", required: true, placeholder: "0x..." },
      { key: "protocol", label: "DEX protocol", type: "select", required: true, options: DEX_OPTIONS, default: "all" },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
    ],
  },

  {
    id: "defi.lp_positions",
    templateId: "defi.lp_positions",
    categoryId: "defi",
    name: "LP position tracker",
    description: "Active and closed liquidity positions for a wallet on a given protocol.",
    tags: ["liquidity", "lp", "uniswap", "pool", "position", "amm"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "wallet", label: "Wallet address", type: "address", required: true, placeholder: "0x..." },
      { key: "protocol", label: "DEX protocol", type: "select", required: true, options: DEX_OPTIONS, default: "uniswap_v3" },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "90" },
    ],
  },

  {
    id: "defi.pool_tvl",
    templateId: "defi.pool_tvl",
    categoryId: "defi",
    name: "Pool TVL history",
    description: "Total value locked in a specific liquidity pool over time.",
    tags: ["tvl", "pool", "liquidity", "dex", "history"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "pool_address", label: "Pool address", type: "address", required: true, placeholder: "0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "90" },
    ],
  },

  {
    id: "defi.token_price_dex",
    templateId: "defi.token_price_dex",
    categoryId: "defi",
    name: "Token price on DEX (TWAP)",
    description: "Time-weighted average price for a token derived from DEX swap data.",
    tags: ["price", "twap", "dex", "token", "ohlc", "market"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "token_address", label: "Token address", type: "token_address", required: true, placeholder: "0x..." },
      { key: "granularity", label: "Granularity", type: "select", required: true, options: GRANULARITY_OPTIONS, default: "day" },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
    ],
  },

  {
    id: "defi.lending_positions",
    templateId: "defi.lending_positions",
    categoryId: "defi",
    name: "Lending positions",
    description: "Open borrows and supplies for a wallet on Aave, Compound, Morpho, or Spark.",
    tags: ["lending", "borrow", "supply", "aave", "compound", "morpho", "health factor"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "wallet", label: "Wallet address", type: "address", required: true, placeholder: "0x..." },
      { key: "protocol", label: "Protocol", type: "select", required: true, options: LENDING_OPTIONS, default: "aave_v3" },
    ],
  },

  {
    id: "defi.liquidations",
    templateId: "defi.liquidations",
    categoryId: "defi",
    name: "Liquidation history",
    description: "All liquidation events on a lending protocol — volume, frequency, collateral type.",
    tags: ["liquidation", "lending", "aave", "compound", "risk", "collateral"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "protocol", label: "Protocol", type: "select", required: true, options: LENDING_OPTIONS, default: "aave_v3" },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
    ],
  },

  {
    id: "defi.protocol_revenue",
    templateId: "defi.protocol_revenue",
    categoryId: "defi",
    name: "Protocol revenue (fees)",
    description: "Daily fees collected by a DEX protocol — volume and effective fee rate.",
    tags: ["revenue", "fees", "protocol", "dex", "income", "treasury"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "protocol", label: "Protocol", type: "select", required: true, options: DEX_OPTIONS, default: "uniswap_v3" },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
    ],
  },

  {
    id: "defi.protocol_dau",
    templateId: "defi.protocol_dau",
    categoryId: "defi",
    name: "Protocol DAU / MAU",
    description: "Daily and monthly unique active users for any DEX or lending protocol.",
    tags: ["dau", "mau", "users", "protocol", "growth", "retention"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "protocol", label: "Protocol", type: "select", required: true, options: DEX_OPTIONS, default: "uniswap_v3" },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "90" },
    ],
  },

  {
    id: "defi.protocol_tvl",
    templateId: "defi.protocol_tvl",
    categoryId: "defi",
    name: "Protocol TVL history",
    description: "Total value locked in a protocol over time.",
    tags: ["tvl", "protocol", "locked", "defi", "growth"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "protocol", label: "Protocol", type: "select", required: true, options: ALL_PROTOCOL_OPTIONS, default: "uniswap_v3" },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "90" },
    ],
  },

  {
    id: "defi.stablecoin_peg",
    templateId: "defi.stablecoin_peg",
    categoryId: "defi",
    name: "Stablecoin peg deviation",
    description: "Tracks how far a stablecoin has deviated from its $1 peg over time.",
    tags: ["stablecoin", "peg", "depeg", "usdc", "usdt", "dai", "risk"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "token_address", label: "Stablecoin address", type: "token_address", required: true, placeholder: "0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "90" },
    ],
  },

  {
    id: "defi.perps_oi",
    templateId: "defi.perps_oi",
    categoryId: "defi",
    name: "Perps open interest & funding",
    description: "Open interest, funding rates, and volume for perpetual futures protocols.",
    tags: ["perps", "perpetuals", "open interest", "funding rate", "gmx", "hyperliquid"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "arbitrum" },
      { key: "protocol", label: "Protocol", type: "select", required: true, options: PERP_OPTIONS, default: "gmx_v2" },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
    ],
  },

  {
    id: "defi.governance",
    templateId: "defi.governance",
    categoryId: "defi",
    name: "Governance participation",
    description: "Proposal voting activity, voter turnout, and outcomes for a DAO.",
    tags: ["governance", "dao", "voting", "proposal", "quorum", "participation"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "governor_address", label: "Governor contract", type: "address", required: true, placeholder: "0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "365" },
    ],
  },

  {
    id: "defi.treasury",
    templateId: "defi.treasury",
    categoryId: "defi",
    name: "Treasury tracker",
    description: "Token balances and historical USD value for a DAO treasury wallet.",
    tags: ["treasury", "dao", "funds", "multisig", "holdings", "runway"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "treasury_address", label: "Treasury address", type: "address", required: true, placeholder: "0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "180" },
    ],
  },

  {
    id: "defi.mev_arb",
    templateId: "defi.mev_arb",
    categoryId: "defi",
    name: "MEV — arbitrage profits",
    description: "On-chain arbitrage extracted by MEV bots — top searchers and daily volume.",
    tags: ["mev", "arbitrage", "arb", "bot", "profit", "flashbots"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "7" },
      { key: "top_n", label: "Top N bots", type: "select", required: true, options: TOP_N_OPTIONS, default: "25" },
    ],
  },

  {
    id: "defi.mev_sandwich",
    templateId: "defi.mev_sandwich",
    categoryId: "defi",
    name: "MEV — sandwich attacks",
    description: "Sandwich attack events — victim transactions, attacker addresses, and profit.",
    tags: ["mev", "sandwich", "frontrun", "backrun", "victim", "attack"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "victim_address", label: "Filter by victim (optional)", type: "address", required: false, placeholder: "0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "7" },
    ],
  },

  {
    id: "defi.flashloans",
    templateId: "defi.flashloans",
    categoryId: "defi",
    name: "Flashloan usage",
    description: "Flashloan events — borrower, asset, amount, fee, and protocol.",
    tags: ["flashloan", "flash", "aave", "dydx", "balancer", "arbitrage", "liquidation"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "protocol", label: "Protocol", type: "select", required: true, options: FLASHLOAN_PROTOCOL_OPTIONS, default: "all" },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "7" },
    ],
  },

  {
    id: "defi.user_retention",
    templateId: "defi.user_retention",
    categoryId: "defi",
    name: "Protocol user retention cohorts",
    description: "Weekly cohort retention — what % of first-time users return each week.",
    tags: ["retention", "cohort", "protocol", "users", "churn", "growth"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "protocol", label: "Protocol", type: "select", required: true, options: DEX_OPTIONS, default: "uniswap_v3" },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "180" },
    ],
  },

  {
    id: "defi.token_vesting",
    templateId: "defi.token_vesting",
    categoryId: "defi",
    name: "Token vesting & unlock schedule",
    description: "Upcoming and historical token unlock events from vesting contracts.",
    tags: ["vesting", "unlock", "token", "schedule", "supply", "cliff"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "token_address", label: "Token address", type: "token_address", required: true, placeholder: "0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "365" },
    ],
  },

  {
    id: "defi.yield_farming",
    templateId: "defi.yield_farming",
    categoryId: "defi",
    name: "Yield farming rewards",
    description: "Reward token emissions and APY history for a yield farming pool.",
    tags: ["yield", "farming", "rewards", "apy", "emissions", "pool"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "pool_address", label: "Pool / farm address", type: "address", required: true, placeholder: "0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "90" },
    ],
  },

  {
    id: "defi.protocol_comparison",
    templateId: "defi.protocol_comparison",
    categoryId: "defi",
    name: "Protocol comparison",
    description: "Side-by-side volume, users, and fees across multiple DEX protocols.",
    tags: ["compare", "protocol", "dex", "volume", "fees", "market share"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
    ],
  },
];