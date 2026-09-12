import type { SelectOption } from "./types.js";

// Icons come from DefiLlama's public chain-icon CDN. Exported (not just used
// inline below) because a tool's "chain" param options are usually seeded
// live from the external sand-worm-labs/tools YAML catalog — ChainSelectField
// falls back to deriving the icon from the option's plain `value` via this
// same function when a seeded option has no explicit `icon`.
// DefiLlama's slug matches `value` for every chain except this one.
const ICON_SLUG_OVERRIDES: Record<string, string> = { zksync: "zksync_era" };
export const chainIcon = (value: string) =>
  `https://icons.llamao.fi/icons/chains/rsz_${ICON_SLUG_OVERRIDES[value] ?? value}.jpg`;

export const CHAIN_OPTIONS: SelectOption[] = [
  { label: "Ethereum", value: "ethereum", icon: chainIcon("ethereum") },
  { label: "Base", value: "base", icon: chainIcon("base") },
  { label: "Optimism", value: "optimism", icon: chainIcon("optimism") },
  { label: "Arbitrum", value: "arbitrum", icon: chainIcon("arbitrum") },
  { label: "Polygon", value: "polygon", icon: chainIcon("polygon") },
  { label: "BSC", value: "bsc", icon: chainIcon("bsc") },
  { label: "Avalanche", value: "avalanche", icon: chainIcon("avalanche") },
  { label: "Celo", value: "celo", icon: chainIcon("celo") },
  { label: "Gnosis", value: "gnosis", icon: chainIcon("gnosis") },
  { label: "Fantom", value: "fantom", icon: chainIcon("fantom") },
  { label: "Linea", value: "linea", icon: chainIcon("linea") },
  { label: "Scroll", value: "scroll", icon: chainIcon("scroll") },
  { label: "Blast", value: "blast", icon: chainIcon("blast") },
  // DefiLlama's icon slug is "zksync_era", not "zksync" — the one chain
  // here where the option value and icon slug diverge.
  { label: "zkSync Era", value: "zksync", icon: chainIcon("zksync_era") },
];

export const TIME_RANGE_OPTIONS: SelectOption[] = [
  { label: "Last 7 days", value: "7" },
  { label: "Last 30 days", value: "30" },
  { label: "Last 90 days", value: "90" },
  { label: "Last 180 days", value: "180" },
  { label: "Last year", value: "365" },
  { label: "All time", value: "all" },
];

export const TOP_N_OPTIONS: SelectOption[] = [
  { label: "Top 10", value: "10" },
  { label: "Top 25", value: "25" },
  { label: "Top 50", value: "50" },
  { label: "Top 100", value: "100" },
];

export const DEX_OPTIONS: SelectOption[] = [
  { label: "All DEXes", value: "all" },
  { label: "Uniswap V3", value: "uniswap_v3" },
  { label: "Uniswap V2", value: "uniswap_v2" },
  { label: "Curve", value: "curve" },
  { label: "Balancer", value: "balancer" },
  { label: "Aerodrome", value: "aerodrome" },
  { label: "Velodrome", value: "velodrome" },
  { label: "PancakeSwap", value: "pancakeswap" },
  { label: "SushiSwap", value: "sushiswap" },
];

export const LENDING_OPTIONS: SelectOption[] = [
  { label: "Aave V3", value: "aave_v3" },
  { label: "Aave V2", value: "aave_v2" },
  { label: "Compound V3", value: "compound_v3" },
  { label: "Compound V2", value: "compound_v2" },
  { label: "Morpho", value: "morpho" },
  { label: "Spark", value: "spark" },
];

export const LIQUID_STAKING_OPTIONS: SelectOption[] = [
  { label: "All protocols", value: "all" },
  { label: "Lido", value: "lido" },
  { label: "Rocket Pool", value: "rocketpool" },
  { label: "Coinbase cbETH", value: "cbeth" },
  { label: "Frax", value: "frax" },
  { label: "StakeWise", value: "stakewise" },
];

export const BRIDGE_OPTIONS: SelectOption[] = [
  { label: "All bridges", value: "all" },
  { label: "Optimism Bridge", value: "optimism_bridge" },
  { label: "Arbitrum Bridge", value: "arbitrum_bridge" },
  { label: "Base Bridge", value: "base_bridge" },
  { label: "Across", value: "across" },
  { label: "Stargate", value: "stargate" },
  { label: "Hop", value: "hop" },
  { label: "Synapse", value: "synapse" },
];

export const NFT_MARKETPLACE_OPTIONS: SelectOption[] = [
  { label: "All marketplaces", value: "all" },
  { label: "OpenSea", value: "opensea" },
  { label: "Blur", value: "blur" },
  { label: "LooksRare", value: "looksrare" },
  { label: "X2Y2", value: "x2y2" },
  { label: "Magic Eden", value: "magiceden" },
];

export const PERP_OPTIONS: SelectOption[] = [
  { label: "GMX V2", value: "gmx_v2" },
  { label: "GMX V1", value: "gmx_v1" },
  { label: "Synthetix", value: "synthetix" },
  { label: "Gains Network", value: "gains" },
];

export const HOP_OPTIONS: SelectOption[] = [
  { label: "1 hop", value: "1" },
  { label: "2 hops", value: "2" },
  { label: "3 hops", value: "3" },
  { label: "5 hops", value: "5" },
];

export const MIN_ETH_OPTIONS: SelectOption[] = [
  { label: "Any", value: "0" },
  { label: "> 0.01 ETH", value: "0.01" },
  { label: "> 0.1 ETH", value: "0.1" },
  { label: "> 1 ETH", value: "1" },
];

export const MIN_USD_OPTIONS: SelectOption[] = [
  { label: "> $10,000", value: "10000" },
  { label: "> $100,000", value: "100000" },
  { label: "> $1,000,000", value: "1000000" },
  { label: "> $10,000,000", value: "10000000" },
];

export const ETHEREUM_ONLY: SelectOption[] = [
  { label: "Ethereum", value: "ethereum" },
];