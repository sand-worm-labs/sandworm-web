import { MigrationInterface, QueryRunner } from "typeorm";

// A region or sector groups reports by its id, not a slug: a report's tags hold
// the id of the subject it belongs to. Ids are per client, so no two clients
// share a tag.
export class DropTerminalAnalysisSlug1786100000000 implements MigrationInterface {
    name = 'DropTerminalAnalysisSlug1786100000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE "document" SET "tags" = ARRAY(
                SELECT COALESCE(s."id"::text, t.tag)
                FROM unnest("document"."tags") WITH ORDINALITY AS t(tag, pos)
                LEFT JOIN "terminal_analysis_subject" s
                    ON t.tag = s."view" || ':' || s."slug" AND s."view" <> 'project'
                ORDER BY t.pos
            )
            WHERE "tags" && ARRAY(SELECT "view" || ':' || "slug" FROM "terminal_analysis_subject" WHERE "view" <> 'project')
        `);
        await queryRunner.query(`DROP INDEX "UQ_terminal_analysis_subject_slug"`);
        await queryRunner.query(`ALTER TABLE "terminal_analysis_subject" DROP COLUMN "slug"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "terminal_analysis_subject" ADD "slug" character varying(120)`);
        await queryRunner.query(`UPDATE "terminal_analysis_subject" SET "slug" = "id"::text`);
        await queryRunner.query(`ALTER TABLE "terminal_analysis_subject" ALTER COLUMN "slug" SET NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_terminal_analysis_subject_slug" ON "terminal_analysis_subject" ("client_id", "view", "slug")`);
        await queryRunner.query(`
            UPDATE "document" SET "tags" = ARRAY(
                SELECT COALESCE(s."view" || ':' || s."id"::text, t.tag)
                FROM unnest("document"."tags") WITH ORDINALITY AS t(tag, pos)
                LEFT JOIN "terminal_analysis_subject" s
                    ON t.tag = s."id"::text AND s."view" <> 'project'
                ORDER BY t.pos
            )
            WHERE "tags" && ARRAY(SELECT "id"::text FROM "terminal_analysis_subject" WHERE "view" <> 'project')
        `);
    }
}
