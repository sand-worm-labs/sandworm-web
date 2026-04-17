import { MigrationInterface, QueryRunner } from "typeorm";

export class Visibity1776431797483 implements MigrationInterface {
    name = 'Visibity1776431797483'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."document_visibility_enum" AS ENUM('WORKSPACE', 'LINK', 'PUBLIC')
        `);
        await queryRunner.query(`
            ALTER TABLE "document"
            ADD "visibility" "public"."document_visibility_enum" NOT NULL DEFAULT 'WORKSPACE'
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
            ALTER TABLE "document" DROP COLUMN "visibility"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."document_visibility_enum"
        `);
    }

}
