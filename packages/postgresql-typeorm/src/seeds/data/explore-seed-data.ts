interface NotebookSeedSpec {
    title: string;
    description: string;
    tags: string[];
}

// Real, on-brand notebook title/description/tags triples — no lorem-ipsum
// filler. Explore is a public feed; whatever ends up there should read like
// something a real analyst actually built, even though the seeded notebook
// itself is empty. `title` is the single source of truth for identity —
// NOTEBOOK_TITLES and NOTEBOOK_META below are both derived from this list,
// so a title can never drift out of sync with its own metadata.
const NOTEBOOK_CATALOG: NotebookSeedSpec[] = [
    { title: 'Ethereum Daily Gas Fees', description: 'Daily average and median gas price on Ethereum mainnet, with spikes flagged against the trailing 30-day baseline.', tags: ['Ethereum', 'Gas', 'Network Activity'] },
    { title: 'Top DeFi Protocols by TVL', description: 'Ranks the largest DeFi protocols by total value locked, updated from live on-chain deposits.', tags: ['DeFi', 'TVL', 'Protocols'] },
    { title: 'Uniswap V3 Pool Liquidity Overview', description: "Liquidity distribution across Uniswap V3's top pools, broken out by fee tier and price range.", tags: ['Uniswap', 'DEX', 'Liquidity'] },
    { title: 'Base Chain Weekly Active Wallets', description: 'Weekly unique active wallets on Base, tracked since mainnet launch.', tags: ['Base', 'L2', 'Wallets'] },
    { title: 'Whale Wallet Movements — Last 7 Days', description: 'Large-balance wallet transfers over the past week, filtered to moves above a configurable USD threshold.', tags: ['Whales', 'On-chain', 'Wallets'] },
    { title: 'NFT Collection Floor Price Tracker', description: 'Floor price and listing count for a set of top NFT collections, refreshed daily.', tags: ['NFTs', 'Marketplaces'] },
    { title: 'Stablecoin Peg Deviation Monitor', description: 'Tracks how far major stablecoins drift from their $1 peg across DEX pools.', tags: ['Stablecoins', 'DeFi', 'Risk'] },
    { title: 'Cross-Chain Bridge Volume Comparison', description: 'Daily bridged volume across the largest cross-chain bridges, side by side.', tags: ['Bridges', 'Cross-chain'] },
    { title: 'Aave Lending Market Utilization', description: "Supply, borrow, and utilization rates across Aave's lending markets.", tags: ['Aave', 'Lending', 'DeFi'] },
    { title: 'MEV Sandwich Attack Detector Results', description: 'Flags likely sandwich-attack transaction triplets and estimates extracted value.', tags: ['MEV', 'Security'] },
    { title: 'Arbitrum vs Optimism DAU Comparison', description: 'Daily active addresses on Arbitrum and Optimism, plotted head to head.', tags: ['Arbitrum', 'Optimism', 'L2'] },
    { title: 'DEX Aggregator Market Share', description: 'Swap volume share across the major DEX aggregators over the trailing week.', tags: ['DEX', 'Aggregators'] },
    { title: 'ERC20 Token Holder Concentration', description: 'Holder distribution for a given ERC20 token, including top-10 wallet concentration.', tags: ['ERC20', 'Tokens', 'Analytics'] },
    { title: 'Wallet Age and Retention Cohorts', description: 'Groups wallets by first-seen date and tracks how many stay active in later weeks.', tags: ['Wallets', 'Retention'] },
    { title: 'Liquid Staking TVL by Protocol', description: 'Total value locked across the major liquid staking protocols, tracked over time.', tags: ['Liquid Staking', 'DeFi'] },
    { title: 'Rug Pull Signal Dashboard', description: 'Surfaces early warning signals — LP unlocks, ownership renounces, sudden sells — for newly launched tokens.', tags: ['Security', 'Tokens', 'Risk'] },
    { title: 'Blob Transaction Volume Since Dencun', description: 'Daily blob-carrying transaction count and data volume since the Dencun upgrade.', tags: ['Ethereum', 'L2', 'Blobs'] },
    { title: 'Perp DEX Open Interest Overview', description: 'Open interest across the top perpetual futures DEXs, by market.', tags: ['Perps', 'DEX', 'Derivatives'] },
    { title: 'Curve Pool Composition Ratios', description: "Token balance ratios inside Curve's major stable and volatile pools.", tags: ['Curve', 'DeFi', 'Liquidity'] },
    { title: 'DAO Governance Proposal Tracker', description: 'Recent governance proposals across major DAOs, with vote counts and outcomes.', tags: ['DAOs', 'Governance'] },
    { title: 'Gitcoin Passport Score Distribution', description: 'Distribution of Gitcoin Passport scores across addresses that have claimed one.', tags: ['Identity', 'Gitcoin'] },
    { title: 'Flashloan Activity Monitor', description: 'Recent flashloan transactions above a size threshold, with protocol and outcome.', tags: ['Flashloans', 'DeFi', 'Security'] },
    { title: 'New Token Launch Sniper Detector', description: 'Flags wallets that consistently buy new token launches within the first few blocks.', tags: ['Tokens', 'MEV'] },
    { title: 'Sanctioned Address Exposure Check', description: "Checks a wallet's transaction history for direct or indirect exposure to sanctioned addresses.", tags: ['Compliance', 'Security'] },
    { title: 'Wallet PnL — 30 Day Window', description: "Realized and unrealized profit/loss for a wallet's token positions over the trailing 30 days.", tags: ['PnL', 'Wallets'] },
    { title: 'Bridge Fee Comparison Across Protocols', description: 'Compares bridging fees for the same route across several cross-chain bridges.', tags: ['Bridges', 'Fees'] },
    { title: 'Validator Slashing Events Log', description: 'Recent validator slashing events on Ethereum, with cause and penalty amount.', tags: ['Ethereum', 'Validators', 'Staking'] },
    { title: 'GMX Open Interest by Market', description: 'Long/short open interest split by market on GMX.', tags: ['GMX', 'Perps', 'DeFi'] },
    { title: 'Beacon Chain Deposit and Withdrawal Flows', description: 'Daily ETH deposited to and withdrawn from the Beacon Chain.', tags: ['Ethereum', 'Staking'] },
    { title: 'Top Token Gainers This Week', description: 'Biggest price gainers over the trailing 7 days, ranked by percentage move.', tags: ['Tokens', 'Markets'] },
    { title: 'Contract Deployment Activity', description: 'Daily count of new smart contract deployments, with a rolling trend line.', tags: ['Smart Contracts', 'Network Activity'] },
    { title: 'Peel Chain Fund Tracing Demo', description: 'Traces fund flow from a starting address across multiple hops, peeling off each transfer.', tags: ['Forensics', 'Wallets'] },
    { title: 'CEX Hot Wallet Net Flows', description: 'Net inflow/outflow between known exchange hot wallets and the broader chain.', tags: ['Exchanges', 'Flows'] },
    { title: 'Aggregator Volume Share by DEX', description: 'Breaks down aggregator-routed volume by the underlying DEX it actually filled on.', tags: ['DEX', 'Aggregators'] },
    { title: 'EAS Attestation Volume by Schema', description: 'Daily attestation counts on Ethereum Attestation Service, grouped by schema.', tags: ['Identity', 'EAS'] },
    { title: 'NFT Wash Trading Detector', description: 'Flags NFT trades between wallets that show circular buy/sell patterns typical of wash trading.', tags: ['NFTs', 'Security'] },
    { title: 'Restaking Deposits on EigenLayer', description: 'Daily and cumulative restaked deposits on EigenLayer, by asset.', tags: ['EigenLayer', 'Restaking', 'DeFi'] },
    { title: 'Sandwich Attack Loss by Wallet', description: 'Estimated value lost to sandwich attacks, aggregated per victim wallet.', tags: ['MEV', 'Security'] },
    { title: 'Multi-Chain User Overlap', description: 'How many wallets are active on more than one chain, and which pairs overlap most.', tags: ['Cross-chain', 'Wallets'] },
    { title: 'Token Vesting Unlock Calendar', description: 'Upcoming token unlock events by project, with unlock size relative to circulating supply.', tags: ['Tokens', 'Vesting'] },
    { title: 'DAO Treasury Balance Over Time', description: "Tracks a DAO treasury's token balances and USD value over time.", tags: ['DAOs', 'Treasury'] },
    { title: 'DEX Trader Volume Percentiles', description: 'Where a given trader\'s volume ranks against the full DEX trader population.', tags: ['DEX', 'Analytics'] },
    { title: 'Smart Money Wallet Tracker', description: 'Follows a curated list of historically profitable wallets and their recent trades.', tags: ['Smart Money', 'Wallets'] },
    { title: 'Wallet Fund Flow — 3 Hop Trace', description: "Traces a wallet's outgoing funds three hops deep, for lightweight forensics.", tags: ['Forensics', 'Wallets'] },
    { title: 'L2 Sequencer Batch Submissions', description: 'Batch submission frequency and size from major L2 sequencers to L1.', tags: ['L2', 'Infrastructure'] },
    { title: 'Yield Farming Reward Emissions', description: 'Daily reward token emissions across major yield farms, with effective APR.', tags: ['Yield Farming', 'DeFi'] },
    { title: 'Circulating Supply Tracker', description: "Tracks a token's circulating vs total supply as vesting unlocks occur.", tags: ['Tokens', 'Supply'] },
    { title: 'First Buyer Cohort Analysis', description: "Groups a token's earliest buyers into cohorts and tracks how their holdings evolved.", tags: ['Tokens', 'Cohorts'] },
    { title: 'Dormant Wallet Reawakening Monitor', description: 'Flags previously dormant wallets (1yr+) that just became active again.', tags: ['Wallets', 'On-chain'] },
    { title: 'Protocol Revenue — Daily Fees', description: 'Daily protocol fee revenue for a set of top DeFi protocols.', tags: ['DeFi', 'Revenue'] },
];

