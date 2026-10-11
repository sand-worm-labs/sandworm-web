import type { SearchEntryType } from './search.types';

// Hits returned per kind on the first screen, before "View all".
export const DEFAULT_GROUP_SIZE = 3;
// Hits per page when one kind is asked for.
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 50;
export const MAX_QUERY_LENGTH = 100;

// How long a rebuilt-index-sensitive answer may be reused. Searching an empty query (the
// browse list) changes only when the index does, so it lives longer.
export const RESULT_TTL_MS = 30_000;
export const BROWSE_TTL_MS = 5 * 60_000;
export const RESULT_CACHE_SIZE = 1_000;

// The index is rebuilt when something relevant changes (debounced) and on this timer as
// a safety net, so a missed event is wrong for at most this long.
export const REBUILD_DEBOUNCE_MS = 5_000;
export const REBUILD_INTERVAL_MS = 10 * 60_000;

// Raised or lowered when a kind should lead or trail on equal relevance.
export const TYPE_BOOST: Record<SearchEntryType, number> = {
  protocol: 6,
  chain: 6,
  category: 4,
  creator: 3,
  bounty: 3,
  dashboard: 2,
  notebook: 1,
};

// Sections appear in this order, whatever matched best.
export const TYPE_ORDER: SearchEntryType[] = [
  'protocol',
  'chain',
  'category',
  'notebook',
  'dashboard',
  'creator',
  'bounty',
];

// Other names people search a protocol or chain by. Keyed by the name as the search
// normalizes it (lower case, letters and digits). This is the place to teach the search
// a new nickname.
export const SEARCH_ALIASES: Record<string, string> = {
  ethereum: 'eth ether mainnet',
  solana: 'sol',
  arbitrum: 'arb',
  optimism: 'op',
  avalanche: 'avax',
  polygon: 'matic pol',
  'bnb chain': 'bnb bsc binance smart chain',
  base: 'coinbase l2',
  sui: 'mysten',
  tron: 'trx',
  monad: 'mon',
  uniswap: 'uni',
  'pump fun': 'pumpfun pump',
  jupiter: 'jup',
  hyperliquid: 'hype hl perps',
  lido: 'steth staking',
  ethena: 'usde',
  eigenlayer: 'eigen restaking',
  aave: 'lending',
  morpho: 'lending',
  pendle: 'yield',
  gmx: 'perps',
};
