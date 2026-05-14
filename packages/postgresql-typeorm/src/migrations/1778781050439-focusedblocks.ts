import { MigrationInterface, QueryRunner } from "typeorm";

export class Focusedblocks1778781050439 implements MigrationInterface {
    name = 'Focusedblocks1778781050439'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "messages"
                RENAME COLUMN "focusedBlockId" TO "focused_block_ids"
        `);
        await queryRunner.query(`
            ALTER TABLE "messages" DROP COLUMN "focused_block_ids"
        `);
        await queryRunner.query(`
            ALTER TABLE "messages"
            ADD "focused_block_ids" uuid array
        `);
        await queryRunner.query(`
            ALTER TABLE "user_settings"
            ALTER COLUMN "social_links"
            SET DEFAULT '{}'::jsonb
        `);
        await queryRunner.query(`
            ALTER TABLE "user_settings"
            ALTER COLUMN "wallets"
            SET DEFAULT '[]'::jsonb
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user_settings"
            ALTER COLUMN "wallets"
            SET DEFAULT '[]'
        `);
        await queryRunner.query(`
            ALTER TABLE "user_settings"
            ALTER COLUMN "social_links"
            SET DEFAULT '{}'
        `);
        await queryRunner.query(`
            ALTER TABLE "messages" DROP COLUMN "focused_block_ids"
        `);
        await queryRunner.query(`
            ALTER TABLE "messages"
            ADD "focused_block_ids" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "messages"
                RENAME COLUMN "focused_block_ids" TO "focusedBlockId"
        `);
    }

}
