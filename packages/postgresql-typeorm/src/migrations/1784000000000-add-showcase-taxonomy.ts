import { MigrationInterface, QueryRunner } from "typeorm";

// The Showcase's taxonomy, chains and template skeletons, which used to be
// JSON files in the web app. The rows below are what those files held.
const GROUPS = [
    {
        "id": "chains",
        "label": "Chains",
        "position": 0
    },
    {
        "id": "money",
        "label": "Money",
        "position": 1
    },
    {
        "id": "trading",
        "label": "Trading",
        "position": 2
    },
    {
        "id": "yield",
        "label": "Yield",
        "position": 3
    },
    {
        "id": "infra",
        "label": "Infra",
        "position": 4
    },
    {
        "id": "culture",
        "label": "Culture",
        "position": 5
    },
    {
        "id": "rwa",
        "label": "RWA",
        "position": 6
    }
];

const CHAINS: { name: string; color: string; position: number | null }[] = [
    {
        "name": "Solana",
        "color": "#9945FF",
        "position": 0
    },
    {
        "name": "Base",
        "color": "#0052FF",
        "position": 1
    },
    {
        "name": "Monad",
        "color": "#836EF9",
        "position": 2
    },
    {
        "name": "Arbitrum",
        "color": "#12AAFF",
        "position": 3
    },
    {
        "name": "Ethereum",
        "color": "#627EEA",
        "position": 4
    },
    {
        "name": "Polygon",
        "color": "#8247E5",
        "position": null
    },
    {
        "name": "Tron",
        "color": "#EB0029",
        "position": null
    },
    {
        "name": "BNB Chain",
        "color": "#F0B90B",
        "position": null
    },
    {
        "name": "Optimism",
        "color": "#FF0420",
        "position": null
    },
    {
        "name": "Avalanche",
        "color": "#E84142",
        "position": null
    },
    {
        "name": "Sui",
        "color": "#4DA2FF",
        "position": null
    }
];

