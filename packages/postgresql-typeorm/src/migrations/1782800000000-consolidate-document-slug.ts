import { MigrationInterface, QueryRunner } from "typeorm";

export class ConsolidateDocumentSlug1782800000000 implements MigrationInterface {
    name = 'ConsolidateDocumentSlug1782800000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_document_published_slug"
        `);
        await queryRunner.query(`
            ALTER TABLE "document" DROP COLUMN "slug"
        `);
        await queryRunner.query(`
            ALTER TABLE "document" RENAME COLUMN "published_slug" TO "slug"
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_document_slug" ON "document" ("slug")
            WHERE "slug" IS NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_document_slug"
        `);
        await queryRunner.query(`
            ALTER TABLE "document" RENAME COLUMN "slug" TO "published_slug"
        `);
        await queryRunner.query(`
            ALTER TABLE "document" ADD COLUMN "slug" character varying NOT NULL DEFAULT 'DocumentIcon'
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_document_published_slug" ON "document" ("published_slug")
            WHERE "published_slug" IS NOT NULL
        `);
    }
}
