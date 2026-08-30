import { MigrationInterface, QueryRunner } from "typeorm";

const CATEGORIES: Array<{ id: string; name: string; description: string }> = [
    { id: 'primitives', name: 'Primitives', description: 'Foundational chain-agnostic building blocks — transfers, balances, gas, logs' },
    { id: 'wallet', name: 'Wallet', description: 'Address-centric profiling — PnL, portfolio, fund flows, counterparties' },
    { id: 'defi', name: 'DeFi & Protocols', description: 'DEX, lending, stablecoins, perps, governance, MEV, treasury' },
    { id: 'nft', name: 'NFT', description: 'Collection analytics, holders, mint activity, wash trading detection' },
    { id: 'staking', name: 'Staking', description: 'Validator stats, staking flows, rewards, liquid staking, restaking' },
    { id: 'bridges', name: 'Bridges', description: 'Cross-chain volume, user flows, bridge fees, TVL, settlement time' },
    { id: 'attestations', name: 'Attestations & Identity', description: 'EAS attestations by schema, attestors, recipients, Gitcoin Passport' },
    { id: 'forensics', name: 'Forensics', description: 'Fund tracing, mixer detection, rug pulls, sandwich attacks, sanctions' },
    { id: 'contracts', name: 'Contracts', description: 'Custom contract analytics — events, unique users, revenue, errors' },
    { id: 'chains', name: 'Chain & L2', description: 'Network-level metrics — DAU, gas history, TPS, blobs, sequencer' },
    { id: 'identity', name: 'Identity', description: 'Address and wallet identity signals — reputation, labeling, cross-platform linking' },
    { id: 'infra', name: 'Infrastructure', description: 'Chain infrastructure — RPC/indexer activity, deployments, validator/producer stats' },
    { id: 'lending', name: 'Lending', description: 'Lending market analytics — borrow/supply rates, utilization, liquidations' },
    { id: 'mev', name: 'MEV', description: 'MEV activity — sandwich attacks, arbitrage, frontrunning, searcher behavior' },
    { id: 'perp', name: 'Perpetuals', description: 'Perpetual futures markets — open interest, funding rates, liquidations' },
    { id: 'prediction', name: 'Prediction Markets', description: 'Prediction market activity — odds, volume, resolution outcomes' },
    { id: 'price', name: 'Price & Markets', description: 'Token price history, volatility, correlation, and market performance' },
    { id: 'social', name: 'Social', description: 'Social and community signals — engagement, sentiment, network activity' },
    { id: 'token', name: 'Token Analytics', description: 'Token-level analytics — risk metrics, holder behavior, cohort analysis' },
];

export class CreateToolCategoryTable1782700000000 implements MigrationInterface {
    name = 'CreateToolCategoryTable1782700000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "tool_category" (
                "category_id" character varying NOT NULL,
                "name" character varying NOT NULL,
                "description" text NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "PK_tool_category_category_id" PRIMARY KEY ("category_id")
            )
        `);

        for (const c of CATEGORIES) {
            await queryRunner.query(
                `INSERT INTO "tool_category" ("category_id", "name", "description") VALUES ($1, $2, $3)`,
                [c.id, c.name, c.description],
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "tool_category"`);
    }
}