const CATEGORIES: {
    slug: string;
    groupId: string;
    name: string;
    question: string;
    metricSpec: string | null;
    protocols: string[];
    chains: string[];
}[] = [
    {
        "slug": "solana",
        "groupId": "chains",
        "name": "Solana",
        "question": "Who is actually using Solana, and what for, once the bots are removed?",
        "metricSpec": "chain_solana",
        "protocols": [
            "Jupiter",
            "Raydium",
            "Kamino",
            "Jito",
            "pump.fun"
        ],
        "chains": [
            "Solana"
        ]
    },
    {
        "slug": "base",
        "groupId": "chains",
        "name": "Base",
        "question": "How much of Base's activity is people, and how much is Coinbase's funnel?",
        "metricSpec": "chain_base",
        "protocols": [
            "Aerodrome",
            "Morpho",
            "Virtuals",
            "Farcaster"
        ],
        "chains": [
            "Base"
        ]
    },
    {
        "slug": "monad",
        "groupId": "chains",
        "name": "Monad",
        "question": "Did the users stay after launch, and where did the capital go?",
        "metricSpec": "chain_monad",
        "protocols": [],
        "chains": [
            "Monad"
        ]
    },
    {
        "slug": "arbitrum",
        "groupId": "chains",
        "name": "Arbitrum",
        "question": "What is still growing on Arbitrum besides perps?",
        "metricSpec": "chain_arbitrum",
        "protocols": [
            "GMX",
            "Aave",
            "Pendle",
            "Uniswap"
        ],
        "chains": [
            "Arbitrum"
        ]
    },
    {
        "slug": "ethereum",
        "groupId": "chains",
        "name": "Ethereum",
        "question": "Who still pays mainnet fees, and what are they doing there?",
        "metricSpec": "chain_ethereum",
        "protocols": [
            "Uniswap",
            "Aave",
            "Lido",
            "Sky",
            "EigenLayer"
        ],
        "chains": [
            "Ethereum"
        ]
    },
    {
        "slug": "off-ramps",
        "groupId": "money",
        "name": "Off-ramps",
        "question": "Who is actually cashing out to local currency, and how much?",
        "metricSpec": "off_ramps",
        "protocols": [
            "Paj Cash",
            "Yellow Card",
            "MoonPay",
            "Transak"
        ],
        "chains": [
            "Solana",
            "Base",
            "Ethereum"
        ]
    },
    {
        "slug": "stablecoins",
        "groupId": "money",
        "name": "Stablecoins",
        "question": "Which stablecoins are used to pay people, and which just sit?",
        "metricSpec": "stablecoins",
        "protocols": [
            "USDT",
            "USDC",
            "USDS",
            "USDe",
            "PYUSD"
        ],
        "chains": [
            "Ethereum",
            "Solana",
            "Base",
            "Arbitrum"
        ]
    },
    {
        "slug": "payments",
        "groupId": "money",
        "name": "Payments",
        "question": "Who moves real payment volume, and who moves it in circles?",
        "metricSpec": "payments",
        "protocols": [
            "Solana Pay",
            "Helio",
            "Sphere",
            "Request"
        ],
        "chains": [
            "Solana",
            "Base"
        ]
    },
    {
        "slug": "crypto-cards",
        "groupId": "money",
        "name": "Crypto cards",
        "question": "Which cards get spent at a till, not just topped up?",
        "metricSpec": "crypto_cards",
        "protocols": [
            "Ether.fi Cash",
            "Gnosis Pay",
            "KAST"
        ],
        "chains": [
            "Ethereum",
            "Base",
            "Solana"
        ]
    },
    {
        "slug": "dexes",
        "groupId": "trading",
        "name": "DEXes",
        "question": "Where does real trading happen once wash volume is removed?",
        "metricSpec": "dexes",
        "protocols": [
            "Uniswap",
            "Raydium",
            "Orca",
            "Aerodrome",
            "PancakeSwap"
        ],
        "chains": [
            "Ethereum",
            "Solana",
            "Base",
            "Arbitrum",
            "Monad"
        ]
    },
    {
        "slug": "dex-aggregators",
        "groupId": "trading",
        "name": "DEX aggregators",
        "question": "Who routes the order flow, and which venues do they feed?",
        "metricSpec": "dex_aggregators",
        "protocols": [
            "Jupiter",
            "1inch",
            "CoW Swap",
            "KyberSwap"
        ],
        "chains": [
            "Solana",
            "Ethereum",
            "Base",
            "Arbitrum"
        ]
    },
    {
        "slug": "perps",
        "groupId": "trading",
        "name": "Perps",
        "question": "Who has traders that stay, and who is renting volume with points?",
        "metricSpec": "perps",
        "protocols": [
            "Hyperliquid",
            "Drift",
            "GMX",
            "dYdX",
            "Jupiter Perps"
        ],
        "chains": [
            "Arbitrum",
            "Solana",
            "Ethereum"
        ]
    },
    {
        "slug": "options",
        "groupId": "trading",
        "name": "Options",
        "question": "Is anyone trading on-chain options besides the market makers?",
        "metricSpec": "options",
        "protocols": [
            "Derive",
            "Aevo"
        ],
        "chains": [
            "Ethereum",
            "Arbitrum"
        ]
    },
    {
        "slug": "prediction-markets",
        "groupId": "trading",
        "name": "Prediction markets",
        "question": "How much volume is real conviction, and how much is farming?",
        "metricSpec": "prediction_markets",
        "protocols": [
            "Polymarket",
            "Limitless"
        ],
        "chains": [
            "Base",
            "Ethereum"
        ]
    },
    {
        "slug": "launchpads",
        "groupId": "trading",
        "name": "Launchpads",
        "question": "How many launches are still alive a month later?",
        "metricSpec": "launchpads",
        "protocols": [
            "pump.fun",
            "LetsBonk",
            "Virtuals"
        ],
        "chains": [
            "Solana",
            "Base"
        ]
    },
    {
        "slug": "trading-terminals",
        "groupId": "trading",
        "name": "Trading terminals",
        "question": "Which bots and terminals own the retail trader, and what do they earn?",
        "metricSpec": "trading_terminals",
        "protocols": [
            "Axiom",
            "Photon",
            "BullX",
            "Trojan"
        ],
        "chains": [
            "Solana",
            "Base",
            "Ethereum"
        ]
    },
    {
        "slug": "lending",
        "groupId": "yield",
        "name": "Lending",
        "question": "Who is borrowing, against what, and how close to liquidation?",
        "metricSpec": "lending",
        "protocols": [
            "Aave",
            "Morpho",
            "Kamino",
            "Compound",
            "Spark"
        ],
        "chains": [
            "Ethereum",
            "Solana",
            "Base",
            "Arbitrum",
            "Monad"
        ]
    },
    {
        "slug": "liquid-staking",
        "groupId": "yield",
        "name": "Liquid staking",
        "question": "Where is staked supply concentrated, and who holds it?",
        "metricSpec": "liquid_staking",
        "protocols": [
            "Lido",
            "Jito",
            "Rocket Pool",
            "Marinade"
        ],
        "chains": [
            "Ethereum",
            "Solana"
        ]
    },
    {
        "slug": "restaking",
        "groupId": "yield",
        "name": "Restaking",
        "question": "Is restaked capital securing anything, or just stacking points?",
        "metricSpec": "restaking",
        "protocols": [
            "EigenLayer",
            "Symbiotic",
            "Solayer"
        ],
        "chains": [
            "Ethereum",
            "Solana"
        ]
    },
    {
        "slug": "liquid-restaking",
        "groupId": "yield",
        "name": "Liquid restaking",
        "question": "Who holds the liquid restaking tokens, and where do they park them?",
        "metricSpec": "liquid_restaking",
        "protocols": [
            "ether.fi",
            "Renzo",
            "Kelp"
        ],
        "chains": [
            "Ethereum",
            "Arbitrum",
            "Base"
        ]
    },
    {
        "slug": "yield",
        "groupId": "yield",
        "name": "Yield",
        "question": "Where does the yield come from, and who is on the other side of it?",
        "metricSpec": "yield",
        "protocols": [
            "Pendle",
            "Yearn",
            "Convex",
            "Beefy"
        ],
        "chains": [
            "Ethereum",
            "Arbitrum",
            "Base"
        ]
    },
    {
        "slug": "cdp",
        "groupId": "yield",
        "name": "CDPs",
        "question": "Who mints against collateral, and how healthy are their positions?",
        "metricSpec": "cdp",
        "protocols": [
            "Sky",
            "Liquity"
        ],
        "chains": [
            "Ethereum"
        ]
    },
    {
        "slug": "basis-trading",
        "groupId": "yield",
        "name": "Basis trading",
        "question": "How big is the delta-neutral trade, and what happens when funding flips?",
        "metricSpec": "basis_trading",
        "protocols": [
            "Ethena",
            "Resolv"
        ],
        "chains": [
            "Ethereum",
            "Arbitrum"
        ]
    },
    {
        "slug": "bridges",
        "groupId": "infra",
        "name": "Bridges",
        "question": "Which way is money flowing between chains, and who moves it?",
        "metricSpec": "bridges",
        "protocols": [
            "Wormhole",
            "Stargate",
            "Across",
            "deBridge"
        ],
        "chains": [
            "Ethereum",
            "Solana",
            "Base",
            "Arbitrum",
            "Monad"
        ]
    },
    {
        "slug": "oracles",
        "groupId": "infra",
        "name": "Oracles",
        "question": "How much value depends on each oracle, and how often do they update?",
        "metricSpec": "oracles",
        "protocols": [
            "Chainlink",
            "Pyth",
            "RedStone"
        ],
        "chains": [
            "Ethereum",
            "Solana",
            "Arbitrum",
            "Base"
        ]
    },
    {
        "slug": "wallets",
        "groupId": "infra",
        "name": "Wallets",
        "question": "Which wallets have users who come back?",
        "metricSpec": "wallets",
        "protocols": [
            "Phantom",
            "MetaMask",
            "Rabby",
            "Backpack"
        ],
        "chains": [
            "Solana",
            "Ethereum",
            "Base"
        ]
    },
    {
        "slug": "depin",
        "groupId": "infra",
        "name": "DePIN",
        "question": "Who pays for the network's service, as opposed to farming its token?",
        "metricSpec": "depin",
        "protocols": [
            "Helium",
            "Render",
            "Hivemapper",
            "Grass"
        ],
        "chains": [
            "Solana"
        ]
    },
    {
        "slug": "memecoins",
        "groupId": "culture",
        "name": "Memecoins",
        "question": "Who made money, who lost it, and how fast did it happen?",
        "metricSpec": "memecoins",
        "protocols": [
            "BONK",
            "WIF",
            "PEPE"
        ],
        "chains": [
            "Solana",
            "Base",
            "Ethereum"
        ]
    },
    {
        "slug": "nft-marketplaces",
        "groupId": "culture",
        "name": "NFT marketplaces",
        "question": "Which collections still trade between real holders?",
        "metricSpec": "nft_marketplaces",
        "protocols": [
            "Magic Eden",
            "OpenSea",
            "Blur",
            "Tensor"
        ],
        "chains": [
            "Solana",
            "Ethereum",
            "Base"
        ]
    },
    {
        "slug": "socialfi",
        "groupId": "culture",
        "name": "SoFi",
        "question": "Do people use it once the airdrop is over?",
        "metricSpec": "socialfi",
        "protocols": [
            "Farcaster",
            "Zora"
        ],
        "chains": [
            "Base",
            "Ethereum"
        ]
    },
    {
        "slug": "gaming",
        "groupId": "culture",
        "name": "Gaming",
        "question": "How many players are people, and how many are farms?",
        "metricSpec": "gaming",
        "protocols": [
            "Pixels",
            "Axie Infinity"
        ],
        "chains": [
            "Ethereum",
            "Solana",
            "Base"
        ]
    },
    {
        "slug": "ai-agents",
        "groupId": "culture",
        "name": "AI agents",
        "question": "Do the agents do anything on-chain besides trade their own token?",
        "metricSpec": "ai_agents",
        "protocols": [
            "Virtuals",
            "elizaOS"
        ],
        "chains": [
            "Base",
            "Solana"
        ]
    },
    {
        "slug": "tokenized-treasuries",
        "groupId": "rwa",
        "name": "Tokenized treasuries",
        "question": "Who holds tokenized T-bills, and do they ever move?",
        "metricSpec": "tokenized_treasuries",
        "protocols": [
            "BUIDL",
            "Ondo",
            "BENJI",
            "Superstate"
        ],
        "chains": [
            "Ethereum",
            "Solana",
            "Arbitrum",
            "Base"
        ]
    },
    {
        "slug": "private-credit",
        "groupId": "rwa",
        "name": "Private credit",
        "question": "Who lends, who borrows, and how much has defaulted?",
        "metricSpec": "private_credit",
        "protocols": [
            "Maple",
            "Centrifuge",
            "Goldfinch"
        ],
        "chains": [
            "Ethereum",
            "Solana",
            "Base"
        ]
    },
    {
        "slug": "tokenized-stocks",
        "groupId": "rwa",
        "name": "Tokenized stocks",
        "question": "Is anyone trading tokenized stocks outside market hours?",
        "metricSpec": "tokenized_stocks",
        "protocols": [
            "xStocks",
            "Ondo Global Markets",
            "Dinari"
        ],
        "chains": [
            "Solana",
            "Ethereum",
            "Arbitrum"
        ]
    },
    {
        "slug": "tokenized-commodities",
        "groupId": "rwa",
        "name": "Tokenized commodities",
        "question": "Who holds tokenized gold, and is it ever redeemed?",
        "metricSpec": "tokenized_commodities",
        "protocols": [
            "PAXG",
            "XAUT"
        ],
        "chains": [
            "Ethereum"
        ]
    }
];

