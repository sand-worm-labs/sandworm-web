import { MigrationInterface, QueryRunner } from "typeorm";

type Seed = {
    slug: string;
    title: string;
    sponsor: string;
    type: 'Dashboard' | 'Research' | 'Investigation';
    reward?: string;
    summary: string;
    judging?: string[];
    // Where the original bounty was posted
    sourceUrl?: string;
    featured?: boolean;
};

// Past analytics bounties that protocols and DAOs really posted, so the pages
// are not empty before the first live bounty is added. Only ones that can be
// answered in a Sandworm notebook are listed: EVM chains and public APIs.
const BOUNTIES: Seed[] = [
    {
        slug: 'arbitrum-open-analytics',
        title: 'Arbitrum Open Analytics: A Dashboard Worth Sharing',
        sponsor: 'Arbitrum (via Flipside)',
        type: 'Dashboard',
        reward: 'Up to 10,000 USDC',
        summary: 'Open brief: pick any question about activity on Arbitrum and build a dashboard good enough to be shared with partners and the wider community.',
        sourceUrl: 'https://flipsidecrypto.substack.com/p/bounty-brief-68',
        featured: true,
    },
    {
        slug: 'arbitrum-grant-misuse-investigation',
        title: 'Investigate How an Arbitrum DAO Grant Was Spent',
        sponsor: 'Arbitrum DAO Watchdog',
        type: 'Investigation',
        reward: 'Up to 10,000 ARB, plus 10% of recovered funds',
        summary: 'Trace a grant recipient\'s ARB onchain and report, with evidence, whether it was used as the grant said or sold, idled or sent elsewhere.',
        judging: [
            '5,000 ARB for a medium severity report, 10,000 ARB for high severity',
            '10% of any recovered funds, capped at $25k (medium) or $100k (high)',
            'Reports must be backed by evidence',
        ],
        sourceUrl: 'https://forum.arbitrum.foundation/t/the-watchdog-program-get-rewarded-for-reporting-suspected-grant-misuse/29919',
        featured: true,
    },
    {
        slug: 'uniswap-v3-community-dashboards',
        title: 'Create a Dashboard: Uniswap V3 for the Community',
        sponsor: 'Uniswap Grants',
        type: 'Dashboard',
        reward: 'Up to $5,000 in UNI',
        summary: 'Build a public, accessible and easy to read data dashboard about Uniswap V3 for the community to use.',
        judging: [
            '$5,000 in UNI for each of 3 finalists',
            '$2,500 in UNI for each of 2 runners-up',
            '$250 in UNI for qualified participants',
            'Finalists are fast-tracked for a grant to build a fuller dashboard',
        ],
        featured: true,
    },
    {
        slug: 'optimism-s6-growth-grants-analysis',
        title: 'Analysis of Optimism Season 6 Growth Grants',
        sponsor: 'Optimism Foundation',
        type: 'Research',
        reward: '10,000 OP',
        summary: 'Measure what the Season 6 growth grants achieved: where the OP went, how it was used, and whether activity rose because of it, normalised by grant size and duration.',
        judging: [
            'A written report of the key findings',
            'A public dashboard of the success metrics',
            'A methodology document so the analysis can be repeated next season',
        ],
        sourceUrl: 'https://github.com/ethereum-optimism/ecosystem-contributions/issues/244',
    },
    {
        slug: 'optimism-badgeholder-onchain-analysis',
        title: 'Badgeholder Onchain Analysis',
        sponsor: 'Optimism Foundation',
        type: 'Research',
        reward: '1,000 OP per team',
        summary: 'Compare Optimism badgeholders with other active users: how long and how much they use the Superchain, what they use it for, and how many have deployed contracts.',
        judging: [
            'Answer at least 4 of the 6 research questions',
            'A public dashboard or a report of the aggregated data',
            'Methodology is agreed before the analysis starts',
        ],
        sourceUrl: 'https://github.com/ethereum-optimism/ecosystem-contributions/issues/191',
    },
    {
        slug: 'pyth-usage-on-evm-chains',
        title: 'Create a Dashboard: Pyth Usage on EVM Chains',
        sponsor: 'Pyth',
        type: 'Dashboard',
        summary: 'Show how Pyth price feeds are used across EVM chains: value secured, the protocols that depend on it, fees and price update activity.',
    },
    {
        slug: 'dhedge-v2-on-polygon',
        title: 'Create a Dashboard: dHEDGE V2 on Polygon',
        sponsor: 'dHEDGE',
        type: 'Dashboard',
        reward: '$3,000 USDC',
        summary: 'Show dHEDGE V2 pools on Polygon: total value locked, investors and managers per pool, the assets each pool holds, and trading fees sent to the treasury.',
        sourceUrl: 'https://github.com/dhedge/dhedge-docs/issues/5',
    },
    {
        slug: 'lynex-on-linea-dashboard',
        title: 'Create a Dashboard for Lynex on Linea',
        sponsor: 'Lynex',
        type: 'Dashboard',
        reward: '$20,000 reward pool',
        summary: 'Build a dashboard of the Lynex exchange on Linea. The best submissions share the reward pool.',
        sourceUrl: 'https://medium.com/@lynexfi/create-a-dune-analytics-dashboard-for-lynex-and-get-reward-c521945ee12d',
    },
    {
        slug: 'optimism-dexs-velodrome-compared',
        title: 'Optimism DEXs: How Does Velodrome Compare?',
        sponsor: 'Optimism (via Flipside)',
        type: 'Dashboard',
        reward: 'Up to 225 USDC',
        summary: 'Compare Velodrome with the other DEXs on Optimism: daily swaps, active wallets, the most popular pairs and the ten most swapped assets.',
        sourceUrl: 'https://flipsidecrypto.substack.com/p/bounty-brief-68',
    },
    {
        slug: 'quixotic-nft-sales-dashboard',
        title: 'Quixotic NFT Sales Dashboard',
        sponsor: 'Optimism (via Flipside)',
        type: 'Dashboard',
        reward: 'Up to 150 USDC',
        summary: 'Build a dashboard of secondary NFT sales on Quixotic, the Optimism marketplace, and point out the key trends.',
        sourceUrl: 'https://flipsidecrypto.substack.com/p/bounty-brief-68',
    },
    {
        slug: 'uniswap-v2-vs-v3-volume',
        title: 'Uniswap V2 vs V3: Has the Volume Split Settled?',
        sponsor: 'Uniswap (via MetricsDAO)',
        type: 'Research',
        summary: 'Chart trading volume on Uniswap V2 against V3 over the past six months and say whether the gap between them has stabilised or is still moving.',
        sourceUrl: 'https://medium.com/metricsdao/metricsdao-bounty-breakdown-82a392bcfdde',
    },
    {
        slug: 'op-airdrop-claims-and-holders',
        title: 'The OP Airdrop: Who Claimed, Who Held, Who Delegated?',
        sponsor: 'Optimism (via Flipside)',
        type: 'Research',
        summary: 'How many wallets claimed the OP airdrop and how much of it was claimed? How many still hold their tokens, and how many delegated them?',
        sourceUrl: 'https://flipsidecrypto.substack.com/p/bounty-brief-22',
    },
    {
        slug: 'why-defi-should-migrate-to-pull-oracles',
        title: 'Research Article: Why DeFi Protocols Should Migrate to Pull Oracles',
        sponsor: 'Pyth',
        type: 'Research',
        summary: 'Make the case, with data, for pull oracles over push oracles: cost, latency and the risks each design carries.',
    },
    {
        slug: 'entropy-as-a-new-entrant-for-onchain-rng',
        title: 'Research Article: Entropy as a New Entrant for On-Chain RNG',
        sponsor: 'Pyth',
        type: 'Research',
        summary: 'Compare Pyth Entropy with other onchain randomness providers: adoption, cost and how each one works.',
    },
];

