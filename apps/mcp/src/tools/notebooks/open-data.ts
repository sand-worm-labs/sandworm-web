import { tokens } from './tool-catalog.ts';

// Public data APIs a python cell can fetch from with plain `requests`. They are
// suggested when no power tool fits a sub-goal, and for everything when chain
// data (Dune, Sandworm Cloud) is offline. Every keyless endpoint here was
// checked from the notebook environment; Etherscan's follow its docs. Check a
// source the same way before adding it.

export type OpenDataSource = {
  id: string;
  name: string;
  covers: string;
  // Words a sub-goal is matched on, besides the name and `covers`.
  keywords: string[];
  baseUrl: string;
  // No key: works as is. Optional key: works without, better with. Required: needs the env var set.
  key?: { env: string; required: boolean; send: string; signup: string };
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
    keywords: ['price', 'market', 'cap', 'mcap', 'coin', 'token', 'volume', 'history', 'trending', 'category', 'sector', 'dominance', 'rank', 'meme', 'memecoin'],
    baseUrl: 'https://api.coingecko.com/api/v3',
    key: { env: 'COINGECKO_API_KEY', required: false, send: 'header x-cg-demo-api-key', signup: 'Free Demo key at coingecko.com/en/api' },
    limits: 'Keyless works but is throttled hard; a free Demo key gives 100 calls/min, 10k/month. History is limited to the last 365 days.',
    endpoints: [
      { path: '/simple/price?ids={ids}&vs_currencies=usd&include_24hr_change=true', gives: 'live prices' },
      { path: '/coins/markets?vs_currency=usd&per_page=100', gives: 'top coins: price, mcap, volume, 24h change, ATH' },
      { path: '/coins/{id}/market_chart?vs_currency=usd&days=365', gives: 'price, mcap and volume history' },
      { path: '/global', gives: 'total crypto market cap, BTC/ETH dominance' },
      { path: '/search/trending', gives: 'trending coins' },
      { path: '/coins/categories', gives: 'sectors (DeFi, L2, AI, memes...) with market cap and 24h change' },
      { path: '/coins/markets?vs_currency=usd&category={category}&per_page=250&page=1', gives: 'every coin in one sector, with price, mcap and volume (category like meme-token, decentralized-finance-defi, layer-2)' },
      { path: '/coins/list?include_platform=true', gives: 'every coin with its contract address per chain (platform keys like arbitrum-one, base, avalanche, ethereum): join on id to keep one sector\'s coins on one chain, e.g. meme tokens on Arbitrum' },
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
      { path: '/networks/{network}/new_pools', gives: 'newest pools on a network: fresh launches' },
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
    keywords: ['l2', 'layer', 'rollup', 'arbitrum', 'optimism', 'base', 'zksync', 'scroll', 'linea', 'scaling', 'activity', 'address', 'active', 'user', 'transaction', 'fee', 'revenue', 'profit', 'sequencer', 'tvs'],
    baseUrl: 'https://api.growthepie.xyz/v1',
    endpoints: [
      { path: '/fundamentals.json', gives: 'the last 90 days, every L2: daily rows of metric_key, origin_key (chain), date, value: active addresses, txcount, fees, market cap, TVL' },
      { path: '/master.json', gives: 'chain metadata and metric definitions' },
      { path: 'https://l2beat.com/api/scaling/summary', gives: 'total value secured across L2s, daily' },
      { path: 'https://l2beat.com/api/scaling/activity', gives: 'L2 transaction and user-operation counts, daily' },
      { path: 'https://api.growthepie.com/v1/metrics/chains/{chain}/{metric}.json', gives: 'full history of one metric for one chain (chain like arbitrum, optimism, base): txcount, daa (active addresses), fees (chain revenue), profit, rent_paid, txcosts, throughput, tvl, stables_mcap, app_revenue, market_cap, fdv. Under details.timeseries: daily, weekly, monthly, each with `types` (column names, unix in ms) and `data` rows' },
      { path: 'https://l2beat.com/api/scaling/tvs/{project}?range=1y', gives: 'value secured of one L2 (project like arbitrum): native, canonical and external, with ETH price' },
      { path: 'https://l2beat.com/api/scaling/activity/{project}?range=1y', gives: 'daily transaction and user-operation counts of one L2' },
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
    notes: 'Snapshot spaces are ENS names: arbitrumfoundation.eth (Arbitrum DAO), aave.eth, uniswapgovernance.eth, opcollective.eth.',
  },
  {
    id: 'blockscout',
    name: 'Blockscout',
    covers: 'Arbitrum One explorer data with no key (also Base and Ethereum): chain totals and daily transaction counts, transactions, token transfers and token balances of an address, token holders, token list',
    keywords: ['arbitrum', 'arb', 'blockscout', 'address', 'wallet', 'transaction', 'transfer', 'contract', 'balance', 'gas', 'holder', 'explorer'],
    baseUrl: 'https://arbitrum.blockscout.com/api/v2',
    limits: 'No key needed; keep to a few calls a second. Lists come 50 rows at a time: pass the response\'s next_page_params as query params for the next page.',
    endpoints: [
      { path: '/stats', gives: 'chain totals now: total_transactions, total_addresses, transactions_today, gas_prices, gas_used_today, average_block_time, network_utilization_percentage' },
      { path: '/stats/charts/transactions', gives: 'daily transaction counts, last 30 days' },
      { path: '/addresses/{address}', gives: 'one address: ETH balance, is_contract, name, tags' },
      { path: '/addresses/{address}/counters', gives: 'transaction, token transfer and gas usage counts of an address' },
      { path: '/addresses/{address}/transactions', gives: 'transactions of an address' },
      { path: '/addresses/{address}/token-transfers', gives: 'token transfers of an address' },
      { path: '/addresses/{address}/token-balances', gives: 'every token an address holds, with amounts' },
      { path: '/tokens/{token}/holders', gives: 'holders of a token, largest first (ARB is 0x912CE59144191C1204E64559FE8253a0e49E6548)' },
      { path: '/tokens?type=ERC-20', gives: 'tokens on the chain: holders count, market cap, volume' },
      { path: 'https://arbitrum.blockscout.com/api?module=account&action=tokentx&address={address}&page=1&offset=100&sort=desc', gives: 'the same data in the Etherscan format, for code written against Etherscan' },
    ],
    notes: 'Other chains use their own host with the same paths: base.blockscout.com, eth.blockscout.com. For Arbitrum history beyond 30 days (transactions, active addresses, fees, TVL) use growthepie; for TVL, DEX volume and stablecoins use DefiLlama chain `Arbitrum`; GeckoTerminal network and DexScreener chain are both `arbitrum`.',
  },
  {
    id: 'avalanche',
    name: 'Avalanche Metrics and Data API',
    covers: 'Avalanche C-Chain and Avalanche L1s (subnets): daily active addresses, transactions, fees, gas, TPS, contracts; Primary Network validators, delegators and staked AVAX; balances of an address',
    keywords: ['avalanche', 'avax', 'cchain', 'subnet', 'l1', 'validator', 'delegator', 'staking', 'stake', 'activity', 'address', 'active', 'transaction', 'fee', 'gas', 'tps', 'onchain', 'network'],
    baseUrl: 'https://metrics.avax.network/v2',
    key: { env: 'AVACLOUD_API_KEY', required: false, send: 'header x-glacier-api-key', signup: 'Free key at app.avacloud.io (Web3 Data API > Add API Key)' },
    limits: 'Works without a key, but rate limited by compute units, 6,000 per minute and 1.2M per day, shared by everyone on the same IP. A free key gives 8,000 per minute and 2M per day of its own. A call costs 1 to 100 units (most are 10 to 20; /networks/mainnet is 100), so page with pageSize and nextPageToken rather than looping many small calls.',
    endpoints: [
      { path: '/chains/43114/metrics/{metric}?timeInterval=day&pageSize=100', gives: 'daily series of {value, timestamp}, newest first, for one metric: activeAddresses, activeSenders, txCount, feesPaid (AVAX), gasUsed, avgGps, maxGps, avgTps, maxTps, avgGasPrice, maxGasPrice, contracts and deployers (new per period), cumulativeAddresses, cumulativeTxCount, cumulativeContracts, cumulativeDeployers. timeInterval is hour, day, week or month; startTimestamp and endTimestamp (unix seconds) bound it; pass nextPageToken as pageToken for older rows' },
      { path: '/chains/43114/rollingWindowMetrics/{metric}', gives: 'one metric summed over the last hour, day, week, month, 90 days, year and all time' },
      { path: '/chains?pageSize=100', gives: 'every chain the API covers (C-Chain is 43114, plus Avalanche L1s): evmChainId, chainName, subnetId, network. Use an evmChainId in place of 43114 above' },
      { path: '/networks/mainnet/metrics/{metric}?pageSize=100', gives: 'daily Primary Network staking series: validatorCount, delegatorCount, validatorWeight, delegatorWeight (weights in nAVAX: divide by 1e9)' },
      { path: 'https://data-api.avax.network/v1/networks/mainnet', gives: 'staking now: validator and delegator counts, total AVAX staked (nAVAX), estimated annual reward, stake by node version' },
      { path: 'https://data-api.avax.network/v1/networks/mainnet/validators?pageSize=100', gives: 'validators: nodeId, amountStaked, delegationFee, start and end time, uptime' },
      { path: 'https://data-api.avax.network/v1/networks/mainnet/subnets?pageSize=100', gives: 'subnets and L1s: subnetId, creation time, isL1, owner addresses, blockchains' },
      { path: 'https://data-api.avax.network/v1/networks/mainnet/l1Validators?pageSize=100', gives: 'validators of Avalanche L1s: validationId, nodeId, subnetId, creationTimestamp, weight, remainingBalance' },
      { path: 'https://data-api.avax.network/v1/chains/43114/addresses/{address}/balances:listErc20?pageSize=100', gives: 'AVAX and ERC-20 balances of an address' },
      { path: 'https://data-api.avax.network/v1/chains/43114/blocks?pageSize=25', gives: 'latest blocks (any evmChainId works in place of 43114)' },
      { path: 'https://data-api.avax.network/v1/chains/43114/transactions?pageSize=25', gives: 'latest transactions' },
      { path: 'https://data-api.avax.network/v1/chains/43114/addresses/{address}/transactions?pageSize=100', gives: 'transactions of an address: each has nativeTransaction and its erc20Transfers' },
    ],
    notes: 'The key is optional and is the workspace\'s own (saved on the environment page as AVACLOUD_API_KEY): read it with os.environ.get("AVACLOUD_API_KEY") and send the header only when it is set. Without one, calls share a per-IP pool and can be rate limited: if you hit 429s, suggest the user add a free key there (app.avacloud.io). The staking series under /networks/mainnet/metrics ran about 5 weeks behind when checked: take staking now from the Data API /networks/mainnet. Skip /v1/networks/mainnet/delegators and /v1/icm/messages: they time out or return 502. For Avalanche on the other sources: DefiLlama chain is `Avalanche` (TVL, DEX volume, fees, stablecoins), GeckoTerminal network is `avax`, DexScreener chain is `avalanche`, CoinGecko coin id is `avalanche-2`.',
  },
  {
    id: 'routescan',
    name: 'Routescan (Snowtrace)',
    covers: 'Avalanche C-Chain explorer data in the Etherscan API format, with no key: transactions and token transfers of an address, balances, contract logs, gas price, AVAX supply',
    keywords: ['avalanche', 'avax', 'snowtrace', 'routescan', 'cchain', 'address', 'wallet', 'transaction', 'transfer', 'contract', 'balance', 'gas', 'holder', 'log', 'explorer'],
    baseUrl: 'https://api.routescan.io/v2/network/mainnet/evm/43114/etherscan/api',
    key: { env: 'ROUTESCAN_API_KEY', required: false, send: 'query param apikey', signup: 'Free key at routescan.io' },
    limits: '2 calls/s and 10k/day without a key; 5 calls/s and 100k/day with a free one.',
    endpoints: [
      { path: '?module=account&action=tokentx&address={address}&page=1&offset=100&sort=desc', gives: 'token transfers of an address' },
      { path: '?module=account&action=txlist&address={address}&page=1&offset=100&sort=desc', gives: 'transactions of an address' },
      { path: '?module=account&action=balance&address={address}&tag=latest', gives: 'AVAX balance of an address, in wei' },
      { path: '?module=logs&action=getLogs&address={contract}&fromBlock={block}&toBlock=latest', gives: 'event logs of a contract' },
      { path: '?module=gastracker&action=gasoracle', gives: 'gas prices' },
      { path: '?module=stats&action=ethsupply', gives: 'AVAX supply, in wei' },
    ],
    notes: 'Same parameters as Etherscan. Ethereum works too (chain id 1 in the base URL); Arbitrum, Optimism and Base are not supported: use Blockscout or Etherscan V2 for those.',
  },
  {
    id: 'etherscan',
    name: 'Etherscan V2',
    covers: 'per-address and per-contract activity on many EVM chains with one key: transactions, token transfers, balances, gas',
    keywords: ['address', 'wallet', 'transaction', 'transfer', 'contract', 'balance', 'gas', 'holder', 'evm', 'explorer'],
    baseUrl: 'https://api.etherscan.io/v2/api',
    key: { env: 'ETHERSCAN_API_KEY', required: true, send: 'query param apikey', signup: 'Free key at etherscan.io/myapikey' },
    limits: '3 calls/s, 100k/day. Some chains are paid-only: Avalanche answers "Free API access is not supported for this chain", so use Routescan or the Avalanche Data API there.',
    endpoints: [
      { path: '?chainid=1&module=account&action=tokentx&address={address}&sort=desc', gives: 'token transfers of an address' },
      { path: '?chainid=1&module=account&action=txlist&address={address}', gives: 'transactions of an address' },
      { path: '?chainid=1&module=gastracker&action=gasoracle', gives: 'gas prices' },
    ],
  },
  {
    id: 'nansen',
    name: 'Nansen',
    covers: 'labelled onchain intelligence across 25+ chains: smart money flows, holdings and DEX trades, token holders and who bought or sold, wallet PnL and win rate, address labels and entities, related wallets and counterparties, token screener, risk and reward indicators, Hyperliquid perps and leaderboards, Polymarket traders',
    keywords: ['nansen', 'smart', 'money', 'whale', 'label', 'entity', 'fund', 'wallet', 'holder', 'pnl', 'profit', 'profitable', 'win', 'winner', 'winrate', 'trader', 'trading', 'copytrade', 'copy', 'fomo', 'netflow', 'inflow', 'outflow', 'accumulation', 'distribution', 'counterparty', 'cluster', 'related', 'funder', 'sybil', 'screener', 'perp', 'perpetual', 'hyperliquid', 'leaderboard', 'polymarket', 'prediction', 'position', 'liquidation', 'indicator', 'risk', 'concentration', 'insider', 'portfolio'],
    baseUrl: 'https://api.nansen.ai/api/v1',
    key: { env: 'NANSEN_API_KEY', required: true, send: 'header apikey', signup: 'Key from app.nansen.ai. Sandworm supplies none: it is the workspace\'s own, saved on the environment page as NANSEN_API_KEY' },
    limits: 'Every call costs credits (1 for most profiler/token/screener calls, 5 for smart-money, counterparties and many tgm calls, 100 for profiler/address/labels, 25 for historical top holders/leaderboards, 150 when premium_labels=true: never set that, 200/750 for agent calls). Only 2xx responses are charged. Rate limit 15/s and 300/min on the free plan (429 + Retry-After); profiler/perp-trades only 5/min. Fetch once, keep the DataFrame, and chart from it instead of re-calling per chart. Prefer smart-money/netflow and token-screener (cheap, wide) first, then drill into 3-5 tokens or wallets, not 50.',
    endpoints: [
      { path: 'POST /smart-money/netflow', gives: 'body {chains:[..], filters:{include_smart_money_labels:["Fund","Smart Trader","30D Smart Trader"], token_sector:[..], market_cap_usd:{min,max}, trader_count:{min}, token_age_days:{max}, include_stablecoins, include_native_tokens}, pagination, order_by:[{field,direction}]}. Rows: chain, token_address, token_symbol, net_flow_1h_usd, net_flow_24h_usd, net_flow_7d_usd, net_flow_30d_usd, token_sectors[], trader_count, token_age_days, market_cap_usd. The best "what is smart money buying" call' },
      { path: 'POST /smart-money/holdings', gives: 'what smart money holds now. Body like netflow (filters: value_usd, balance_24h_percent_change, holders_count, share_of_holdings_percent, token_sectors). Rows: chain, token_address, token_symbol, token_sectors, value_usd, balance_24h_percent_change, holders_count, share_of_holdings_percent, token_age_days, market_cap_usd. "Fund" label returns no rows here' },
      { path: 'POST /smart-money/dex-trades', gives: 'smart money swaps of the last 24h. Filters: token_bought_address, token_sold_address, trade_value_usd{min}, include_smart_money_labels. Rows: chain, block_timestamp, transaction_hash, trader_address, trader_address_label, token_bought_*/token_sold_* (address, symbol, amount, age_days, market_cap, fdv), trade_value_usd' },
      { path: 'POST /smart-money/perp-trades', gives: 'smart money Hyperliquid trades. Body {lookback_hours (1-168), only_new_positions, filters:{token_symbol, side, action, value_usd}}. Rows: trader_address, trader_address_label, token_symbol, side, action, token_amount, price_usd, value_usd, type, block_timestamp' },
      { path: 'POST /token-screener', gives: 'body {chains (1-5), timeframe: 5m|10m|1h|6h|24h|7d|30d, filters:{trader_type: all|sm|whale|public_figure|trending|..., token_age_days, market_cap_usd, liquidity, volume, netflow, nof_traders, sectors, include_stablecoins}, pagination, order_by}. Rows: chain, token_address, token_symbol, token_age_days, market_cap_usd, liquidity, price_usd, price_change, fdv, volume, buy_volume, sell_volume, netflow, nof_traders (+ nof_buyers/sellers/buys/sells). Finds new and trending tokens' },
      { path: 'POST /tgm/flow-intelligence', gives: 'body {chain, token_address, timeframe: 5m|1h|6h|12h|1d|7d}. One row: net flow USD, average flow and wallet count for each cohort: smart_trader_, whale_, public_figure_, top_pnl_, exchange_, fresh_wallets_ (e.g. smart_trader_net_flow_usd). Positive = accumulating. Cheap (1 credit)' },
      { path: 'POST /tgm/holders', gives: 'body {chain, token_address, label_type: all_holders|smart_money|whale|exchange|public_figure, aggregate_by_entity, filters:{value_usd, ownership_percentage, balance_change_7d}, pagination, order_by}. NO date field (422). Rows: address, address_label, token_amount, total_inflow, total_outflow, balance_change_24h/7d/30d, ownership_percentage (percent of supply), value_usd. Concentration and who is accumulating' },
      { path: 'POST /tgm/who-bought-sold', gives: 'body {chain, token_address, buy_or_sell: BUY|SELL, date:{from,to}, filters:{include_smart_money_labels, trade_volume_usd}, order_by}. Rows: address, address_label, bought_token_volume, sold_token_volume, bought_volume_usd, sold_volume_usd, trade_volume_usd. Filter labels in pandas, not with address_label wildcards (times out on busy tokens)' },
      { path: 'POST /tgm/pnl-leaderboard', gives: 'body {chain, token_address, date:{from,to}, filters:{pnl_usd_realised:{min}, holding_usd, nof_trades, trader_address_label}, order_by}. Rows: trader_address, trader_address_label, pnl_usd_realised, pnl_usd_unrealised, pnl_usd_total, roi_percent_realised, roi_percent_total, holding_amount, holding_usd, max_balance_held_usd, still_holding_balance_ratio, netflow_amount_usd, nof_trades. Who actually made money on a token' },
      { path: 'POST /tgm/dex-trades', gives: 'every DEX trade of one token (body {chain, token_address, date:{from,to}, only_smart_money, filters:{action: BUY|SELL, estimated_value_usd}}). Rows: block_timestamp, transaction_hash, trader_address, trader_address_label, action, token_amount, traded_token_name, traded_token_amount, estimated_swap_price_usd, estimated_value_usd. Gives a buy/sell tape with trader labels' },
      { path: 'POST /tgm/flows', gives: 'body {chain, token_address, date:{from,to}, label: smart_money|whale|exchange|public_figure|top_100_holders}. Daily rows: date, price_usd, token_amount, value_usd (held by that cohort), holders_count, total_inflows_count, total_outflows_count, and with label=exchange total_inflows_cex/outflows_cex/dex. Cohort balance over time' },
      { path: 'POST /tgm/transfers', gives: 'body {chain, token_address, date:{from,to} (max 1 year), filters:{include_cex, include_dex, non_exchange_transfers, transfer_value_usd:{min}, from_address_label}}. Rows: block_timestamp, transaction_hash, from_address, to_address, from_address_label, to_address_label, transaction_type, transfer_amount, transfer_value_usd. Large moves and exchange deposits/withdrawals' },
      { path: 'POST /tgm/token-information', gives: 'body {chain, token_address, timeframe}. data: name, symbol, token_details{market_cap_usd, fdv_usd, circulating_supply, total_supply, token_deployment_date}, spot_metrics{volume_total_usd, buy_volume_usd, sell_volume_usd, unique_buyers, unique_sellers, liquidity_usd, total_holders}' },
      { path: 'POST /tgm/indicators', gives: 'body {chain, token_address}. No data wrapper: token_info{market_cap_usd, market_cap_group}, risk_indicators[] (concentration-risk, liquidity-risk, btc-reflexivity, token-supply-inflation) and reward_indicators[] (price-momentum, cex-flows, chain-tvl, chain-fees, protocol-fees, funding-rate, trading-range), each {indicator_type, score: low|medium|high or bearish|neutral|bullish, signal, signal_percentile}. Updated daily' },
      { path: 'POST /tgm/token-ohlcv', gives: 'body {chain, token_address, timeframe: 1m..1M, date:{from,to}}. Rows: interval_start, open, high, low, close, volume_usd, market_cap{..}. Price candles for any token Nansen tracks, to overlay smart-money events on' },
      { path: 'POST /profiler/address/current-balance', gives: 'body {chain ("all" ok), address or entity_name, hide_spam_token:true, filters:{value_usd}, order_by}. Rows: chain, token_address, token_symbol, token_name, token_amount, price_usd, value_usd. entity_name works for exchanges and funds (e.g. "Coinbase")' },
      { path: 'POST /profiler/address/historical-balances', gives: 'body {chain, address, date:{from,to}, filters:{token_symbol, value_usd}}. Rows: block_timestamp, token_address, token_symbol, chain, token_amount, value_usd. Balance history for charting a wallet' },
      { path: 'POST /profiler/address/transactions', gives: 'body {chain, address, date:{from,to}, filters:{volume_usd:{min}, counterparty_address, method}, per_page max 100}. Rows: block_timestamp, transaction_hash, method, source_type, volume_usd, tokens_sent[], tokens_received[] (each token_symbol, token_amount, value_usd, from_address, to_address, from_address_label, to_address_label)' },
      { path: 'POST /profiler/address/counterparties', gives: 'body {chain, address or entity_name, date:{from,to}, group_by: wallet|entity, source_input:"Combined", filters:{total_volume_usd:{min}}, order_by}. Rows: counterparty_address, counterparty_address_label[], interaction_count, total_volume_usd, volume_in_usd, volume_out_usd, tokens_info[]. Sum volume_in_usd - volume_out_usd for net flow. Builds money-flow graphs' },
      { path: 'POST /profiler/address/related-wallets', gives: 'body {chain, wallet_address}. Rows: address, address_label, relation (e.g. First Funder, Signer, Deployed via), transaction_hash, block_timestamp, chain. Seeds a wallet-cluster graph' },
      { path: 'POST /profiler/address/labels', gives: 'body {chain ("all" ok), address}. Rows: label, category (smart_money, behavioral, defi, social, cefi, nft), kind[]. COSTS 100 CREDITS per call (the Nansen docs say free, they are wrong; a free-tier key cannot afford more than a few): do not call it by default. A wallet\'s own name is free inside /profiler/address/transactions (tokens_sent/tokens_received[].from_address_label / to_address_label where the address is the wallet), and the first funder is free in /profiler/address/related-wallets. /premium-labels (FOMO-trader labels) costs more' },
      { path: 'POST /profiler/address/pnl-summary', gives: 'body {chain, wallet_address, date:{from,to}}. realized_pnl_usd, realized_pnl_percent, win_rate (0-1), traded_token_count, traded_times, top5_tokens[]{token_symbol, realized_pnl, realized_roi}. NOTE realized (z) here, realised (s) in /profiler/address/pnl' },
      { path: 'POST /profiler/address/pnl', gives: 'per-token trade performance of a wallet. body {chain, address, date, order_by}. Rows: token_symbol, nof_buys, nof_sells, bought_usd, sold_usd, cost_basis_usd, pnl_usd_realised, pnl_usd_unrealised, roi_percent_realised, holding_usd, max_balance_held_usd' },
      { path: 'POST /search/general', gives: 'body {search_query, result_type: token|entity|any, chain, limit}. tokens[]{name, symbol, chain, address, price, volume_24h, market_cap, rank}, entities[]{name, tags}. Use it to turn a symbol into the address and chain every other call needs' },
      { path: 'POST /search/entity-name', gives: 'body {search_query}. data[]{entity_name}: exact entity names for entity_name params (free)' },
      { path: 'POST /perp-leaderboard', gives: 'most profitable Hyperliquid wallets. body {date:{from,to} as YYYY-MM-DD, filters:{total_pnl:{min}, roi:{min}, account_value:{min}, include_smart_money_labels}, order_by:[{field: total_pnl|roi|volume_usd|account_value}]}. Rows: trader_address, trader_address_label, total_pnl, realized_pnl_usd, unrealized_pnl_usd, roi, volume_usd, total_trades, account_value, top_positions[]{coin, side, size_base, position_value_usd, entry_price, unrealized_pnl_usd}' },
      { path: 'POST /profiler/perp-positions', gives: 'body {address (Hyperliquid)}. data{account value and margin summary strings, assetPositions[]{position_type, position{token_symbol, size, position_value_usd, entry_price_usd, liquidation_price_usd, leverage_value, leverage_type, unrealized_pnl_usd, return_on_equity, cumulative_funding_all_time_usd}}}. Numbers come back as strings: cast with pd.to_numeric' },
      { path: 'POST /profiler/perp-trades', gives: 'body {address, date:{from,to}, filters:{value_usd}}. Rows: timestamp, side, action (Open, Add, Close, Reduce), token_symbol, price, size, value_usd, start_position, closed_pnl, fee_usd. Only 5 calls/min' },
      { path: 'POST /tgm/perp-positions', gives: 'body {token_symbol, label_type: smart_money|whale|all_traders, filters:{side, position_value_usd}}. Rows: address, address_label, side, position_value_usd, leverage, entry_price, mark_price, liquidation_price, upnl_usd, funding_usd. Where the biggest Hyperliquid positions in one coin sit and where they liquidate' },
      { path: 'POST /perp-screener', gives: 'body {date:{from,to}, filters:{trader_type: all|sm|whale}}. Rows per coin: token_symbol, volume, buy_sell_pressure, trader_count, mark_price, funding, open_interest, price_change; with trader_type sm: net_position_change, current_smart_money_position_longs_usd, current_smart_money_position_shorts_usd, smart_money_longs_count, smart_money_shorts_count' },
      { path: 'POST /portfolio/defi-holdings', gives: 'body {wallet_address}. DeFi positions of a wallet across chains and protocols, with balances and values' },
      { path: 'POST /prediction-market/market-screener', gives: 'Polymarket markets. body {status:"active", query, order_by:[{field: volume_24hr|liquidity|open_interest|unique_traders_24h}], pagination}. Rows: market_id, question, event_title, volume, volume_24hr, liquidity, open_interest, best_bid, best_ask, last_trade_price, one_day_price_change, unique_traders_24h, end_date' },
      { path: 'POST /prediction-market/top-holders', gives: 'body {market_id}. Rows: address, outcome_index, side, position_size, avg_entry_price, current_price, unrealized_pnl_usd' },
      { path: 'POST /prediction-market/address-summary', gives: 'body {address}. One row: wallet_age_days, realized_pnl_usd, unrealized_pnl_usd, total_pnl_usd, markets_won, markets_traded, win_rate' },
      { path: 'POST /agent/fast', gives: 'Nansen\'s own research agent (200 credits; /agent/expert 750). body {text}; streams server-sent events. Only worth it for a "ask Nansen" demo cell, not for data pulls' },
    ],
    notes: 'ALL calls are POST with a JSON body and the header `apikey`. Sandworm supplies no Nansen key: it is the workspace\'s own, saved on the environment page as NANSEN_API_KEY, so read it with os.environ.get("NANSEN_API_KEY"). If it is missing, do not fake data and do not hard-code a key: stop and tell the user to add NANSEN_API_KEY on the environment page, then run the cell again. Use plain requests: `r = requests.post("https://api.nansen.ai/api/v1/smart-money/netflow", headers={"apikey": key}, json={"chains": ["ethereum", "base", "solana"], "filters": {"include_smart_money_labels": ["Fund", "Smart Trader"]}, "order_by": [{"field": "net_flow_7d_usd", "direction": "DESC"}], "pagination": {"page": 1, "per_page": 100}}, timeout=60)`, check r.status_code and show Nansen\'s error text on failure, then `pd.json_normalize(r.json()["data"])`; the credits a call spent are in the `X-Nansen-Credits-Used` response header. Conventions: smart-money/* and token-screener take `chains` (array), tgm/* and profiler/* take `chain` (string; "all" is accepted by profiler). per_page DEFAULTS TO 10: always set it (max 1000, transactions max 100). Responses are {data, pagination:{page, per_page, is_last_page}}. Dates are {"from","to"} ISO 8601 (some endpoints want YYYY-MM-DD); tgm/holders takes no date. Address params are `address` or `wallet_address` depending on the endpoint (see each). Label filters accept % wildcards. A token needs its address and chain: find them with /search/general first, and use the wrapped token (WETH, WSOL) for native assets. Smart-money labels: Fund, Smart Trader, 30D/90D/180D Smart Trader, Smart HL Perps Trader. Chains include ethereum, base, arbitrum, optimism, polygon, bnb, avalanche, solana, hyperevm, monad, sui, tron, ton, near, sei, linea, mantle, plasma, sonic. Hyperliquid perps and Polymarket are separate datasets from chain data. A 403 with insufficient credits means stop and say so, never fake data. Name Nansen as the source under any chart that uses it.',
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

export function matchOpenData(query: string): OpenDataSource[] {
  const words = tokens(query);
  const ranked = OPEN_DATA_SOURCES.map(source => ({ source, score: score(source, words) }))
    .filter(m => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(m => m.source);
  return (ranked.length ? ranked : OPEN_DATA_SOURCES.filter(s => FALLBACK_IDS.includes(s.id))).slice(0, MATCHES_PER_SUB_GOAL);
}

// What the agent sees: drops the matching keywords, and says plainly whether a key is needed.
export const describeOpenData = ({ keywords: _, key, ...source }: OpenDataSource) => ({
  ...source,
  key: key ? `${key.env} (${key.required ? 'required' : 'optional'}; send as ${key.send}; ${key.signup})` : 'none needed',
});

export const OPEN_DATA_USAGE = [
  'Fetch in a python cell with `requests` (timeout=60), retrying a dropped connection or a 429 once or twice.',
  'Read API keys from os.environ (e.g. os.environ["ETHERSCAN_API_KEY"], set with set_env_vars); never write a key into a cell.',
  'Combine sources when one does not cover everything, and name each source in a note under its chart.',
].join(' ');

// For a sql cell whose data source is down rather than whose query is wrong.
export const DATA_SOURCE_FALLBACK = [
  'If a sql cell on Dune or Sandworm Cloud fails because the data source itself cannot be used (connection refused or timed out, authentication failed, source unavailable or not configured), not because the query is wrong, delete that cell with delete_cell and replace it with a python cell that gets the same data from the public APIs (open data).',
  'Find the right API with plan_notebook or search_tools, which list the open data sources for a sub-goal. A query error such as a bad column or syntax is not this case: fix the SQL instead.',
  'If no open data source covers what the cell needed, do not make up data. Delete nothing further, and tell the user which data could not be retrieved and why.',
  'A cell that fails with PaidPlanRequired means the workspace\'s plan does not include that data source (Dune needs the Pro plan, Sandworm Cloud any paid plan): rebuild it from open data or another allowed source, and if nothing covers it, tell the user that data needs a higher plan and that they can upgrade in Settings > Plan.',
].join(' ');
