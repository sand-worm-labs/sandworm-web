export type RewardToken = {
  symbol: string;
  name: string;
  logo: string;
  arbitrum: string | null;
};

export const REWARD_TOKENS: RewardToken[] = [
  {
    symbol: "USDC",
    name: "USD Coin",
    logo: "/img/tokens/usdc.png",
    arbitrum: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  },
  {
    symbol: "USDG",
    name: "Global Dollar",
    logo: "/img/tokens/usdg.png",
    arbitrum: "0x004B506865409877C9fA29bfb1ebA929984B9bbC",
  },
  {
    symbol: "ARB",
    name: "Arbitrum",
    logo: "/img/tokens/arb.jpg",
    arbitrum: "0x912CE59144191C1204E64559FE8253a0e49E6548",
  },
  {
    symbol: "UNI",
    name: "Uniswap",
    logo: "/img/tokens/uni.png",
    arbitrum: "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0",
  },
  {
    symbol: "PYTH",
    name: "Pyth Network",
    logo: "/img/tokens/pyth.png",
    arbitrum: "0xE4D5c6aE46ADFAF04313081e8C0052A30b6Dd724",
  },
  {
    symbol: "MNT",
    name: "Mantle",
    logo: "/img/tokens/mnt.png",
    arbitrum: null,
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    logo: "/img/tokens/usdt.png",
    arbitrum: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
  },
  {
    symbol: "DAI",
    name: "Dai",
    logo: "/img/tokens/dai.png",
    arbitrum: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
  },
  {
    symbol: "WETH",
    name: "Wrapped Ether",
    logo: "/img/tokens/weth.png",
    arbitrum: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
  },
  {
    symbol: "OP",
    name: "Optimism",
    logo: "/img/tokens/op.png",
    arbitrum: null,
  },
];

export const rewardToken = (reward: string | null | undefined) =>
  REWARD_TOKENS.find(token =>
    new RegExp(`\\b${token.symbol}\\b`).test(reward ?? "")
  ) ?? null;
