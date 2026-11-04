import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTerminalAnalysis1785500000000 implements MigrationInterface {
    name = 'AddTerminalAnalysis1785500000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "terminal_analysis_subject" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "client_id" uuid NOT NULL,
                "view" character varying(16) NOT NULL,
                "slug" character varying(120) NOT NULL,
                "name" character varying(120) NOT NULL,
                "kind" character varying(120) NOT NULL DEFAULT '',
                "impact" character varying(120) NOT NULL DEFAULT '',
                "impact_size" integer NOT NULL DEFAULT 0,
                "document_id" uuid,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "PK_terminal_analysis_subject_id" PRIMARY KEY ("id"),
                CONSTRAINT "CHK_terminal_analysis_subject_view" CHECK ("view" IN ('project', 'region', 'sector')),
                CONSTRAINT "FK_terminal_analysis_subject_client" FOREIGN KEY ("client_id") REFERENCES "terminal_client"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_terminal_analysis_subject_document" FOREIGN KEY ("document_id") REFERENCES "document"("id") ON DELETE SET NULL
            )
        `);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_terminal_analysis_subject_slug" ON "terminal_analysis_subject" ("client_id", "view", "slug")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "UQ_terminal_analysis_subject_slug"`);
        await queryRunner.query(`DROP TABLE "terminal_analysis_subject"`);
    }
}
