import { tokens } from './tool-catalog.ts';

// Public data APIs a python cell can fetch from with plain `requests`. They are
// suggested when no power tool fits a sub-goal, and for everything when chain
// data (Dune, Sandworm Cloud) is offline. Every endpoint here was checked from
// the notebook environment; keep it that way.

export type OpenDataSource = {
  id: string;
  name: string;
  covers: string;
  // Words a sub-goal is matched on, besides the name and `covers`.
  keywords: string[];
  baseUrl: string;
  // No key: works as is. Optional key: works without, better with. Required: needs the env var set.
  key?: { env: string; required: boolean; signup: string };
  limits?: string;
  endpoints: { path: string; gives: string }[];
  notes?: string;
};

export const OPEN_DATA_SOURCES: OpenDataSource[] = [
  {
    id: 'defillama',
    name: 'DefiLlama',
    covers: 'DeFi TVL by chain and protocol, DEX and options volume, protocol fees and revenue, stablecoin supply, yield pools, token prices',
    keywords: ['defi', 'tvl', 'protocol', 'chain', 'dex', 'volume', 'fee', 'revenue', 'stablecoin', 'yield', 'apy', 'pool', 'lending', 'price', 'token', 'peg', 'option', 'staking'],
    baseUrl: 'https://api.llama.fi',
    limits: 'Generous. Oracle, unlock, and some bridge endpoints are paid; skip those.',
    endpoints: [
      { path: '/v2/chains', gives: 'current TVL per chain' },
      { path: '/v2/historicalChainTvl/{Chain}', gives: 'daily TVL of one chain (omit the chain for all)' },
      { path: '/protocols', gives: 'every protocol: tvl, category, chains, 1d/7d changes' },
      { path: '/protocol/{slug}', gives: 'one protocol: TVL history per chain, tokens, mcap' },
      { path: '/overview/dexs?excludeTotalDataChartBreakdown=true', gives: 'DEX volume, all protocols, daily (append /{chain} for one chain)' },
      { path: '/summary/dexs/{protocol}', gives: 'one DEX: daily volume' },
      { path: '/overview/fees?dataType=dailyFees', gives: 'fees for all protocols, daily (dataType=dailyRevenue for revenue)' },
      { path: '/summary/fees/{protocol}?dataType=dailyFees', gives: 'one protocol: daily fees, split by sub-protocol and chain' },
      { path: '/overview/options?excludeTotalDataChartBreakdown=true', gives: 'options volume' },
      { path: 'https://stablecoins.llama.fi/stablecoins?includePrices=true', gives: 'every stablecoin: supply now / 1d / 7d / 30d ago, per chain, price' },
      { path: 'https://stablecoins.llama.fi/stablecoincharts/all', gives: 'total stablecoin supply, daily (?stablecoin={id} for one coin)' },
      { path: 'https://stablecoins.llama.fi/stablecoinchains', gives: 'stablecoin supply per chain now' },
      { path: 'https://stablecoins.llama.fi/stablecoinprices', gives: 'daily price of every stablecoin (peg checks)' },
      { path: 'https://yields.llama.fi/pools', gives: 'every yield pool: APY, TVL, chain, project' },
      { path: 'https://yields.llama.fi/chart/{pool_id}', gives: 'one pool: daily APY and TVL' },
      { path: 'https://coins.llama.fi/prices/current/{coins}', gives: 'live prices; coins like coingecko:bitcoin,ethereum:0x...' },
      { path: 'https://coins.llama.fi/chart/{coins}?start={unix}&span=500&period=1d', gives: 'daily prices; max 500 points per call counted across all coins, so loop one coin and 500 days at a time for long ranges' },
    ],
  },
  {
    id: 'coingecko',
    name: 'CoinGecko',
    covers: 'prices, market caps, volumes and price history for every listed coin, global market cap, trending coins, sector categories',
    keywords: ['price', 'market', 'cap', 'mcap', 'coin', 'token', 'volume', 'history', 'trending', 'category', 'sector', 'dominance', 'rank'],
    baseUrl: 'https://api.coingecko.com/api/v3',
    key: { env: 'COINGECKO_API_KEY', required: false, signup: 'Free Demo key at coingecko.com/en/api' },
    limits: 'Keyless works but is throttled hard; a free Demo key gives 100 calls/min, 10k/month. History is limited to the last 365 days.',
    endpoints: [
      { path: '/simple/price?ids={ids}&vs_currencies=usd&include_24hr_change=true', gives: 'live prices' },
      { path: '/coins/markets?vs_currency=usd&per_page=100', gives: 'top coins: price, mcap, volume, 24h change, ATH' },
      { path: '/coins/{id}/market_chart?vs_currency=usd&days=365', gives: 'price, mcap and volume history' },
      { path: '/global', gives: 'total crypto market cap, BTC/ETH dominance' },
      { path: '/search/trending', gives: 'trending coins' },
      { path: '/coins/categories', gives: 'sectors (DeFi, L2, AI, memes...) with market cap and 24h change' },
    ],
  },
  {
    id: 'coinpaprika',
    name: 'CoinPaprika',
    covers: 'prices, market caps, supply and global market stats, as a second price source',
    keywords: ['price', 'market', 'cap', 'supply', 'global', 'dominance', 'coin', 'ticker'],
    baseUrl: 'https://api.coinpaprika.com/v1',
    endpoints: [
      { path: '/global', gives: 'total market cap, volume, BTC dominance' },
      { path: '/tickers?limit=100', gives: 'top coins: price, mcap, supply, % changes' },
      { path: '/tickers/{id}', gives: 'one coin, ids like btc-bitcoin, eth-ethereum' },
    ],
  },
  {
    id: 'exchanges',
    name: 'Binance, Coinbase and Kraken market data',
    covers: 'OHLCV price candles and trading volume straight from exchanges, hourly or daily',
    keywords: ['ohlc', 'ohlcv', 'candle', 'candlestick', 'price', 'volume', 'trading', 'exchange', 'volatility', 'return', 'hourly', 'cex'],
    baseUrl: 'https://data-api.binance.vision/api/v3',
    limits: 'Binance: 1000 candles per call. Coinbase: 300. Kraken: 720.',
    endpoints: [
      { path: '/klines?symbol=ETHUSDT&interval=1d&limit=1000', gives: 'Binance candles: open time, o, h, l, c, volume (interval 1h, 4h, 1d, 1w)' },
      { path: '/ticker/24hr?symbol=ETHUSDT', gives: 'Binance 24h stats' },
      { path: 'https://api.exchange.coinbase.com/products/ETH-USD/candles?granularity=86400', gives: 'Coinbase candles: time, low, high, open, close, volume' },
      { path: 'https://api.kraken.com/0/public/OHLC?pair=XBTUSD&interval=1440', gives: 'Kraken daily candles' },
    ],
    notes: 'Use data-api.binance.vision, not api.binance.com, which is geo-blocked in the US.',
  },
  {
    id: 'geckoterminal',
    name: 'GeckoTerminal',
    covers: 'on-chain DEX pools: trending and top pools per network, pool OHLCV, liquidity, pools for a token',
    keywords: ['dex', 'pool', 'liquidity', 'pair', 'trending', 'memecoin', 'meme', 'ohlcv', 'swap', 'uniswap', 'onchain'],
    baseUrl: 'https://api.geckoterminal.com/api/v2',
    limits: 'About 30 calls/min.',
    endpoints: [
      { path: '/networks', gives: 'network ids (eth, base, solana, arbitrum...)' },
      { path: '/networks/{network}/trending_pools', gives: 'trending pools: price, volume, liquidity, price changes' },
      { path: '/networks/{network}/pools?sort=h24_volume_usd_desc', gives: 'top pools by volume' },
      { path: '/networks/{network}/pools/{address}/ohlcv/day?limit=365', gives: 'pool candles' },
      { path: '/networks/{network}/tokens/{address}/pools', gives: 'pools for a token' },
      { path: '/search/pools?query={text}', gives: 'find pools by token name or symbol' },
    ],
  },
  {
    id: 'dexscreener',
    name: 'DexScreener',
    covers: 'DEX pairs across chains: price, volume, liquidity, transaction counts, newly promoted tokens',
    keywords: ['dex', 'pair', 'liquidity', 'memecoin', 'meme', 'new', 'launch', 'token', 'boost', 'swap', 'solana'],
    baseUrl: 'https://api.dexscreener.com',
    limits: '300/min on pair and search endpoints, 60/min on profiles and boosts.',
    endpoints: [
      { path: '/latest/dex/search?q={text}', gives: 'pairs matching a token name, symbol or address' },
      { path: '/tokens/v1/{chainId}/{addresses}', gives: 'pairs for up to 30 token addresses' },
      { path: '/token-profiles/latest/v1', gives: 'newest token profiles' },
      { path: '/token-boosts/top/v1', gives: 'most-boosted tokens' },
    ],
  },
  {
    id: 'coinmetrics',
    name: 'Coin Metrics Community',
    covers: 'daily on-chain network metrics for BTC, ETH and other majors: active addresses, transactions, fees, hash rate, supply, market cap',
    keywords: ['onchain', 'address', 'active', 'user', 'transaction', 'fee', 'hash', 'hashrate', 'supply', 'network', 'activity', 'bitcoin', 'ethereum', 'mvrv'],
    baseUrl: 'https://community-api.coinmetrics.io/v4',
    limits: '10 calls per 6s. Licensed CC BY-NC: credit Coin Metrics, non-commercial use.',
    endpoints: [
      { path: '/timeseries/asset-metrics?assets=btc,eth&metrics=AdrActCnt,TxCnt,FeeTotNtv,CapMrktCurUSD,SplyCur,HashRate&frequency=1d&page_size=10000', gives: 'daily metrics; follow next_page_url for more' },
      { path: '/catalog-v2/asset-metrics?assets={asset}', gives: 'which metrics exist for an asset' },
    ],
  },
  {
    id: 'l2',
    name: 'growthepie and L2BEAT',
    covers: 'Ethereum layer-2s: activity, active addresses, transactions, fees, value secured, per rollup',
    keywords: ['l2', 'layer', 'rollup', 'arbitrum', 'optimism', 'base', 'zksync', 'scroll', 'linea', 'scaling', 'activity', 'address', 'transaction', 'fee', 'tvs'],
    baseUrl: 'https://api.growthepie.xyz/v1',
    endpoints: [
      { path: '/fundamentals.json', gives: 'daily rows of metric_key, origin_key (chain), date, value: active addresses, txcount, fees, market cap, TVL per L2' },
      { path: '/master.json', gives: 'chain metadata and metric definitions' },
      { path: 'https://l2beat.com/api/scaling/summary', gives: 'total value secured across L2s, daily' },
      { path: 'https://l2beat.com/api/scaling/activity', gives: 'L2 transaction and user-operation counts, daily' },
    ],
  },
  {
    id: 'ethereum',
    name: 'Ethereum supply, burn and chain stats',
    covers: 'ETH supply and fee burn (ultrasound.money), block and transaction stats from Blockscout explorers on Ethereum and Base',
    keywords: ['ethereum', 'eth', 'burn', 'supply', 'issuance', 'inflation', 'gas', 'block', 'transaction', 'base', 'explorer'],
    baseUrl: 'https://ultrasound.money/api/v2',
    endpoints: [
      { path: '/fees/supply-over-time', gives: 'ETH supply over the last day, week, month, year' },
      { path: '/fees/burn-sums', gives: 'ETH burned per period, in ETH and USD' },
      { path: 'https://eth.blockscout.com/api/v2/stats', gives: 'Ethereum totals: transactions, addresses, gas prices (base.blockscout.com for Base)' },
      { path: 'https://eth.blockscout.com/api/v2/stats/charts/transactions', gives: 'daily transaction counts' },
    ],
  },
  {
    id: 'bitcoin',
    name: 'Bitcoin network (blockchain.com, mempool.space)',
    covers: 'Bitcoin hash rate, transactions, miner revenue, fees, mempool',
    keywords: ['bitcoin', 'btc', 'hash', 'hashrate', 'miner', 'mining', 'mempool', 'fee', 'difficulty', 'transaction'],
    baseUrl: 'https://api.blockchain.info',
    endpoints: [
      { path: '/charts/{chart}?timespan=1year&format=json', gives: 'daily series; chart = hash-rate, n-transactions, miners-revenue, transaction-fees-usd, difficulty' },
      { path: '/stats', gives: 'current network stats' },
      { path: 'https://mempool.space/api/v1/fees/recommended', gives: 'current fee rates' },
    ],
    notes: 'mempool.space drops connections under repeated calls; prefer blockchain.com for history.',
  },
  {
    id: 'hyperliquid',
    name: 'Hyperliquid',
    covers: 'perpetual futures: funding rates, open interest, volume and prices per market',
    keywords: ['perp', 'perpetual', 'future', 'funding', 'open', 'interest', 'leverage', 'derivative', 'hyperliquid'],
    baseUrl: 'https://api.hyperliquid.xyz/info',
    endpoints: [
      { path: 'POST {"type": "metaAndAssetCtxs"}', gives: 'every market: funding, open interest, 24h volume, mark price' },
      { path: 'POST {"type": "fundingHistory", "coin": "BTC", "startTime": <ms>}', gives: 'funding rate history' },
    ],
    notes: 'Every call is a POST with a JSON body.',
  },
  {
    id: 'polymarket',
    name: 'Polymarket',
    covers: 'prediction markets: events, outcome odds, volume, liquidity',
    keywords: ['prediction', 'market', 'odds', 'bet', 'election', 'polymarket', 'probability', 'event'],
    baseUrl: 'https://gamma-api.polymarket.com',
    endpoints: [
      { path: '/events?active=true&closed=false&order=volume24hr&ascending=false&limit=50', gives: 'busiest open events with their markets' },
      { path: '/markets?limit=100', gives: 'markets: question, outcome prices, volume' },
    ],
  },
  {
    id: 'sentiment-governance',
    name: 'Fear & Greed index and Snapshot governance',
    covers: 'crypto Fear & Greed sentiment history; DAO proposals and votes',
    keywords: ['sentiment', 'fear', 'greed', 'mood', 'governance', 'dao', 'proposal', 'vote', 'snapshot'],
    baseUrl: 'https://api.alternative.me',
    endpoints: [
      { path: '/fng/?limit=0', gives: 'full daily Fear & Greed history (value 0-100, label)' },
      { path: 'POST https://hub.snapshot.org/graphql {"query": "{ proposals(first: 20, where: {space: \\"aave.eth\\"}) { title state scores_total created } }"}', gives: 'DAO proposals and vote totals' },
    ],
  },
  {
    id: 'rpc',
    name: 'Public RPC nodes',
    covers: 'direct contract reads: balances, total supply, latest block, any view function',
    keywords: ['rpc', 'contract', 'balance', 'call', 'block', 'onchain', 'supply', 'read'],
    baseUrl: 'https://ethereum-rpc.publicnode.com',
    endpoints: [
      { path: 'POST {"jsonrpc": "2.0", "id": 1, "method": "eth_call", "params": [...]}', gives: 'Ethereum JSON-RPC (mainnet.base.org for Base)' },
    ],
    notes: 'Live state only; not for history.',
  },
  {
    id: 'etherscan',
    name: 'Etherscan V2',
    covers: 'per-address and per-contract activity on ~60 EVM chains with one key: transactions, token transfers, balances, gas',
    keywords: ['address', 'wallet', 'transaction', 'transfer', 'contract', 'balance', 'gas', 'holder', 'evm', 'explorer'],
    baseUrl: 'https://api.etherscan.io/v2/api',
    key: { env: 'ETHERSCAN_API_KEY', required: true, signup: 'Free key at etherscan.io/myapikey' },
    limits: '3 calls/s, 100k/day. Some chains are paid-only.',
    endpoints: [
      { path: '?chainid=1&module=account&action=tokentx&address={address}&sort=desc', gives: 'token transfers of an address' },
      { path: '?chainid=1&module=account&action=txlist&address={address}', gives: 'transactions of an address' },
      { path: '?chainid=1&module=gastracker&action=gasoracle', gives: 'gas prices' },
    ],
  },
  {
    id: 'thegraph',
    name: 'The Graph',
    covers: 'protocol subgraphs (Uniswap, Aave, Curve...): pools, swaps, positions, protocol-level history',
    keywords: ['subgraph', 'uniswap', 'aave', 'curve', 'swap', 'pool', 'position', 'protocol', 'graphql'],
    baseUrl: 'https://gateway.thegraph.com/api/subgraphs/id/{subgraph_id}',
    key: { env: 'THEGRAPH_API_KEY', required: true, signup: 'Free key in Subgraph Studio (100k queries/month)' },
    endpoints: [{ path: 'POST {"query": "..."}', gives: 'GraphQL over a subgraph; find ids on thegraph.com/explorer' }],
  },
  {
    id: 'fred',
    name: 'FRED (US Federal Reserve data)',
    covers: 'macro: interest rates, Treasury yields, inflation, M2 money supply, dollar index',
    keywords: ['macro', 'interest', 'rate', 'yield', 'treasury', 'inflation', 'cpi', 'fed', 'm2', 'dollar', 'economy'],
    baseUrl: 'https://api.stlouisfed.org/fred',
    key: { env: 'FRED_API_KEY', required: true, signup: 'Free key at fred.stlouisfed.org/docs/api/api_key.html' },
    endpoints: [{ path: '/series/observations?series_id=DGS10&file_type=json', gives: 'a daily series; e.g. DGS10 (10y yield), CPIAUCSL (CPI), M2SL, DFF (fed funds)' }],
  },
];

