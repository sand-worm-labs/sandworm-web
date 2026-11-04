import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTerminalBriefing1785300000000 implements MigrationInterface {
    name = 'AddTerminalBriefing1785300000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "terminal_briefing_item" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "client_id" uuid NOT NULL,
                "member_id" uuid,
                "kind" character varying(16) NOT NULL,
                "title" character varying(200) NOT NULL,
                "summary" text NOT NULL DEFAULT '',
                "subject" character varying(120) NOT NULL DEFAULT '',
                "detail" jsonb NOT NULL DEFAULT '{}',
                "document_id" uuid,
                "block_id" uuid NOT NULL,
                "ran_at" TIMESTAMP WITH TIME ZONE NOT NULL,
                "published_at" TIMESTAMP WITH TIME ZONE,
                "created_by" uuid,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "PK_terminal_briefing_item_id" PRIMARY KEY ("id"),
                CONSTRAINT "CHK_terminal_briefing_item_kind" CHECK ("kind" IN ('analysis', 'opportunity', 'metric')),
                CONSTRAINT "FK_terminal_briefing_item_client" FOREIGN KEY ("client_id") REFERENCES "terminal_client"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_terminal_briefing_item_member" FOREIGN KEY ("member_id") REFERENCES "terminal_member"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_terminal_briefing_item_document" FOREIGN KEY ("document_id") REFERENCES "document"("id") ON DELETE SET NULL,
                CONSTRAINT "FK_terminal_briefing_item_creator" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL
            )
        `);
        await queryRunner.query(`CREATE INDEX "IDX_terminal_briefing_item_feed" ON "terminal_briefing_item" ("client_id", "published_at")`);
        await queryRunner.query(`CREATE INDEX "IDX_terminal_briefing_item_member" ON "terminal_briefing_item" ("member_id")`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_terminal_briefing_item_source_run" ON "terminal_briefing_item" ("document_id", "block_id", "ran_at")`);

        await queryRunner.query(`
            CREATE TABLE "terminal_briefing_read" (
                "item_id" uuid NOT NULL,
                "member_id" uuid NOT NULL,
                "read_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "PK_terminal_briefing_read" PRIMARY KEY ("item_id", "member_id"),
                CONSTRAINT "FK_terminal_briefing_read_item" FOREIGN KEY ("item_id") REFERENCES "terminal_briefing_item"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_terminal_briefing_read_member" FOREIGN KEY ("member_id") REFERENCES "terminal_member"("id") ON DELETE CASCADE
            )
        `);
        await queryRunner.query(`CREATE INDEX "IDX_terminal_briefing_read_member" ON "terminal_briefing_read" ("member_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_terminal_briefing_read_member"`);
        await queryRunner.query(`DROP TABLE "terminal_briefing_read"`);
        await queryRunner.query(`DROP INDEX "UQ_terminal_briefing_item_source_run"`);
        await queryRunner.query(`DROP INDEX "IDX_terminal_briefing_item_member"`);
        await queryRunner.query(`DROP INDEX "IDX_terminal_briefing_item_feed"`);
        await queryRunner.query(`DROP TABLE "terminal_briefing_item"`);
    }
}
