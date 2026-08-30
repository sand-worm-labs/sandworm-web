import { MigrationInterface, QueryRunner } from "typeorm";

export class AddToolCsvFields1782500000000 implements MigrationInterface {
    name = 'AddToolCsvFields1782500000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "tool"
                ADD COLUMN "g1" character varying,
                ADD COLUMN "g2" character varying,
                ADD COLUMN "g3" character varying,
                ADD COLUMN "g4" character varying,
                ADD COLUMN "g5" character varying,
                ADD COLUMN "scope" character varying DEFAULT 'generic',
                ADD COLUMN "returns" jsonb NOT NULL DEFAULT '[]'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "tool"
                DROP COLUMN "g1",
                DROP COLUMN "g2",
                DROP COLUMN "g3",
                DROP COLUMN "g4",
                DROP COLUMN "g5",
                DROP COLUMN "scope",
                DROP COLUMN "returns"
        `);
    }
}
