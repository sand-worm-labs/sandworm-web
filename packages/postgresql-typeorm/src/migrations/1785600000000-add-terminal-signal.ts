import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTerminalSignal1785600000000 implements MigrationInterface {
    name = 'AddTerminalSignal1785600000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "terminal_signal" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "client_id" uuid NOT NULL,
                "status" character varying(16) NOT NULL DEFAULT 'new',
                "title" character varying(200) NOT NULL,
                "observed" text NOT NULL DEFAULT '',
                "could_mean" text NOT NULL DEFAULT '',
                "kind" character varying(32) NOT NULL DEFAULT '',
                "size" character varying(32) NOT NULL DEFAULT '',
                "size_label" character varying(64) NOT NULL DEFAULT '',
                "evidence" character varying(8) NOT NULL,
                "subject" character varying(120) NOT NULL DEFAULT '',
                "document_id" uuid,
                "published_at" TIMESTAMP WITH TIME ZONE,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "PK_terminal_signal_id" PRIMARY KEY ("id"),
                CONSTRAINT "CHK_terminal_signal_status" CHECK ("status" IN ('new', 'looking', 'acting', 'dismissed')),
                CONSTRAINT "CHK_terminal_signal_evidence" CHECK ("evidence" IN ('strong', 'some', 'early')),
                CONSTRAINT "FK_terminal_signal_client" FOREIGN KEY ("client_id") REFERENCES "terminal_client"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_terminal_signal_document" FOREIGN KEY ("document_id") REFERENCES "document"("id") ON DELETE SET NULL
            )
        `);
        await queryRunner.query(`CREATE INDEX "IDX_terminal_signal_client" ON "terminal_signal" ("client_id", "published_at")`);

        // Briefing items that pointed at an opportunity now point at a signal
        await queryRunner.query(`ALTER TABLE "terminal_briefing_item" DROP CONSTRAINT "CHK_terminal_briefing_item_kind"`);
        await queryRunner.query(`UPDATE "terminal_briefing_item" SET "kind" = 'signal' WHERE "kind" = 'opportunity'`);
        await queryRunner.query(`ALTER TABLE "terminal_briefing_item" ADD CONSTRAINT "CHK_terminal_briefing_item_kind" CHECK ("kind" IN ('analysis', 'signal', 'metric'))`);

        await queryRunner.query(`ALTER TABLE "terminal_client" ADD "research_allowance" integer NOT NULL DEFAULT 5`);

        // A request's report is a document; clear links that point nowhere first
        await queryRunner.query(`UPDATE "terminal_request" SET "report_id" = NULL WHERE "report_id" IS NOT NULL AND "report_id" NOT IN (SELECT "id" FROM "document")`);
        await queryRunner.query(`ALTER TABLE "terminal_request" ADD CONSTRAINT "FK_terminal_request_report" FOREIGN KEY ("report_id") REFERENCES "document"("id") ON DELETE SET NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "terminal_request" DROP CONSTRAINT "FK_terminal_request_report"`);
        await queryRunner.query(`ALTER TABLE "terminal_client" DROP COLUMN "research_allowance"`);
        await queryRunner.query(`ALTER TABLE "terminal_briefing_item" DROP CONSTRAINT "CHK_terminal_briefing_item_kind"`);
        await queryRunner.query(`UPDATE "terminal_briefing_item" SET "kind" = 'opportunity' WHERE "kind" = 'signal'`);
        await queryRunner.query(`ALTER TABLE "terminal_briefing_item" ADD CONSTRAINT "CHK_terminal_briefing_item_kind" CHECK ("kind" IN ('analysis', 'opportunity', 'metric'))`);
        await queryRunner.query(`DROP INDEX "IDX_terminal_signal_client"`);
        await queryRunner.query(`DROP TABLE "terminal_signal"`);
    }
}