export class CreateBountyTable1783400000000 implements MigrationInterface {
    name = 'CreateBountyTable1783400000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "bounty" (
                "slug" character varying NOT NULL,
                "title" character varying NOT NULL,
                "sponsor" character varying NOT NULL,
                "type" character varying NOT NULL,
                "reward" character varying,
                "source_url" character varying,
                "status" character varying NOT NULL DEFAULT 'open',
                "summary" text NOT NULL,
                "judging" jsonb NOT NULL DEFAULT '[]',
                "winners" jsonb NOT NULL DEFAULT '[]',
                "sample" boolean NOT NULL DEFAULT false,
                "featured" boolean NOT NULL DEFAULT false,
                "position" integer NOT NULL DEFAULT 0,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "PK_bounty_slug" PRIMARY KEY ("slug")
            )
        `);

        for (const [position, b] of BOUNTIES.entries()) {
            await queryRunner.query(
                `INSERT INTO "bounty" ("slug", "title", "sponsor", "type", "reward", "summary", "judging", "source_url", "sample", "featured", "position")
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, $9, $10)`,
                [b.slug, b.title, b.sponsor, b.type, b.reward ?? null, b.summary, JSON.stringify(b.judging ?? []), b.sourceUrl ?? null, b.featured ?? false, position],
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "bounty"`);
    }
}
