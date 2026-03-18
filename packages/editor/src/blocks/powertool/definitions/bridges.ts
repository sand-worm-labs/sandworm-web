import type { ToolDefinition } from "../types.js";
import {
  CHAIN_OPTIONS,
  TIME_RANGE_OPTIONS,
  BRIDGE_OPTIONS,
} from "../constants.js";

export const BRIDGE_DEFINITIONS: ToolDefinition[] = [
  {
    id: "bridges.volume",
    templateId: "bridges.volume",
    categoryId: "bridges",
    name: "Bridge volume by token",
    description: "Daily cross-chain bridge volume broken down by token and protocol.",
    tags: ["bridge", "volume", "cross-chain", "token", "flows"],
    uiHint: "form",
    params: [
      { key: "source_chain", label: "Source chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "dest_chain", label: "Destination chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "base" },
      { key: "protocol", label: "Bridge protocol", type: "select", required: true, options: BRIDGE_OPTIONS, default: "all" },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
    ],
  },

  {
    id: "bridges.user_flows",
    templateId: "bridges.user_flows",
    categoryId: "bridges",
    name: "Bridge user flows",
    description: "Where users are bridging to and from — chain-level net flow breakdown.",
    tags: ["bridge", "user flows", "chain", "cross-chain", "origin", "destination"],
    uiHint: "form",
    params: [
      { key: "protocol", label: "Bridge protocol", type: "select", required: true, options: BRIDGE_OPTIONS, default: "all" },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
    ],
  },

  {
    id: "bridges.cross_chain_wallet",
    templateId: "bridges.cross_chain_wallet",
    categoryId: "bridges",
    name: "Cross-chain wallet tracker",
    description: "All bridge activity for a wallet across all supported chains.",
    tags: ["bridge", "wallet", "cross-chain", "multi-chain", "activity"],
    uiHint: "form",
    params: [
      { key: "wallet", label: "Wallet address", type: "address", required: true, placeholder: "0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "90" },
    ],
  },

  {
    id: "bridges.fees",
    templateId: "bridges.fees",
    categoryId: "bridges",
    name: "Bridge fee analysis",
    description: "Protocol fees, relayer fees, and effective fee rate on bridges.",
    tags: ["bridge", "fees", "cost", "relayer", "gas", "protocol"],
    uiHint: "form",
    params: [
      { key: "protocol", label: "Bridge protocol", type: "select", required: true, options: BRIDGE_OPTIONS, default: "across" },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
    ],
  },

  {
    id: "bridges.tvl",
    templateId: "bridges.tvl",
    categoryId: "bridges",
    name: "Bridge TVL by protocol",
    description: "Assets locked in bridge contracts — a proxy for bridge security risk.",
    tags: ["bridge", "tvl", "locked", "security", "protocol"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "protocol", label: "Bridge protocol", type: "select", required: true, options: BRIDGE_OPTIONS, default: "all" },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "90" },
    ],
  },

  {
    id: "bridges.comparison",
    templateId: "bridges.comparison",
    categoryId: "bridges",
    name: "Bridge protocol comparison",
    description: "Side-by-side volume, users, and fees for all bridge protocols.",
    tags: ["bridge", "compare", "protocol", "volume", "users", "fees"],
    uiHint: "form",
    params: [
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
    ],
  },

  {
    id: "bridges.latency",
    templateId: "bridges.latency",
    categoryId: "bridges",
    name: "Bridge settlement latency",
    description: "Time from source transaction to destination confirmation by protocol.",
    tags: ["bridge", "latency", "settlement", "speed", "time", "ux"],
    uiHint: "form",
    params: [
      { key: "protocol", label: "Bridge protocol", type: "select", required: true, options: BRIDGE_OPTIONS, default: "across" },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
    ],
  },
];