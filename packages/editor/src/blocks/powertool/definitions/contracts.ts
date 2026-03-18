import type { ToolDefinition } from "../types.js";
import { CHAIN_OPTIONS, TIME_RANGE_OPTIONS, TOP_N_OPTIONS } from "../constants.js";

export const CONTRACT_DEFINITIONS: ToolDefinition[] = [
  {
    id: "contracts.event_volume",
    templateId: "contracts.event_volume",
    categoryId: "contracts",
    name: "Contract event volume",
    description: "Daily event counts for any contract event by name — primary custom-protocol analytics tool.",
    tags: ["contract", "events", "volume", "custom", "protocol", "builder"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "contract_address", label: "Contract address", type: "address", required: true, placeholder: "0x..." },
      { key: "event_name", label: "Event name", type: "text", required: true, placeholder: "e.g. Transfer, Swap, QuestCompleted" },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
    ],
  },

  {
    id: "contracts.unique_wallets",
    templateId: "contracts.unique_wallets",
    categoryId: "contracts",
    name: "Unique wallet interactions",
    description: "Daily unique wallets calling a contract — core adoption metric.",
    tags: ["contract", "users", "wallets", "adoption", "dau", "interactions"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "contract_address", label: "Contract address", type: "address", required: true, placeholder: "0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
    ],
  },

  {
    id: "contracts.revenue",
    templateId: "contracts.revenue",
    categoryId: "contracts",
    name: "Contract revenue",
    description: "ETH and token inflows to a contract — protocol revenue tracking.",
    tags: ["contract", "revenue", "fees", "income", "protocol", "ETH"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "contract_address", label: "Contract address", type: "address", required: true, placeholder: "0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
    ],
  },

  {
    id: "contracts.function_breakdown",
    templateId: "contracts.function_breakdown",
    categoryId: "contracts",
    name: "Function call breakdown",
    description: "Which functions are called most frequently — usage distribution for any contract.",
    tags: ["contract", "functions", "calls", "usage", "distribution", "abi"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "contract_address", label: "Contract address", type: "address", required: true, placeholder: "0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
    ],
  },

  {
    id: "contracts.multi_contract",
    templateId: "contracts.multi_contract",
    categoryId: "contracts",
    name: "Multi-contract analytics",
    description: "Unified metrics across multiple contracts — the P2E / quest contract use case.",
    tags: ["contract", "multi", "compare", "protocol", "quest", "gaming", "custom"],
    uiHint: "list-builder",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "contract_addresses", label: "Contract addresses", type: "address[]", required: true, placeholder: "0x..." },
      { key: "event_name", label: "Event name to track", type: "text", required: true, placeholder: "e.g. QuestCompleted, Transfer" },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
    ],
  },

  {
    id: "contracts.interaction_graph",
    templateId: "contracts.interaction_graph",
    categoryId: "contracts",
    name: "Contract interaction graph",
    description: "Which contracts call each other — maps the dependency graph of a protocol.",
    tags: ["contract", "graph", "dependencies", "calls", "protocol", "architecture"],
    uiHint: "graph-canvas",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "contract_address", label: "Root contract address", type: "address", required: true, placeholder: "0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
      { key: "top_n", label: "Top N interacting contracts", type: "select", required: true, options: TOP_N_OPTIONS, default: "25" },
    ],
  },

  {
    id: "contracts.tvl",
    templateId: "contracts.tvl",
    categoryId: "contracts",
    name: "Contract TVL tracker",
    description: "ETH and ERC20 token balances held by a contract over time.",
    tags: ["contract", "tvl", "balance", "locked", "protocol", "treasury"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "contract_address", label: "Contract address", type: "address", required: true, placeholder: "0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "90" },
    ],
  },

  {
    id: "contracts.error_analysis",
    templateId: "contracts.error_analysis",
    categoryId: "contracts",
    name: "Error / revert analysis",
    description: "Failed transactions to a contract — revert reasons, frequency, and affected callers.",
    tags: ["contract", "error", "revert", "failed", "debug", "health"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "contract_address", label: "Contract address", type: "address", required: true, placeholder: "0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "7" },
    ],
  },
];