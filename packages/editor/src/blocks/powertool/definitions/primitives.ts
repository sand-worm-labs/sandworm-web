import type { ToolDefinition } from "../types.js";
import {
  CHAIN_OPTIONS,
  TIME_RANGE_OPTIONS,
  TOP_N_OPTIONS,
} from "../constants.js";

export const PRIMITIVE_DEFINITIONS: ToolDefinition[] = [
  {
    id: "primitives.erc20_transfers",
    templateId: "primitives.erc20_transfers",
    categoryId: "primitives",
    name: "ERC20 transfer history",
    description: "Full transfer log for any ERC20 token with optional wallet filter.",
    tags: ["erc20", "transfers", "token", "history", "send", "receive"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "token_address", label: "Token address", type: "token_address", required: true, placeholder: "0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
      { key: "wallet", label: "Filter by wallet (optional)", type: "address", required: false, placeholder: "0x..." },
      { key: "limit", label: "Row limit", type: "select", required: true, options: TOP_N_OPTIONS, default: "100" },
    ],
  },

  {
    id: "primitives.token_holders",
    templateId: "primitives.token_holders",
    categoryId: "primitives",
    name: "Token holder distribution",
    description: "Top holders for any ERC20 token with supply concentration metrics.",
    tags: ["erc20", "holders", "distribution", "whale", "concentration", "supply"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "token_address", label: "Token address", type: "token_address", required: true, placeholder: "0x..." },
      { key: "top_n", label: "Show top N holders", type: "select", required: true, options: TOP_N_OPTIONS, default: "100" },
    ],
  },

  {
    id: "primitives.token_approvals",
    templateId: "primitives.token_approvals",
    categoryId: "primitives",
    name: "Token approval analysis",
    description: "All ERC20 approvals for a token — surfaces unlimited approvals and high-risk spenders.",
    tags: ["erc20", "approvals", "allowance", "spender", "security", "risk"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "token_address", label: "Token address", type: "token_address", required: true, placeholder: "0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
    ],
  },

  {
    id: "primitives.wallet_balance",
    templateId: "primitives.wallet_balance",
    categoryId: "primitives",
    name: "Wallet token balance over time",
    description: "Daily running balance of any ERC20 token for a given wallet.",
    tags: ["wallet", "balance", "history", "erc20", "portfolio", "daily"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "wallet", label: "Wallet address", type: "address", required: true, placeholder: "0x..." },
      { key: "token_address", label: "Token address", type: "token_address", required: true, placeholder: "0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "90" },
    ],
  },

  {
    id: "primitives.native_flows",
    templateId: "primitives.native_flows",
    categoryId: "primitives",
    name: "Native token flows",
    description: "ETH / native token inflows and outflows for a wallet, bucketed by day.",
    tags: ["eth", "native", "flows", "wallet", "transfers", "ether"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "wallet", label: "Wallet address", type: "address", required: true, placeholder: "0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
    ],
  },

  {
    id: "primitives.gas_analysis",
    templateId: "primitives.gas_analysis",
    categoryId: "primitives",
    name: "Gas usage analysis",
    description: "Gas spent breakdown for a wallet — daily totals, average gas price, fees in ETH.",
    tags: ["gas", "fees", "wallet", "spending", "gwei", "transactions"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "wallet", label: "Wallet address", type: "address", required: true, placeholder: "0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
    ],
  },

  {
    id: "primitives.tx_history",
    templateId: "primitives.tx_history",
    categoryId: "primitives",
    name: "Transaction history",
    description: "Full transaction log for a wallet — sends, receives, contract calls, success/fail.",
    tags: ["transactions", "history", "wallet", "activity", "calls"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "wallet", label: "Wallet address", type: "address", required: true, placeholder: "0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
      { key: "limit", label: "Row limit", type: "select", required: true, options: TOP_N_OPTIONS, default: "100" },
    ],
  },

  {
    id: "primitives.internal_txs",
    templateId: "primitives.internal_txs",
    categoryId: "primitives",
    name: "Internal transactions",
    description: "Internal ETH transfers (call traces) — reveals contract-to-contract value flows.",
    tags: ["internal", "traces", "eth", "contract", "calls", "value"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "wallet", label: "Wallet address", type: "address", required: true, placeholder: "0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
      { key: "limit", label: "Row limit", type: "select", required: true, options: TOP_N_OPTIONS, default: "100" },
    ],
  },

  {
    id: "primitives.contract_deployments",
    templateId: "primitives.contract_deployments",
    categoryId: "primitives",
    name: "Contract deployments",
    description: "Contracts deployed by a wallet, or all deployments on a chain in a time window.",
    tags: ["deploy", "contract", "creation", "factory", "builder"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "deployer", label: "Deployer address (optional)", type: "address", required: false, placeholder: "0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
      { key: "limit", label: "Row limit", type: "select", required: true, options: TOP_N_OPTIONS, default: "100" },
    ],
  },

  {
    id: "primitives.erc721_transfers",
    templateId: "primitives.erc721_transfers",
    categoryId: "primitives",
    name: "ERC721 transfer history",
    description: "All transfers for an NFT collection with optional wallet filter.",
    tags: ["nft", "erc721", "transfers", "collection", "history", "token_id"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "contract_address", label: "Collection address", type: "address", required: true, placeholder: "0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
      { key: "wallet", label: "Filter by wallet (optional)", type: "address", required: false, placeholder: "0x..." },
      { key: "limit", label: "Row limit", type: "select", required: true, options: TOP_N_OPTIONS, default: "100" },
    ],
  },

  {
    id: "primitives.erc1155_transfers",
    templateId: "primitives.erc1155_transfers",
    categoryId: "primitives",
    name: "ERC1155 transfer history",
    description: "Multi-token (ERC1155) transfer log including token ID and amount.",
    tags: ["erc1155", "multitoken", "semi-fungible", "transfers", "gaming"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "contract_address", label: "Contract address", type: "address", required: true, placeholder: "0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
      { key: "limit", label: "Row limit", type: "select", required: true, options: TOP_N_OPTIONS, default: "100" },
    ],
  },

  {
    id: "primitives.event_decoder",
    templateId: "primitives.event_decoder",
    categoryId: "primitives",
    name: "Event log decoder",
    description: "Raw decoded event logs for any contract filtered by event name.",
    tags: ["events", "logs", "decode", "abi", "contract", "topics"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "contract_address", label: "Contract address", type: "address", required: true, placeholder: "0x..." },
      { key: "event_name", label: "Event name", type: "text", required: true, placeholder: "e.g. Transfer, Swap, Attested" },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
      { key: "limit", label: "Row limit", type: "select", required: true, options: TOP_N_OPTIONS, default: "100" },
    ],
  },

  {
    id: "primitives.calldata_decoder",
    templateId: "primitives.calldata_decoder",
    categoryId: "primitives",
    name: "Calldata decoder",
    description: "Decoded function calls to a contract filtered by function name.",
    tags: ["calldata", "function", "decode", "calls", "input"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "contract_address", label: "Contract address", type: "address", required: true, placeholder: "0x..." },
      { key: "function_name", label: "Function name", type: "text", required: true, placeholder: "e.g. transfer, swap, execute" },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
      { key: "limit", label: "Row limit", type: "select", required: true, options: TOP_N_OPTIONS, default: "100" },
    ],
  },

  {
    id: "primitives.nonce_tracker",
    templateId: "primitives.nonce_tracker",
    categoryId: "primitives",
    name: "Account nonce tracker",
    description: "Cumulative transaction count over time for a wallet.",
    tags: ["nonce", "tx count", "wallet", "activity", "age"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "wallet", label: "Wallet address", type: "address", required: true, placeholder: "0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "90" },
    ],
  },

  {
    id: "primitives.block_activity",
    templateId: "primitives.block_activity",
    categoryId: "primitives",
    name: "Block activity metrics",
    description: "Hourly chain stats — txs per block, gas utilisation, base fee.",
    tags: ["blocks", "activity", "chain", "gas", "utilization", "tps", "base_fee"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "7" },
    ],
  },
];