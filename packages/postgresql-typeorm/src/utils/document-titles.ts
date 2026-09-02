import { fake } from './index';


export const DOCUMENT_TITLE_BANK: readonly string[] = [
  'Top 10 DeFi protocols on Ethereum ranked by total value locked',
  'Average gas fee on Linea compared to Ethereum over the last 24 hours',
  'Daily active wallets on Base over the last 7 days',
  'Uniswap vs Aerodrome transaction volume on Base over 30 days',
  'Top 20 USDC holders on Base with balance changes over 30 days',
  'Clustering wallets on Base by transaction behavior to flag bots',
  'Daily DEX trading volume on Base broken down by protocol',
  'Farcaster handles with a premium badge',
  'Whale wallet tracker: largest ETH transfers this week',
  'Gas price trends on Ethereum with a 7-day moving average',
  'NFT sales volume by collection with floor price',
  'Token transfers with USD value calculation',
  'Liquidity pool analysis with TVL by trading pair',
  'New wallet creation rate on Solana over the last quarter',
  'Cross-chain bridge volume between Ethereum and Base',
  'Sui transaction throughput over the last 30 days',
  'Stablecoin supply growth across Ethereum, Base, and Linea',
  'Top wallets by transaction count on Base this week',
  'Smart contract deployments on Ethereum by day',
  'Wallet balance distribution for USDC on Ethereum',
  'Token holder concentration for the top ERC-20 tokens',
  'Failed transaction rate on Ethereum by gas price bucket',
  'Validator rewards on Solana over the last epoch',
  'Bridge inflows and outflows on Base by asset',
  'Dormant wallet reactivation on Ethereum this month',
  'Top Farcaster accounts by follower growth',
  'Mempool activity on Ethereum during peak gas hours',
  'Token velocity for the top 50 ERC-20 tokens',
  'Average transaction fee across Ethereum, Base, Linea, and Solana',
  'New token launches on Base this week',
  'Wallet clustering for airdrop eligibility on Base',
  'Uniswap pool fees collected over 30 days',
  'NFT minting activity by collection on Ethereum',
  'Daily gas spend by the top 100 wallets on Ethereum',
  'Solana program invocation counts by day',
  'Cross-chain USDC transfers between Base and Ethereum',
  'Aerodrome liquidity provider returns over 30 days',
  'Sui object creation rate by application',
  'Token approval risk: wallets with unlimited allowances',
  'Base network congestion by hour of day',
  '$1 and a dream: where to actually start on Base',
  'Tracking a whale wallet across Ethereum and Base',
  'Daily active wallets compared across five chains',

  'Sandwich attack detection on Ethereum mempool data',
  'MEV bot profitability over the last 30 days',
  'Arbitrage opportunities between Uniswap and Aerodrome',
  'Staking yield comparison across Solana validators',
  'Restaking flows into EigenLayer-style protocols',
  'DAO governance proposal turnout by voting power',
  'Lending protocol utilization rate on Ethereum',
  'Flash loan volume by protocol this month',
  'Oracle price feed deviation during high volatility',
  'Airdrop farming wallets identified by transaction pattern',
  'Perpetuals funding rate history for top pairs',
  'Rug pull detection: liquidity removal events on Base',
  'Wash trading detection on NFT marketplaces',
  'Gas optimization: contracts with the highest average gas cost',
  'Verified vs unverified smart contracts on Ethereum',
  'Wallet age distribution among active DeFi users',
  'Top wallets by realized profit on Base this month',
  'Token unlock schedule impact on price for top projects',
];

export function pickDocumentTitles(count: number): string[] {
  return fake.helpers.uniqueArray(DOCUMENT_TITLE_BANK, count);
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