const TEMPLATES = [
    {
        "kind": "case_study",
        "sections": [
            {
                "id": "hero",
                "title": null,
                "required": true,
                "by": "page"
            },
            {
                "id": "contents",
                "title": "Contents",
                "required": true,
                "by": "page"
            },
            {
                "id": "short_version",
                "title": "The short version",
                "required": true,
                "by": "notebook"
            },
            {
                "id": "findings",
                "title": null,
                "required": true,
                "min": 3,
                "max": 5,
                "by": "notebook"
            },
            {
                "id": "limits",
                "title": "What this page doesn't cover",
                "required": true,
                "by": "notebook"
            },
            {
                "id": "more_notebooks",
                "title": "More notebooks on {protocol}",
                "required": true,
                "by": "page"
            },
            {
                "id": "cta",
                "title": "Run a protocol? Get this page for yours.",
                "required": true,
                "by": "page"
            }
        ]
    },
    {
        "kind": "category",
        "sections": [
            {
                "id": "header",
                "title": null,
                "required": true,
                "by": "page"
            },
            {
                "id": "metrics",
                "title": "Category metrics",
                "required": true,
                "min": 4,
                "max": 5,
                "by": "notebook"
            },
            {
                "id": "leaderboard",
                "title": "Leaderboard",
                "required": true,
                "by": "notebook"
            },
            {
                "id": "coverage_note",
                "title": "Coverage note",
                "required": true,
                "by": "notebook"
            },
            {
                "id": "case_studies",
                "title": "Case studies",
                "required": true,
                "by": "page"
            },
            {
                "id": "request_coverage",
                "title": "Request coverage",
                "required": true,
                "by": "page"
            }
        ]
    }
];

