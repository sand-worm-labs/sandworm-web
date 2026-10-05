import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBountyEscrowLink1783800000000 implements MigrationInterface {
    name = 'AddBountyEscrowLink1783800000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "bounty"
                ADD "chain_id" integer,
                ADD "onchain_id" character varying,
                ADD "sponsor_address" character varying,
                ADD "fund_tx_hash" character varying
        `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_bounty_chain_onchain" ON "bounty" ("chain_id", "onchain_id") WHERE "onchain_id" IS NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_bounty_chain_onchain"`);
        await queryRunner.query(`
            ALTER TABLE "bounty"
                DROP COLUMN "fund_tx_hash",
                DROP COLUMN "sponsor_address",
                DROP COLUMN "onchain_id",
                DROP COLUMN "chain_id"
        `);
    }
}
