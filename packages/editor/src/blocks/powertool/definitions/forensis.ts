import type { ToolDefinition } from "../types.js";
import {
  CHAIN_OPTIONS,
  TIME_RANGE_OPTIONS,
  HOP_OPTIONS,
  MIN_ETH_OPTIONS,
} from "../constants.js";

const TRACE_DIRECTION_OPTIONS = [
  { label: "Outflows (follow funds forward)", value: "out" },
  { label: "Inflows (trace funds backward)", value: "in" },
];

const DUST_THRESHOLD_OPTIONS = [
  { label: "< $0.01", value: "0.01" },
  { label: "< $0.10", value: "0.10" },
  { label: "< $1.00", value: "1.00" },
];

const LAUNCH_WINDOW_OPTIONS = [
  { label: "First 5 minutes", value: "5" },
  { label: "First 15 minutes", value: "15" },
  { label: "First 1 hour", value: "60" },
  { label: "First 24 hours", value: "1440" },
];

export const FORENSICS_DEFINITIONS: ToolDefinition[] = [
  {
    id: "forensics.fund_trace",
    templateId: "forensics.fund_trace",
    categoryId: "forensics",
    name: "Multi-hop fund trace",
    description: "Follow ETH and token flows N hops from a target address — primary forensics primitive.",
    tags: ["fund trace", "hop", "follow money", "forensics", "investigation", "trace"],
    uiHint: "graph-canvas",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "address", label: "Starting address", type: "address", required: true, placeholder: "0x..." },
      { key: "direction", label: "Direction", type: "select", required: true, options: TRACE_DIRECTION_OPTIONS, default: "out" },
      { key: "hops", label: "Hops depth", type: "select", required: true, options: HOP_OPTIONS, default: "3" },
      { key: "min_eth", label: "Min ETH value to follow", type: "select", required: true, options: MIN_ETH_OPTIONS, default: "0.01" },
      { key: "days", label: "Look-back window", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "365" },
    ],
  },

  {
    id: "forensics.mixer_detector",
    templateId: "forensics.mixer_detector",
    categoryId: "forensics",
    name: "Mixer interaction detector",
    description: "Detects deposits and withdrawals involving known mixer contracts (Tornado Cash etc.).",
    tags: ["mixer", "tornado cash", "privacy", "forensics", "sanctions", "OFAC"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "address", label: "Wallet address", type: "address", required: true, placeholder: "0x..." },
      { key: "days", label: "Look-back window", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "365" },
    ],
  },

  {
    id: "forensics.peel_chain",
    templateId: "forensics.peel_chain",
    categoryId: "forensics",
    name: "Peel chain detector",
    description: "Identifies peel chain patterns — sequential small transfers used to obscure fund origin.",
    tags: ["peel chain", "obfuscation", "forensics", "laundering", "sequential", "hops"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "address", label: "Starting address", type: "address", required: true, placeholder: "0x..." },
      { key: "days", label: "Look-back window", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "90" },
    ],
  },

  {
    id: "forensics.rug_pull",
    templateId: "forensics.rug_pull",
    categoryId: "forensics",
    name: "Rug pull pattern analysis",
    description: "Signals associated with rug pulls — LP removal spikes, deployer dumps, liquidity drain.",
    tags: ["rug pull", "scam", "token", "liquidity", "forensics", "deployer"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "token_address", label: "Token address", type: "token_address", required: true, placeholder: "0x..." },
    ],
  },

  {
    id: "forensics.sandwich_detector",
    templateId: "forensics.sandwich_detector",
    categoryId: "forensics",
    name: "Sandwich attack detector",
    description: "Detects sandwich attacks targeting a wallet or across a protocol.",
    tags: ["mev", "sandwich", "frontrun", "victim", "forensics", "slippage"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "victim_address", label: "Victim address (optional)", type: "address", required: false, placeholder: "0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
    ],
  },

  {
    id: "forensics.frontrunning",
    templateId: "forensics.frontrunning",
    categoryId: "forensics",
    name: "Frontrunning analysis",
    description: "Transactions that were frontrun — same token, same block, higher gas price.",
    tags: ["frontrunning", "mev", "bot", "gas", "priority", "forensics"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "wallet", label: "Victim address (optional)", type: "address", required: false, placeholder: "0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "7" },
    ],
  },

  {
    id: "forensics.token_launch_forensics",
    templateId: "forensics.token_launch_forensics",
    categoryId: "forensics",
    name: "Token launch forensics",
    description: "Sniper bots, bundled buys, and insider wallets at token launch.",
    tags: ["token launch", "sniper", "bundle", "bot", "insider", "forensics", "launch"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "token_address", label: "Token address", type: "token_address", required: true, placeholder: "0x..." },
      { key: "launch_window_minutes", label: "Launch window", type: "select", required: true, options: LAUNCH_WINDOW_OPTIONS, default: "60" },
    ],
  },

  {
    id: "forensics.address_clustering",
    templateId: "forensics.address_clustering",
    categoryId: "forensics",
    name: "Address clustering",
    description: "Groups addresses likely controlled by the same entity using common-input heuristic.",
    tags: ["clustering", "entity", "identity", "forensics", "common input", "wallet"],
    uiHint: "list-builder",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "seed_addresses", label: "Seed addresses", type: "address[]", required: true, placeholder: "0x..." },
      { key: "days", label: "Look-back window", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "365" },
    ],
  },

  {
    id: "forensics.dusting_detector",
    templateId: "forensics.dusting_detector",
    categoryId: "forensics",
    name: "Dusting attack detector",
    description: "Tiny token sends used to deanonymise wallets — detects dusting patterns.",
    tags: ["dusting", "attack", "deanonymise", "forensics", "privacy", "tracking"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "wallet", label: "Wallet address", type: "address", required: true, placeholder: "0x..." },
      { key: "max_usd", label: "Max dust value (USD)", type: "select", required: true, options: DUST_THRESHOLD_OPTIONS, default: "0.01" },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "365" },
    ],
  },

  {
    id: "forensics.sanctions_check",
    templateId: "forensics.sanctions_check",
    categoryId: "forensics",
    name: "OFAC / sanctions exposure check",
    description: "Direct and 1-hop indirect exposure to OFAC-sanctioned addresses.",
    tags: ["sanctions", "OFAC", "compliance", "SDN", "risk", "AML"],
    uiHint: "list-builder",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "addresses", label: "Addresses to check", type: "address[]", required: true, placeholder: "0x..." },
      { key: "days", label: "Look-back window", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "365" },
    ],
  },

  {
    id: "forensics.pig_butchering",
    templateId: "forensics.pig_butchering",
    categoryId: "forensics",
    name: "Pig butchering pattern detection",
    description: "Identifies common pig-butchering scam patterns — large repeated outflows to risky addresses.",
    tags: ["pig butchering", "scam", "fraud", "romance scam", "forensics", "victim"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "wallet", label: "Wallet to investigate", type: "address", required: true, placeholder: "0x..." },
      { key: "days", label: "Look-back window", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "365" },
    ],
  },

  {
    id: "forensics.wash_trading_cross",
    templateId: "forensics.wash_trading_cross",
    categoryId: "forensics",
    name: "Wash trading detector (cross-protocol)",
    description: "Detects coordinated wash trading across DEXes — same wallets cycling volume.",
    tags: ["wash trading", "manipulation", "dex", "volume", "forensics", "coordinated"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "token_address", label: "Token address", type: "token_address", required: true, placeholder: "0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "7" },
    ],
  },
];