export const NOTEBOOK_TITLES: string[] = NOTEBOOK_CATALOG.map((n) => n.title);

// Keyed by title so callers that only have a title in hand (picked via
// fake.helpers.arrayElement(NOTEBOOK_TITLES), or after NOTEBOOK_TITLES has
// been shuffled/sliced) can still look up its description/tags.
export const NOTEBOOK_META: Record<string, { description: string; tags: string[] }> =
    Object.fromEntries(NOTEBOOK_CATALOG.map((n) => [n.title, { description: n.description, tags: n.tags }]));

// Real, runnable sample queries against the standard Dune-style schemas
// used across this codebase's own tool templates — not placeholder text.
export const SAMPLE_QUERIES: string[] = [
    `select date_trunc('day', block_time) as day, count(*) as tx_count
from ethereum.transactions
where block_time > now() - interval '30' day
group by 1
order by 1`,
    `select project, count(*) as trades, sum(amount_usd) as volume_usd
from dex.trades
where block_time > now() - interval '7' day
group by 1
order by volume_usd desc
limit 20`,
    `select taker, count(*) as swaps, sum(amount_usd) as volume_usd
from dex.trades
where block_time > now() - interval '30' day
group by 1
order by volume_usd desc
limit 50`,
    `select collection, count(*) as sales, sum(amount_usd) as volume_usd
from nft.trades
where block_time > now() - interval '7' day
group by 1
order by volume_usd desc
limit 20`,
    `select date_trunc('day', evt_block_time) as day, count(distinct "from") as unique_senders
from erc20."ERC20_evt_Transfer"
where evt_block_time > now() - interval '30' day
group by 1
order by 1`,
    `select date_trunc('hour', block_time) as hour, avg(gas_price) / 1e9 as avg_gas_price_gwei
from ethereum.transactions
where block_time > now() - interval '7' day
group by 1
order by 1`,
];

