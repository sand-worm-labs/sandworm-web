import { MigrationInterface, QueryRunner } from "typeorm";

export class DropToolRenderFields1782600000000 implements MigrationInterface {
    name = 'DropToolRenderFields1782600000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "tool"
                DROP COLUMN "ui_hint",
                DROP COLUMN "language",
                DROP COLUMN "template"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "tool"
                ADD COLUMN "ui_hint" character varying NOT NULL DEFAULT 'form',
                ADD COLUMN "language" character varying NOT NULL DEFAULT 'sql',
                ADD COLUMN "template" text NOT NULL DEFAULT ''
        `);
    }
}
