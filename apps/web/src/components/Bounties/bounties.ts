import type { GetBountiesQuery, GetBountyQuery } from "@/generated/graphql";

// =====================================
// ⬢ Types
// =====================================
export type Bounty = GetBountiesQuery["getBounties"][number];
export type BountyDetails = NonNullable<GetBountyQuery["getBounty"]>;

// onchainId is set once the reward is locked in escrow.
export type BountyRef = Pick<Bounty, "slug" | "title" | "status" | "onchainId">;

// =====================================
// ⬢ Helpers
// =====================================
export const bountyTag = (slug: string) => `bounty-${slug}`;

const PROMPT_DETAILS_CHARS = 2500;

const section = (
  title: string,
  items: string[] | string | null | undefined
) => {
  const body = Array.isArray(items)
    ? items.map(item => `- ${item}`).join("\n")
    : items?.trim();
  return body ? `\n## ${title}\n${body}\n` : "";
};

// What the AI panel is asked when someone starts a bounty: the whole brief,
// so the starter notebook answers this bounty and not a generic one.
export const bountyStarterPrompt = (bounty: BountyDetails) =>
  [
    `I just started the bounty "${bounty.title}" (sponsored by ${bounty.sponsor}).`,
    "Build me a starter notebook for it in this notebook.",
    "Open with a markdown cell that restates the brief, then add a SQL or Python cell for each question below, and a chart where one helps. Run what you add and fix any errors. Do not invent figures.",
    section("Summary", bounty.summary),
    section("Details", bounty.details?.slice(0, PROMPT_DETAILS_CHARS)),
    section("Background", bounty.background),
    section("What to answer", bounty.requirements),
    section("What to submit", bounty.deliverables),
    section("How it is judged", bounty.judging),
    section("Data hints", bounty.dataHints),
  ]
    .filter(Boolean)
    .join("\n");

export const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  open: "Open",
  judging: "Judging",
  closed: "Closed",
};

export type RewardToken = {
  symbol: string;
  name: string;
  logo: string;
  arbitrum: string | null;
};

// =====================================
// ⬢ Reward Tokens
// =====================================
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

// =====================================
// ⬢ Sponsors
// =====================================
export const SPONSOR_DOMAINS: Record<string, string> = {
  Arbitrum: "arbitrum.io",
  "Arbitrum DAO Watchdog": "arbitrum.foundation",
  Uniswap: "uniswap.org",
  "Uniswap Grants": "uniswapfoundation.org",
  Optimism: "optimism.io",
  "Optimism Foundation": "optimism.io",
  Pyth: "pyth.network",
  dHEDGE: "dhedge.org",
  Lynex: "lynex.fi",
  Mantle: "mantle.xyz",
};
