import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1777000189670 implements MigrationInterface {
    name = 'Migrations1777000189670'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "messages"
            ADD "model" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "yjs_app_document"
            ADD "state_hash" character varying(40) NOT NULL
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
            ALTER TABLE "yjs_app_document" DROP COLUMN "state_hash"
        `);
        await queryRunner.query(`
            ALTER TABLE "messages" DROP COLUMN "model"
        `);
    }

}