// One section per SAMPLE_QUERIES entry, topically matched — heading text,
// the pandas snippet that follows the query, and the dataframe name that
// threads the SQL block through to its Python/Viz/Pivot blocks.
export const QUERY_SECTIONS: Array<{ heading: string; body: string; df: string; python: string }> = [
    {
        heading: 'Daily transaction volume',
        body: 'Raw transaction count per day over the trailing 30 days — the baseline activity series everything else in this notebook gets compared against.',
        df: 'daily_tx',
        python: `daily_tx['day'] = pd.to_datetime(daily_tx['day'])
daily_tx['tx_count_7d_avg'] = daily_tx['tx_count'].rolling(7).mean()
daily_tx.tail(14)`,
    },
    {
        heading: 'Top DEX projects by volume',
        body: 'Which DEX protocols are actually capturing swap volume this week, ranked by USD notional.',
        df: 'dex_by_project',
        python: `dex_by_project['share_pct'] = (dex_by_project['volume_usd'] / dex_by_project['volume_usd'].sum() * 100).round(2)
dex_by_project.sort_values('share_pct', ascending=False).head(10)`,
    },
    {
        heading: 'Trader-level swap activity',
        body: 'Same window, grouped by taker instead of protocol — surfaces whether volume is broad-based or concentrated in a handful of wallets.',
        df: 'traders',
        python: `top_wallets = traders.nlargest(10, 'volume_usd')
concentration = top_wallets['volume_usd'].sum() / traders['volume_usd'].sum()
print(f"Top 10 wallets: {concentration:.1%} of total volume")
top_wallets`,
    },
    {
        heading: 'NFT collection sales',
        body: 'Weekly sales count and volume by collection — a quick read on where secondary-market attention is concentrated.',
        df: 'nft_sales',
        python: `nft_sales['avg_sale_usd'] = (nft_sales['volume_usd'] / nft_sales['sales']).round(2)
nft_sales.sort_values('volume_usd', ascending=False).head(15)`,
    },
    {
        heading: 'Unique ERC20 senders',
        body: 'Daily distinct sending addresses for ERC20 transfers — a rough proxy for how many unique wallets are actually active, independent of transaction count.',
        df: 'unique_senders',
        python: `unique_senders['day'] = pd.to_datetime(unique_senders['day'])
unique_senders['wow_change'] = unique_senders['unique_senders'].pct_change(7).round(3)
unique_senders.tail(10)`,
    },
    {
        heading: 'Gas price over time',
        body: 'Hourly average gas price for the trailing week — useful context for whether any volume swings line up with fee spikes.',
        df: 'gas_price',
        python: `gas_price['hour'] = pd.to_datetime(gas_price['hour'])
gas_price.describe()`,
    },
];

// Real toolIds from the platform's own tool catalog (verified present in
// the DB `tool` table) — used to seed PowerToolbox blocks.
export const POWER_TOOLS: string[] = [
    'primitives.erc20_transfers',
    'defi.aggregator_dex_volume_share',
    'token.holder_cohort_analysis',
];

// Matches apps/api/src/common/utils/color.ts#getRandomIconColor — a
// workspace's icon is one of these color swatch filenames, not an icon name.
export const WORKSPACE_ICON_COLORS = ['red.png', 'blue.png', 'green.png', 'purple.png', 'yellow.png'] as const;
