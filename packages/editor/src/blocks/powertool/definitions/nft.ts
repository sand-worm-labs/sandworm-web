import type { ToolDefinition } from "../types.js";
import {
  CHAIN_OPTIONS,
  TIME_RANGE_OPTIONS,
  TOP_N_OPTIONS,
  NFT_MARKETPLACE_OPTIONS,
} from "../constants.js";

const DUST_THRESHOLD_OPTIONS = [
  { label: "< $0.01", value: "0.01" },
  { label: "< $0.10", value: "0.10" },
  { label: "< $1.00", value: "1.00" },
];

export const NFT_DEFINITIONS: ToolDefinition[] = [
  {
    id: "nft.collection_volume",
    templateId: "nft.collection_volume",
    categoryId: "nft",
    name: "Collection sales volume",
    description: "Daily sales volume, floor price, and trade count for an NFT collection.",
    tags: ["nft", "volume", "sales", "collection", "floor price", "trades"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "contract_address", label: "Collection address", type: "address", required: true, placeholder: "0x..." },
      { key: "marketplace", label: "Marketplace", type: "select", required: true, options: NFT_MARKETPLACE_OPTIONS, default: "all" },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
    ],
  },

  {
    id: "nft.holder_distribution",
    templateId: "nft.holder_distribution",
    categoryId: "nft",
    name: "NFT holder distribution",
    description: "Current holder count, whale concentration, and bucket breakdown.",
    tags: ["nft", "holders", "distribution", "whale", "concentration", "ownership"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "contract_address", label: "Collection address", type: "address", required: true, placeholder: "0x..." },
    ],
  },

  {
    id: "nft.mint_activity",
    templateId: "nft.mint_activity",
    categoryId: "nft",
    name: "Mint activity",
    description: "Daily mint count, unique minters, and ETH revenue for an NFT collection.",
    tags: ["nft", "mint", "minting", "launch", "minters", "revenue"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "contract_address", label: "Collection address", type: "address", required: true, placeholder: "0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
    ],
  },

  {
    id: "nft.wash_trading",
    templateId: "nft.wash_trading",
    categoryId: "nft",
    name: "Wash trading detector",
    description: "Identifies round-trip NFT trades between related wallets.",
    tags: ["wash trading", "nft", "manipulation", "fraud", "suspicious", "self-trade"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "contract_address", label: "Collection address", type: "address", required: true, placeholder: "0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
    ],
  },

  {
    id: "nft.floor_price_history",
    templateId: "nft.floor_price_history",
    categoryId: "nft",
    name: "Floor price history",
    description: "Historical floor price trend for an NFT collection.",
    tags: ["nft", "floor price", "history", "trend", "market"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "contract_address", label: "Collection address", type: "address", required: true, placeholder: "0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "90" },
    ],
  },

  {
    id: "nft.whale_holders",
    templateId: "nft.whale_holders",
    categoryId: "nft",
    name: "Whale holders",
    description: "Top NFT holders by quantity for a collection.",
    tags: ["nft", "whale", "holder", "top", "concentration"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "contract_address", label: "Collection address", type: "address", required: true, placeholder: "0x..." },
      { key: "top_n", label: "Top N holders", type: "select", required: true, options: TOP_N_OPTIONS, default: "25" },
    ],
  },

  {
    id: "nft.wallet_pnl",
    templateId: "nft.wallet_pnl",
    categoryId: "nft",
    name: "NFT wallet PnL",
    description: "Realised profit/loss from NFT trades for a wallet.",
    tags: ["nft", "pnl", "profit", "loss", "trading", "wallet"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "wallet", label: "Wallet address", type: "address", required: true, placeholder: "0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "90" },
    ],
  },

  {
    id: "nft.marketplace_breakdown",
    templateId: "nft.marketplace_breakdown",
    categoryId: "nft",
    name: "Marketplace breakdown",
    description: "Volume split by marketplace for a collection — OpenSea vs Blur vs others.",
    tags: ["nft", "marketplace", "opensea", "blur", "volume", "share"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "contract_address", label: "Collection address", type: "address", required: true, placeholder: "0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
    ],
  },

  {
    id: "nft.holder_overlap",
    templateId: "nft.holder_overlap",
    categoryId: "nft",
    name: "Cross-collection holder overlap",
    description: "Wallets holding NFTs from multiple collections — finds shared communities.",
    tags: ["nft", "overlap", "holder", "community", "cross-collection"],
    uiHint: "list-builder",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "collections", label: "Collection addresses", type: "address[]", required: true, placeholder: "0x..." },
    ],
  },

  {
    id: "nft.trait_price",
    templateId: "nft.trait_price",
    categoryId: "nft",
    name: "Trait rarity vs sale price",
    description: "How trait rarity correlates with sale price for an NFT collection.",
    tags: ["nft", "trait", "rarity", "price", "attributes", "metadata"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "ethereum" },
      { key: "contract_address", label: "Collection address", type: "address", required: true, placeholder: "0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "90" },
    ],
  },
];