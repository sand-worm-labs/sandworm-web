import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDocumentDescriptionTags1783000000000 implements MigrationInterface {
    name = 'AddDocumentDescriptionTags1783000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "document" ADD COLUMN "description" text
        `);
        await queryRunner.query(`
            ALTER TABLE "document" ADD COLUMN "tags" text[] NOT NULL DEFAULT '{}'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "document" DROP COLUMN "tags"
        `);
        await queryRunner.query(`
            ALTER TABLE "document" DROP COLUMN "description"
        `);
    }
}