export class AddShowcaseTaxonomy1784000000000 implements MigrationInterface {
    name = 'AddShowcaseTaxonomy1784000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "showcase_group" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" text NOT NULL, "label" text NOT NULL, "position" integer NOT NULL DEFAULT 0, CONSTRAINT "PK_showcase_group_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "showcase_category" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "slug" text NOT NULL, "group_id" text NOT NULL, "name" text NOT NULL, "question" text NOT NULL, "metric_spec" text, "protocols" text array NOT NULL DEFAULT '{}', "chains" text array NOT NULL DEFAULT '{}', "position" integer NOT NULL DEFAULT 0, CONSTRAINT "PK_showcase_category_slug" PRIMARY KEY ("slug"))`);
        await queryRunner.query(`CREATE INDEX "IDX_showcase_category_group" ON "showcase_category" ("group_id")`);
        await queryRunner.query(`CREATE TABLE "showcase_chain" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" text NOT NULL, "color" text NOT NULL, "position" integer, CONSTRAINT "PK_showcase_chain_name" PRIMARY KEY ("name"))`);
        await queryRunner.query(`CREATE TABLE "showcase_template" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "kind" text NOT NULL, "sections" jsonb NOT NULL, CONSTRAINT "PK_showcase_template_kind" PRIMARY KEY ("kind"))`);

