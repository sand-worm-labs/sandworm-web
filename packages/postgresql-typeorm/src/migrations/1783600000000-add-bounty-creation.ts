import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBountyCreation1783600000000 implements MigrationInterface {
    name = 'AddBountyCreation1783600000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "bounty"
                ADD "creator_id" uuid,
                ADD "workspace_id" uuid,
                ADD "reward_token" character varying,
                ADD "reward_amount" numeric(36,6),
                ADD "deadline" TIMESTAMP WITH TIME ZONE
        `);
        await queryRunner.query(`CREATE INDEX "IDX_bounty_workspace_id" ON "bounty" ("workspace_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_bounty_workspace_id"`);
        await queryRunner.query(`
            ALTER TABLE "bounty"
                DROP COLUMN "deadline",
                DROP COLUMN "reward_amount",
                DROP COLUMN "reward_token",
                DROP COLUMN "workspace_id",
                DROP COLUMN "creator_id"
        `);
    }
}
