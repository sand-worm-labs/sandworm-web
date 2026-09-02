// Real, on-brand notebook titles — no lorem-ipsum filler. Explore is a
// public feed; whatever ends up there should read like something a real
// analyst actually built, even though the seeded notebook itself is empty.
export const NOTEBOOK_TITLES: string[] = [
    'Ethereum Daily Gas Fees', 'Top DeFi Protocols by TVL', 'Uniswap V3 Pool Liquidity Overview',
    'Base Chain Weekly Active Wallets', 'Whale Wallet Movements — Last 7 Days', 'NFT Collection Floor Price Tracker',
    'Stablecoin Peg Deviation Monitor', 'Cross-Chain Bridge Volume Comparison', 'Aave Lending Market Utilization',
    'MEV Sandwich Attack Detector Results', 'Arbitrum vs Optimism DAU Comparison', 'DEX Aggregator Market Share',
    'ERC20 Token Holder Concentration', 'Wallet Age and Retention Cohorts', 'Liquid Staking TVL by Protocol',
    'Rug Pull Signal Dashboard', 'Blob Transaction Volume Since Dencun', 'Perp DEX Open Interest Overview',
    'Curve Pool Composition Ratios', 'DAO Governance Proposal Tracker', 'Gitcoin Passport Score Distribution',
    'Flashloan Activity Monitor', 'New Token Launch Sniper Detector', 'Sanctioned Address Exposure Check',
    'Wallet PnL — 30 Day Window', 'Bridge Fee Comparison Across Protocols', 'Validator Slashing Events Log',
    'GMX Open Interest by Market', 'Beacon Chain Deposit and Withdrawal Flows', 'Top Token Gainers This Week',
    'Contract Deployment Activity', 'Peel Chain Fund Tracing Demo', 'CEX Hot Wallet Net Flows',
    'Aggregator Volume Share by DEX', 'EAS Attestation Volume by Schema', 'NFT Wash Trading Detector',
    'Restaking Deposits on EigenLayer', 'Sandwich Attack Loss by Wallet', 'Multi-Chain User Overlap',
    'Token Vesting Unlock Calendar', 'DAO Treasury Balance Over Time', 'DEX Trader Volume Percentiles',
    'Smart Money Wallet Tracker', 'Wallet Fund Flow — 3 Hop Trace', 'L2 Sequencer Batch Submissions',
    'Yield Farming Reward Emissions', 'Circulating Supply Tracker', 'First Buyer Cohort Analysis',
    'Dormant Wallet Reawakening Monitor', 'Protocol Revenue — Daily Fees',
];

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
