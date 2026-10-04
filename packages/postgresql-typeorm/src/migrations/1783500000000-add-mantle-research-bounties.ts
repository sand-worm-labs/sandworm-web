import { MigrationInterface, QueryRunner } from "typeorm";

// Mantle's Research Challenge (June 16 to July 3, 2026), listed as two closed
// example bounties, one per track. The challenge paid $6,000 in MNT to 30
// winners across both tracks; the announcement does not split it by track.
const SOURCE_URL = 'https://x.com/Mantle_Official/article/2066880937271722093';

const SHARED_RULES = {
    sponsor: 'Mantle',
    type: 'Research',
    status: 'closed',
    reward: 'Share of $6,000 in MNT',
    prizes: [
        '$6,000 in MNT shared by 30 winners across both tracks',
        'One prize per track per person: you can win in both tracks, once each',
    ],
    judging: [
        'Quality',
        'Accuracy',
        'Originality',
        'Depth of research',
    ],
    postedOn: 'June 2026',
};

const BOUNTIES = [
    {
        ...SHARED_RULES,
        slug: 'mantle-research-challenge-deep-dive',
        title: 'Mantle Research Challenge: The Research Deep Dive',
        summary: 'Pick a recent move in onchain finance, such as tokenized stocks and RWAs on Mantle, explain with data why it happened, and make the case for what comes next.',
        background: 'Mantle argues that issuing tokenized assets is the easy part and distribution is the hard one: getting capital market assets from issuance to global markets without friction, borders or unnecessary intermediaries. It asked researchers to take a position on that and back it with research. Recent Mantle news it pointed to: tokenized SpaceX (SPCXx) from xStocks live on Mantle, tokenized equities via Fluxion and Bybit, the InsightX prediction market, and RWA TVL on Mantle up 27% to $247.5M in Q1 2026.',
        requirements: [
            'Choose a market move in onchain finance: RWAs, tokenized stocks and IPOs, Mantle ecosystem news, or another major trend',
            'Explain why it happened',
            'Make a clear, well-supported case for what comes next',
            'Use one or more angles: follow the data, tell the story behind the move, track the narrative, or compare the key players',
        ],
        deliverables: [
            'A published Sandworm notebook with the research piece and the data behind it',
            'For the original challenge: a post on X tagging @Mantle_Official, submitted through Mantle\'s participation form',
        ],
        position: 100,
    },
    {
        ...SHARED_RULES,
        slug: 'mantle-research-challenge-agent',
        title: 'Mantle Research Challenge: The Research Agent',
        summary: 'Build a research agent, tool, dashboard or workflow that helps people research onchain finance, and show one live example of it working.',
        background: 'Mantle wanted to see how AI tools change the way onchain research is done. Entries could be an AI research agent, with bonus points for using Mantle\'s AI Agent Skills, or a tool, script, dashboard or workflow someone uses to research onchain finance. Mantle pointed to its agent stack, ERC-8004 agent identity and x402 payments as references.',
        requirements: [
            'Show what it does and why it is useful',
            'Show how you built it, or how you use it',
            'Include one live example of it working',
            'Write it up as clear steps others can follow',
        ],
        deliverables: [
            'A published Sandworm notebook that is the tool or workflow, or walks through it, with a live example',
            'For the original challenge: a post on X tagging @Mantle_Official, submitted through Mantle\'s participation form',
        ],
        position: 101,
    },
];

export class AddMantleResearchBounties1783500000000 implements MigrationInterface {
    name = 'AddMantleResearchBounties1783500000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        for (const b of BOUNTIES) {
            await queryRunner.query(
                `INSERT INTO "bounty" ("slug", "title", "sponsor", "type", "reward", "status", "summary", "background", "requirements",
                    "deliverables", "prizes", "judging", "posted_on", "source_url", "sample", "featured", "position")
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, true, false, $15)`,
                [
                    b.slug, b.title, b.sponsor, b.type, b.reward, b.status, b.summary, b.background,
                    JSON.stringify(b.requirements), JSON.stringify(b.deliverables), JSON.stringify(b.prizes),
                    JSON.stringify(b.judging), b.postedOn, SOURCE_URL, b.position,
                ],
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "bounty" WHERE "slug" = ANY($1)`, [BOUNTIES.map(b => b.slug)]);
    }
}