        for (const group of GROUPS) {
            await queryRunner.query(
                `INSERT INTO "showcase_group" ("id", "label", "position") VALUES ($1, $2, $3)`,
                [group.id, group.label, group.position],
            );
        }
        for (const chain of CHAINS) {
            await queryRunner.query(
                `INSERT INTO "showcase_chain" ("name", "color", "position") VALUES ($1, $2, $3)`,
                [chain.name, chain.color, chain.position],
            );
        }
        for (const [position, category] of CATEGORIES.entries()) {
            await queryRunner.query(
                `INSERT INTO "showcase_category" ("slug", "group_id", "name", "question", "metric_spec", "protocols", "chains", "position") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [category.slug, category.groupId, category.name, category.question, category.metricSpec, category.protocols, category.chains, position],
            );
        }
        for (const template of TEMPLATES) {
            await queryRunner.query(
                `INSERT INTO "showcase_template" ("kind", "sections") VALUES ($1, $2)`,
                [template.kind, JSON.stringify(template.sections)],
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "showcase_template"`);
        await queryRunner.query(`DROP TABLE "showcase_chain"`);
        await queryRunner.query(`DROP INDEX "IDX_showcase_category_group"`);
        await queryRunner.query(`DROP TABLE "showcase_category"`);
        await queryRunner.query(`DROP TABLE "showcase_group"`);
    }
}
