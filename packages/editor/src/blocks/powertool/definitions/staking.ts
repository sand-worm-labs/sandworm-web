import type { ToolDefinition } from "../types.js";
import {
  CHAIN_OPTIONS,
  TIME_RANGE_OPTIONS,
  LIQUID_STAKING_OPTIONS,
  ETHEREUM_ONLY,
} from "../constants.js";

export const STAKING_DEFINITIONS: ToolDefinition[] = [
  {
    id: "staking.validator_performance",
    templateId: "staking.validator_performance",
    categoryId: "staking",
    name: "Validator performance",
    description: "Attestation effectiveness, missed slots, and earnings for a validator.",
    tags: ["validator", "staking", "ethereum", "attestation", "performance", "beacon"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: ETHEREUM_ONLY, default: "ethereum" },
      { key: "validator_index", label: "Validator index or pubkey", type: "text", required: true, placeholder: "e.g. 123456 or 0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
    ],
  },

  {
    id: "staking.flows",
    templateId: "staking.flows",
    categoryId: "staking",
    name: "Staking deposit / withdrawal flows",
    description: "Daily ETH staking deposits and withdrawals on the beacon chain.",
    tags: ["staking", "deposit", "withdrawal", "eth", "beacon", "flows"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: ETHEREUM_ONLY, default: "ethereum" },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "90" },
    ],
  },

  {
    id: "staking.rewards",
    templateId: "staking.rewards",
    categoryId: "staking",
    name: "Staking rewards tracker",
    description: "Cumulative staking rewards earned by a withdrawal address over time.",
    tags: ["staking", "rewards", "yield", "validator", "income", "apr"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: ETHEREUM_ONLY, default: "ethereum" },
      { key: "withdrawal_address", label: "Withdrawal address", type: "address", required: true, placeholder: "0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "90" },
    ],
  },

  {
    id: "staking.validator_queue",
    templateId: "staking.validator_queue",
    categoryId: "staking",
    name: "Validator queue depth",
    description: "Activation and exit queue depth for the Ethereum beacon chain.",
    tags: ["validator", "queue", "activation", "exit", "beacon", "wait time"],
    uiHint: "form",
    params: [
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
    ],
  },

  {
    id: "staking.liquid_staking_tvl",
    templateId: "staking.liquid_staking_tvl",
    categoryId: "staking",
    name: "Liquid staking TVL",
    description: "TVL and market share over time for liquid staking protocols.",
    tags: ["liquid staking", "lido", "rocketpool", "cbeth", "tvl", "steth"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "protocol", label: "Protocol", type: "select", required: true, options: LIQUID_STAKING_OPTIONS, default: "all" },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "90" },
    ],
  },

  {
    id: "staking.restaking",
    templateId: "staking.restaking",
    categoryId: "staking",
    name: "Restaking analysis (EigenLayer)",
    description: "Restaking deposits, AVS selection, and operator delegation on EigenLayer.",
    tags: ["restaking", "eigenlayer", "avs", "operator", "lrt", "points"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: ETHEREUM_ONLY, default: "ethereum" },
      { key: "avs_address", label: "AVS address (optional — leave empty for all)", type: "address", required: false, placeholder: "0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "90" },
    ],
  },

  {
    id: "staking.slash_events",
    templateId: "staking.slash_events",
    categoryId: "staking",
    name: "Slash events",
    description: "All validator slashing events with penalty amount and cause.",
    tags: ["slash", "penalty", "validator", "beacon", "double vote", "surround"],
    uiHint: "form",
    params: [
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "365" },
    ],
  },

  {
    id: "staking.delegation",
    templateId: "staking.delegation",
    categoryId: "staking",
    name: "Delegation tracker",
    description: "Delegation and re-delegation events for a delegator or operator address.",
    tags: ["delegation", "staking", "nominator", "operator", "eigenlayer"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "address", label: "Delegator or operator address", type: "address", required: true, placeholder: "0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "90" },
    ],
  },
];