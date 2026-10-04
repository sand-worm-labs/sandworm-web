import { MigrationInterface, QueryRunner } from "typeorm";

type Seed = {
    slug: string;
    title: string;
    sponsor: string;
    type: 'Dashboard' | 'Research' | 'Investigation';
    reward?: string;
    summary: string;
    background: string;
    requirements: string[];
    deliverables: string[];
    prizes?: string[];
    judging?: string[];
    dataHints?: string[];
    // When the sponsor originally posted it, as free text
    postedOn?: string;
    // Where the original bounty was posted. Kept to check the brief against;
    // not shown on the site.
    sourceUrl?: string;
    featured?: boolean;
};

// Analytics bounties that protocols and DAOs really posted elsewhere, rewritten
// to be done in Sandworm, so the pages are not empty before the first live
// bounty. Only ones a Sandworm notebook can answer are listed: EVM chains and
// public APIs.
const BOUNTIES: Seed[] = [
    {
        slug: 'arbitrum-open-analytics',
        title: 'Arbitrum Open Analytics: A Dashboard Worth Sharing',
        sponsor: 'Arbitrum',
        type: 'Dashboard',
        reward: 'Up to 10,000 USDC',
        summary: 'Open brief: pick any question about activity on Arbitrum and build a dashboard good enough to be shared with partners and the wider community.',
        background: 'An open call for the best Arbitrum analysis. There is no set question: the sponsor wants work it would be proud to share with its partners and with everyone else. Most entries to the original bounty were not paid; only the strongest were.',
        requirements: [
            'Choose a question about Arbitrum One that matters to users, builders or the DAO, and state it at the top',
            'Answer it with Arbitrum onchain data',
            'Explain what the charts show and why it matters',
        ],
        deliverables: [
            'A published Sandworm notebook with the question, the charts and the findings',
        ],
        prizes: [
            'Up to 10,000 USDC for the best entries',
            'Many entries are not paid: only the best are rewarded',
        ],
        judging: [
            'Would the sponsor share it with partners as it is?',
            'Accuracy of the numbers',
            'Clarity of the charts and the write-up',
            'Originality of the question',
        ],
        dataHints: [
            'Blockscout for Arbitrum transactions, token transfers and holders, with no key',
            'growthepie and L2BEAT for Arbitrum activity, fees and value secured next to other rollups',
            'DefiLlama for TVL, volume and fees of protocols on Arbitrum',
        ],
        postedOn: 'July 2022',
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
        background: 'The Arbitrum DAO pays for evidence that a recipient of DAO funds broke the terms, objectives or spirit of their grant. Misuse is any action or inaction by a recipient that goes against what the funds were given for: incentives that were never distributed, ARB sold or sent to the team, or funds left idle. A committee reviews each report, which takes several weeks at least.',
        requirements: [
            'Name the grant: the program, the recipient and what the ARB was given for',
            'Trace the ARB from the grant wallet: where it went, when, and how much',
            'Compare the flows with what the grant terms or the recipient\'s reports say',
            'Rate the severity (low, medium or high) and say why',
        ],
        deliverables: [
            'A Sandworm notebook with the wallets, the transfers and the timeline as evidence',
            'A short written conclusion the committee can act on',
        ],
        prizes: [
            'Low severity: 1,000 ARB, up to $10k with the recovery bonus',
            'Medium severity: 5,000 ARB, up to $25k with the recovery bonus',
            'High severity: 10,000 ARB, up to $100k with the recovery bonus',
            '10% of any recovered funds, paid in the recovered asset',
        ],
        judging: [
            'Is it backed by onchain evidence?',
            'Is the misuse clear against the grant\'s own terms?',
            'Can the committee check every step?',
        ],
        dataHints: [
            'Blockscout for the token transfers of a wallet on Arbitrum',
            'Etherscan V2 for transfers of the same wallet on other chains',
            'Grant terms and reports are public on the Arbitrum forum',
        ],
        postedOn: 'Running since September 2025',
        sourceUrl: 'https://forum.arbitrum.foundation/t/the-watchdog-program-get-rewarded-for-reporting-suspected-grant-misuse/29919',
        featured: true,
    },
    {
        slug: 'uniswap-v3-community-dashboards',
        title: 'Uniswap V3: How Do Liquidity Providers Really Do?',
        sponsor: 'Uniswap Grants',
        type: 'Dashboard',
        reward: 'Up to $5,000',
        summary: 'Show how the top Uniswap V3 liquidity providers behave and what they earn, and compare the fees LPs collect at each fee tier and position size.',
        background: 'Uniswap Grants paid $25,000 across a set of community dashboards on Uniswap V3. Two of the questions were about liquidity providers: how the biggest ones manage their positions, and whether concentrated liquidity actually earns LPs more than V2 did.',
        requirements: [
            'Who are the top liquidity providers since V3 launched?',
            'How do their daily actions (adding, removing, moving liquidity) follow daily price changes?',
            'How wide are the price ranges of their positions, and does that vary by pool or fee tier?',
            'How much do they spend in fees to manage positions?',
            'Fees earned relative to liquidity provided, V3 against V2',
            'Fees collected by LPs with $1k, $10k, $100k and $1M+ provided, per fee tier',
        ],
        deliverables: [
            'A published Sandworm notebook with a chart for each question and a short reading of each',
        ],
        prizes: [
            'Up to $5,000 per winning dashboard, from a $25,000 pool',
        ],
        judging: [
            'Accuracy of the numbers',
            'Clarity: can the community read it without help?',
            'Insight into LP behaviour beyond the raw totals',
        ],
        dataHints: [
            'Etherscan V2 for the Uniswap V3 pool and position manager contract logs',
            'DefiLlama for Uniswap volume, fees and TVL by chain',
            'GeckoTerminal for pool liquidity and price history',
        ],
        postedOn: 'May 2021',
        sourceUrl: 'https://flipsidecrypto.substack.com/p/the-bounty-brief-7',
        featured: true,
    },
    {
        slug: 'optimism-s6-growth-grants-analysis',
        title: 'Analysis of Optimism Season 6 Growth Grants',
        sponsor: 'Optimism Foundation',
        type: 'Research',
        reward: '10,000 OP',
        summary: 'Measure what the Season 6 growth grants achieved: where the OP went, how it was used, and whether activity rose because of it, normalised by grant size and duration.',
        background: 'The Optimism Collective gives growth grants to projects but had no consistent way to judge them: past reviews were one-off deep dives. The Foundation wants a metrics-driven analysis of the Season 6 grants that can be rerun every season and on other OP Chains.',
        requirements: [
            'Allocation: how the OP was spread across projects, verticals and incentive types, and which areas got too little',
            'Utilisation: how and for what recipients deployed their OP',
            'Baselines: the value of each success metric before the grant, to benchmark future seasons',
            'Impact: each grant\'s effect, comparing the incentive period against a control',
            'Normalise by the amount of OP and the length of the incentive period',
            'Causality: how far the metric changes can be put down to the grants',
            'Built so it can be rerun next season',
        ],
        deliverables: [
            'A methodology, agreed with the sponsor before the analysis starts',
            'A written report of the key findings',
            'A published Sandworm notebook of the success metrics',
        ],
        prizes: [
            '10,000 OP to one team, locked for a year',
            'Can be clawed back if critical milestones are missed',
        ],
        judging: [
            'Methodology the Foundation approves',
            'Adopted by the Grants Council to evaluate Season 6',
            'Reused by other OP Chains',
        ],
        dataHints: [
            'growthepie and L2BEAT for OP Mainnet activity over time',
            'DefiLlama for the TVL, volume and fees of each grantee protocol',
            'Etherscan V2 for OP transfers out of grant wallets',
        ],
        postedOn: 'August 2024',
        sourceUrl: 'https://github.com/ethereum-optimism/ecosystem-contributions/issues/244',
    },
    {
        slug: 'optimism-badgeholder-onchain-analysis',
        title: 'Badgeholder Onchain Analysis',
        sponsor: 'Optimism Foundation',
        type: 'Research',
        reward: '1,000 OP per team',
        summary: 'Compare Optimism badgeholders with other active users: how long and how much they use the Superchain, what they use it for, and how many have deployed contracts.',
        background: 'Badgeholders vote in Optimism\'s Citizens\' House. Before widening citizenship, the Foundation wants to know how badgeholders use the chain compared with other active users. Badgeholders are the recipients of attestations with EAS schema 0xfdcfdad2dbe7489e0ce56b260348b7f14e8365a8a325aef9834818c00d46b31b from the attester 0x621477dBA416E12df7FF0d48E14c4D20DC85D7D9. Results must be shown for the group, never for one person.',
        requirements: [
            'How long have badgeholders been active on Superchain chains, compared with other active users?',
            'How active is each badgeholder on Superchain chains compared with other chains?',
            'Which activity percentiles do badgeholders fall into among active Superchain users?',
            'How is their activity split across social, NFTs, DeFi and DAO governance, compared with other users?',
            'What share have linked their address to a Farcaster account?',
            'What share have deployed contracts to Optimism from the address that holds their badge?',
            'Answer at least 4 of the 6. Bonus: early against later badgeholders',
        ],
        deliverables: [
            'A proposal for the comparison group of active users, with its limitations',
            'A published Sandworm notebook of the aggregated results',
        ],
        prizes: [
            '1,000 OP per team, up to two teams, locked for a year',
        ],
        judging: [
            'Methodology approved by the Foundation before the analysis',
            'How often governance discussions link to it afterwards',
        ],
        dataHints: [
            'Etherscan V2 for transactions and contract deployments of each badgeholder address on OP Mainnet and other chains',
            'The EAS attestations above give the badgeholder list',
        ],
        postedOn: 'May 2024',
        sourceUrl: 'https://github.com/ethereum-optimism/ecosystem-contributions/issues/191',
    },
    {
        slug: 'pyth-usage-on-evm-chains',
        title: 'Create a Dashboard: Pyth Usage on EVM Chains',
        sponsor: 'Pyth',
        type: 'Dashboard',
        reward: '4,500 PYTH',
        summary: 'Show how Pyth price feeds are used across at least ten EVM chains: the contracts and users that depend on them, price update activity and the fees paid for it.',
        background: 'Pyth wants its community to see oracle usage across every EVM chain it supports: which chains, which price feeds and asset classes, and who the main users are.',
        requirements: [
            'At least 10 EVM chains, with the list of chains covered',
            'Unique contracts using Pyth, in total and daily, and by chain',
            'Contracts ranked by how often they use Pyth',
            'Unique wallets using apps that rely on Pyth, daily and cumulative, by chain',
            'Price update requests, in total and daily, by chain and by asset class',
            'Fees and transaction costs paid by those requesting updates, in total and daily',
        ],
        deliverables: [
            'A published Sandworm notebook covering at least 10 EVM chains',
        ],
        prizes: [
            '1st: 2,500 PYTH',
            '2nd: 1,250 PYTH',
            '3rd: 750 PYTH',
            'Winners could earn 2,500 PYTH more for an improved version',
        ],
        judging: [
            'Relevance and accuracy of the data points',
            'Quality of the charts',
            'How quickly a reader gets the picture of Pyth usage',
        ],
        dataHints: [
            'Etherscan V2 for the logs of the Pyth contract on each chain, with one key',
            'Pyth\'s docs list its contract address on each EVM chain',
        ],
        postedOn: 'May 2024',
        sourceUrl: 'https://superteam.fun/earn/listing/dashboard-pyth-usage-on-evm-chains',
    },
    {
        slug: 'pyth-entropy-usage-on-evm-chains',
        title: 'Create a Dashboard: Pyth Entropy Usage on EVM Chains',
        sponsor: 'Pyth',
        type: 'Dashboard',
        reward: '1,500 PYTH',
        summary: 'Track how Pyth Entropy, its onchain random number generator, is used across at least five EVM chains: requests, success rates, revenue and the providers serving them.',
        background: 'Entropy lets contracts request secure random numbers onchain, for things like NFT mints and games. Pyth wants a view of who uses it and how well the providers that answer requests perform.',
        requirements: [
            'At least 5 EVM chains, Blast included',
            'Entropy requests per chain and per protocol, daily and cumulative',
            'Success rates per chain and per protocol, daily and overall',
            'DAO revenue from Entropy, daily and cumulative',
            'Contracts using Entropy and the gas they spend',
            'Per provider: wallet, requests fulfilled, revenue, gas, and the blocks between request and response',
        ],
        deliverables: [
            'A published Sandworm notebook covering at least 5 EVM chains',
        ],
        prizes: [
            '1st: 1,500 PYTH',
        ],
        judging: [
            'Relevance and accuracy of the data points',
            'Quality of the charts',
            'Insights the Entropy team can act on',
        ],
        dataHints: [
            'Etherscan V2 for the logs of the Entropy contract on each chain, Blast included',
            'Pyth\'s docs list the Entropy contract and provider addresses per chain',
        ],
        sourceUrl: 'https://superteam.fun/earn/listing/developer-dashboard-pyth-entropy-usage-on-evm-chains',
    },
    {
        slug: 'dhedge-v2-on-polygon',
        title: 'Create a Dashboard: dHEDGE V2 on Polygon',
        sponsor: 'dHEDGE',
        type: 'Dashboard',
        reward: '$3,000 USDC',
        summary: 'Show dHEDGE V2 pools on Polygon: total value locked, investors and managers per pool, the assets each pool holds, and trading fees sent to the treasury.',
        background: 'dHEDGE is an asset management protocol where managers run pools that investors deposit into. It wanted a community dashboard of its V2 pools on Polygon.',
        requirements: [
            'TVL of every pool',
            'Unique investor addresses per pool',
            'Unique manager addresses per pool',
            'The assets in each pool and their value',
            'Total trading fees sent to the dHEDGE treasury, 0x6f005cbceC52FFb28aF046Fd48CB8D6d19FD25E3',
        ],
        deliverables: [
            'A published Sandworm notebook with at least the views above',
        ],
        prizes: [
            '$3,000 USDC',
        ],
        judging: [
            'Shows every required view; more is welcome',
        ],
        dataHints: [
            'Etherscan V2 for the dHEDGE pool contracts and the treasury\'s transfers on Polygon',
            'dHEDGE publishes its V2 contract addresses in its V2-Public GitHub repository',
            'DefiLlama for dHEDGE TVL to check your totals against',
        ],
        postedOn: 'August 2021',
        sourceUrl: 'https://github.com/dhedge/dhedge-docs/issues/5',
    },
    {
        slug: 'lynex-on-linea-dashboard',
        title: 'Create a Dashboard for Lynex on Linea',
        sponsor: 'Lynex',
        type: 'Dashboard',
        reward: '$20,000 reward pool',
        summary: 'Build a dashboard of Lynex, the liquidity marketplace on Linea. The best submissions share a $20,000 pool.',
        background: 'Lynex is an onchain liquidity marketplace on Linea. It opened a dashboard bounty to its whole community and left the choice of metrics to the entrants.',
        requirements: [
            'Choose the views of Lynex that matter most: liquidity, volume, fees, emissions, voting',
            'Show them over time',
        ],
        deliverables: [
            'A published Sandworm notebook about Lynex',
        ],
        prizes: [
            '1st: $10,000 in LYNX, oLYNX and bveLYNX',
            '3rd: $4,000 in LYNX, oLYNX and bveLYNX',
            'The rest of the $20,000 pool to the other top entries',
        ],
        judging: [
            'Data accuracy',
            'Quality of the charts',
            'Insights',
            'Overall ease of use',
        ],
        dataHints: [
            'DefiLlama for Lynex TVL, volume and fees',
            'GeckoTerminal for Lynex pools on Linea',
            'Etherscan V2 for Lynex contract logs on Linea',
        ],
        postedOn: 'June 2024',
        sourceUrl: 'https://medium.com/@lynexfi/create-a-dune-analytics-dashboard-for-lynex-and-get-reward-c521945ee12d',
    },
    {
        slug: 'optimism-dexs-velodrome-compared',
        title: 'Optimism DEXs: How Does Velodrome Compare?',
        sponsor: 'Optimism',
        type: 'Dashboard',
        reward: 'Up to 225 USDC',
        summary: 'Compare Velodrome with another DEX on Optimism: daily swaps, active wallets, the most popular pairs and the ten most swapped assets.',
        background: 'Velodrome is the largest DEX on Optimism. The sponsor wanted to see how it stacks up against the others.',
        requirements: [
            'Pick another Optimism DEX to compare Velodrome with',
            'Swaps per day over the last month',
            'Wallets swapping per day',
            'The most popular pairs, from and to',
            'The top 10 assets swapped from, and the top 10 swapped to',
        ],
        deliverables: [
            'A published Sandworm notebook comparing the two DEXs on each view',
        ],
        prizes: [
            'Up to 225 USDC',
        ],
        dataHints: [
            'DefiLlama for DEX volume on Optimism',
            'GeckoTerminal for the pools of each DEX on Optimism',
            'Etherscan V2 for swap logs of each DEX\'s contracts',
        ],
        postedOn: 'July 2022',
        sourceUrl: 'https://flipsidecrypto.substack.com/p/bounty-brief-68',
    },
    {
        slug: 'quixotic-nft-sales-dashboard',
        title: 'Quixotic NFT Sales Dashboard',
        sponsor: 'Optimism',
        type: 'Dashboard',
        reward: 'Up to 150 USDC',
        summary: 'Build a dashboard of secondary NFT sales on Quixotic, the largest NFT marketplace on Optimism at the time, and point out the key trends.',
        background: 'Quixotic was the main NFT marketplace on Optimism. The sponsor wanted a view of its secondary market.',
        requirements: [
            'Secondary sales on Quixotic over time: count, volume and buyers',
            'The most traded collections',
            'The most interesting trends you can find in the market',
        ],
        deliverables: [
            'A published Sandworm notebook of the market and its trends',
        ],
        prizes: [
            'Up to 150 USDC',
        ],
        dataHints: [
            'Etherscan V2 for the Quixotic exchange contract\'s logs on Optimism',
        ],
        postedOn: 'July 2022',
        sourceUrl: 'https://flipsidecrypto.substack.com/p/bounty-brief-68',
    },
    {
        slug: 'uniswap-v2-vs-v3-volume',
        title: 'Uniswap V2 vs V3: Has the Volume Split Settled?',
        sponsor: 'Uniswap',
        type: 'Research',
        reward: 'Up to 18.70 UNI',
        summary: 'Chart trading volume on Uniswap V2 against V3 over six months and say whether the gap between them has stabilised or is still moving.',
        background: 'When V3 launched, volume moved over from V2 unevenly. The question is whether the split between the two versions has settled.',
        requirements: [
            'Daily volume on V2 and on V3 over the latest six months',
            'The share of volume on each version over the same period',
            'A clear answer: has the split stabilised, or is it still changing?',
        ],
        deliverables: [
            'A published Sandworm notebook with the charts and the answer',
        ],
        prizes: [
            'Up to 18.70 UNI',
        ],
        dataHints: [
            'DefiLlama for daily volume of Uniswap V2 and V3 separately',
        ],
        postedOn: '2021',
        sourceUrl: 'https://flipsidecrypto.substack.com/p/bounty-brief-22',
    },
    {
        slug: 'op-airdrop-claims-and-holders',
        title: 'The OP Airdrop: Who Claimed, Who Held, Who Delegated?',
        sponsor: 'Optimism',
        type: 'Research',
        reward: 'Up to 75 USDC',
        summary: 'How many wallets claimed the first OP airdrop and how much of it was claimed? How many still hold their tokens, and how many delegated them?',
        background: 'Months after Optimism\'s first airdrop, the sponsor wanted to know what recipients did with their OP.',
        requirements: [
            'How many wallets claimed the airdrop?',
            'How much of the total airdrop was claimed?',
            'How many claiming wallets still hold the tokens?',
            'How much of the claimed OP was delegated?',
            'Optional: anything that relates to the OP price',
        ],
        deliverables: [
            'A published Sandworm notebook answering each question',
        ],
        prizes: [
            'Up to 75 USDC',
        ],
        dataHints: [
            'Etherscan V2 for claim events of the airdrop contract and OP transfers on OP Mainnet',
            'Etherscan V2 for delegation events of the OP token',
        ],
        postedOn: 'November 2022',
        sourceUrl: 'https://flipsidecrypto.substack.com/p/bounty-brief-83',
    },
    {
        slug: 'why-defi-should-migrate-to-pull-oracles',
        title: 'Research Article: Why DeFi Protocols Should Migrate to Pull Oracles',
        sponsor: 'Pyth',
        type: 'Research',
        reward: '1,999 PYTH',
        summary: 'Make the case, with data, for pull oracles over push oracles: cost, latency and the risks each design carries.',
        background: 'Push oracles have permissioned operators update prices onchain on a schedule. Pull oracles update the onchain price only when someone asks: the user fetches a signed update off chain, and it is verified and stored onchain. Pyth uses the pull model and wants a researched case for it.',
        requirements: [
            'Explain how push and pull oracles differ',
            'Compare them with numbers: update costs, latency, freshness of prices, and the risks of each',
            'Refer to Pyth and its competitors',
            'Make the method and the data sources clear',
            '1,000 to 2,000 words',
        ],
        deliverables: [
            'A published Sandworm notebook with the article and the charts behind it',
        ],
        prizes: [
            '1st: 1,000 PYTH',
            '2nd: 666 PYTH',
            '3rd: 333 PYTH',
        ],
        judging: [
            'Originality of the insights',
            'Rigour and quantitative evidence',
            'Quality of the data and openness of the method',
        ],
        dataHints: [
            'Etherscan V2 for price update transactions and their gas on each chain',
            'DefiLlama for the value secured by each oracle',
        ],
        postedOn: 'May 2024',
        sourceUrl: 'https://superteam.fun/earn/listing/research-or-why-should-defi-protocols-migrate-from-push-to-pull-oracles',
    },
    {
        slug: 'entropy-as-a-new-entrant-for-onchain-rng',
        title: 'Research Article: Entropy as a New Entrant for On-Chain RNG',
        sponsor: 'Pyth',
        type: 'Research',
        reward: '1,999 PYTH',
        summary: 'Explain how Pyth Entropy generates random numbers onchain and how it compares with other providers on adoption, cost and design.',
        background: 'Entropy is Pyth\'s onchain random number generator. Pyth wants a researched article on how it works and how it could help DeFi and the wider onchain world grow.',
        requirements: [
            'Explain how Entropy works',
            'Compare it with other onchain randomness providers on adoption, cost and design, with data',
            'Make the method and the data sources clear',
            '1,000 to 2,000 words',
        ],
        deliverables: [
            'A published Sandworm notebook with the article and the charts behind it',
        ],
        prizes: [
            '1st: 1,000 PYTH',
            '2nd: 666 PYTH',
            '3rd: 333 PYTH',
        ],
        judging: [
            'Originality',
            'Rigorous evidence and analysis',
            'A clear, logical method',
        ],
        dataHints: [
            'Etherscan V2 for request and fulfilment logs of Entropy and other randomness contracts',
        ],
        postedOn: 'May 2024',
        sourceUrl: 'https://superteam.fun/earn/listing/research-or-entropy-as-a-new-entrant-for-on-chain-randomness',
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
                "status" character varying NOT NULL DEFAULT 'open',
                "summary" text NOT NULL,
                "background" text,
                "requirements" jsonb NOT NULL DEFAULT '[]',
                "deliverables" jsonb NOT NULL DEFAULT '[]',
                "prizes" jsonb NOT NULL DEFAULT '[]',
                "judging" jsonb NOT NULL DEFAULT '[]',
                "data_hints" jsonb NOT NULL DEFAULT '[]',
                "winners" jsonb NOT NULL DEFAULT '[]',
                "posted_on" character varying,
                "source_url" character varying,
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
                `INSERT INTO "bounty" ("slug", "title", "sponsor", "type", "reward", "summary", "background", "requirements", "deliverables",
                    "prizes", "judging", "data_hints", "posted_on", "source_url", "sample", "featured", "position")
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, true, $15, $16)`,
                [
                    b.slug, b.title, b.sponsor, b.type, b.reward ?? null, b.summary, b.background,
                    JSON.stringify(b.requirements), JSON.stringify(b.deliverables), JSON.stringify(b.prizes ?? []),
                    JSON.stringify(b.judging ?? []), JSON.stringify(b.dataHints ?? []),
                    b.postedOn ?? null, b.sourceUrl ?? null, b.featured ?? false, position,
                ],
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "bounty"`);
    }
}
