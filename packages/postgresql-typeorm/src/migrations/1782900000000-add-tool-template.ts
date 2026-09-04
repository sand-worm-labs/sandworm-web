import { MigrationInterface, QueryRunner } from "typeorm";

export class AddToolTemplate1782900000000 implements MigrationInterface {
    name = 'AddToolTemplate1782900000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "tool"
                ADD COLUMN "template" text NOT NULL DEFAULT ''
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "tool"
                DROP COLUMN "template"
        `);
    }
}
