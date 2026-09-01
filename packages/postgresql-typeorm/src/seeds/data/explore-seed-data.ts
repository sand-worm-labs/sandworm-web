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
