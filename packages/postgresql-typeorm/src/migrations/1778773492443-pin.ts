import { MigrationInterface, QueryRunner } from "typeorm";

export class Pin1778773492443 implements MigrationInterface {
    name = 'Pin1778773492443'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "chats"
            ADD "is_pin" boolean NOT NULL DEFAULT false
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
            ALTER TABLE "chats" DROP COLUMN "is_pin"
        `);
    }

}