const MATCHES_PER_SUB_GOAL = 3;
// With nothing matched, these two still answer most market questions.
const FALLBACK_IDS = ['defillama', 'coingecko'];

// Keyword ranking, like the tool catalog's: a word counts most in keywords and the name.
function score(source: OpenDataSource, words: string[]): number {
  const strong = new Set([...source.keywords, ...tokens(source.name)]);
  const weak = new Set(tokens(source.covers));
  return words.reduce((sum, w) => sum + (strong.has(w) ? 3 : weak.has(w) ? 1 : 0), 0);
}

export function matchOpenData(query: string, limit = MATCHES_PER_SUB_GOAL): OpenDataSource[] {
  const words = tokens(query);
  const ranked = OPEN_DATA_SOURCES.map(source => ({ source, score: score(source, words) }))
    .filter(m => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(m => m.source);
  return (ranked.length ? ranked : OPEN_DATA_SOURCES.filter(s => FALLBACK_IDS.includes(s.id))).slice(0, limit);
}

// What the agent sees: drops the matching keywords, and says plainly whether a key is needed.
export const describeOpenData = ({ keywords: _, key, ...source }: OpenDataSource) => ({
  ...source,
  key: key ? `${key.env} (${key.required ? 'required' : 'optional'}; ${key.signup})` : 'none needed',
});

export const OPEN_DATA_USAGE = [
  'Fetch in a python cell with `requests` (timeout=60), retrying a dropped connection or a 429 once or twice.',
  'Read API keys from os.environ (e.g. os.environ["ETHERSCAN_API_KEY"], set with set_env_vars); never write a key into a cell.',
  'Combine sources when one does not cover everything, and name each source in a note under its chart.',
].join(' ');
