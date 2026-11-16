import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTerminalRequest1785400000000 implements MigrationInterface {
    name = 'AddTerminalRequest1785400000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "terminal_request" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "client_id" uuid NOT NULL,
                "kind" character varying(16) NOT NULL,
                "requested_by" uuid,
                "question" text NOT NULL,
                "use_case" character varying(32),
                "about" text array NOT NULL DEFAULT '{}',
                "timing" character varying(16),
                "files" text array NOT NULL DEFAULT '{}',
                "status" character varying(24) NOT NULL DEFAULT 'submitted',
                "scope" jsonb,
                "agent_run_id" character varying(128),
                "progress_note" text,
                "outcome" text,
                "report_id" uuid,
                "submitted_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "scoped_at" TIMESTAMP WITH TIME ZONE,
                "approved_at" TIMESTAMP WITH TIME ZONE,
                "approved_by" uuid,
                "closed_at" TIMESTAMP WITH TIME ZONE,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "PK_terminal_request_id" PRIMARY KEY ("id"),
                CONSTRAINT "CHK_terminal_request_kind" CHECK ("kind" IN ('research', 'question')),
                CONSTRAINT "CHK_terminal_request_status" CHECK ("status" IN ('submitted', 'scoping', 'awaiting_approval', 'in_progress', 'delivered', 'declined', 'failed')),
                CONSTRAINT "CHK_terminal_request_use_case" CHECK ("use_case" IS NULL OR "use_case" IN ('plan-launch', 'pick-partner', 'investor-update', 'other')),
                CONSTRAINT "CHK_terminal_request_timing" CHECK ("timing" IS NULL OR "timing" IN ('two-weeks', 'one-week', 'no-rush')),
                CONSTRAINT "FK_terminal_request_client" FOREIGN KEY ("client_id") REFERENCES "terminal_client"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_terminal_request_requester" FOREIGN KEY ("requested_by") REFERENCES "terminal_member"("id") ON DELETE SET NULL,
                CONSTRAINT "FK_terminal_request_approver" FOREIGN KEY ("approved_by") REFERENCES "terminal_member"("id") ON DELETE SET NULL
            )
        `);
        await queryRunner.query(`CREATE INDEX "IDX_terminal_request_client" ON "terminal_request" ("client_id", "kind", "submitted_at")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_terminal_request_client"`);
        await queryRunner.query(`DROP TABLE "terminal_request"`);
    }
}
