import { MigrationInterface, QueryRunner } from "typeorm";

// Key numbers for the terminal: a definition per KPI and a history of readings.
// The JSON columns are checked to be objects here; the entity checks their
// shapes (KpiFormat, KpiComparison, KpiSource) so a new format or source needs
// no migration.
export class AddTerminalKpi1785900000000 implements MigrationInterface {
    name = 'AddTerminalKpi1785900000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "terminal_kpi" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "client_id" uuid NOT NULL,
                "subject_id" uuid,
                "key" character varying(64) NOT NULL,
                "label" character varying(120) NOT NULL,
                "description" character varying(300) NOT NULL DEFAULT '',
                "position" integer NOT NULL DEFAULT 0,
                "is_visible" boolean NOT NULL DEFAULT true,
                "format" jsonb NOT NULL DEFAULT '{"kind":"number"}',
                "direction" character varying(12) NOT NULL DEFAULT 'neutral',
                "comparison" jsonb NOT NULL DEFAULT '{"kind":"previous"}',
                "source" jsonb NOT NULL DEFAULT '{"kind":"manual"}',
                "settings" jsonb NOT NULL DEFAULT '{}',
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "PK_terminal_kpi_id" PRIMARY KEY ("id"),
                CONSTRAINT "CHK_terminal_kpi_direction" CHECK ("direction" IN ('up_good', 'down_good', 'neutral')),
                CONSTRAINT "CHK_terminal_kpi_json" CHECK (
                    jsonb_typeof("format") = 'object' AND jsonb_typeof("comparison") = 'object'
                    AND jsonb_typeof("source") = 'object' AND jsonb_typeof("settings") = 'object'
                ),
                CONSTRAINT "FK_terminal_kpi_client" FOREIGN KEY ("client_id") REFERENCES "terminal_client"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_terminal_kpi_subject" FOREIGN KEY ("subject_id") REFERENCES "terminal_analysis_subject"("id") ON DELETE CASCADE
            )
        `);
        // A key is unique per client, and per subject when it has one (a plain
        // UNIQUE would let rows with no subject repeat)
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_terminal_kpi_overview_key" ON "terminal_kpi" ("client_id", "key") WHERE "subject_id" IS NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_terminal_kpi_subject_key" ON "terminal_kpi" ("client_id", "subject_id", "key") WHERE "subject_id" IS NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_terminal_kpi_order" ON "terminal_kpi" ("client_id", "subject_id", "position")`);

        await queryRunner.query(`
            CREATE TABLE "terminal_kpi_value" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "kpi_id" uuid NOT NULL,
                "as_of" TIMESTAMP WITH TIME ZONE NOT NULL,
                "value" numeric,
                "text_value" character varying(120),
                "previous" numeric,
                "meta" jsonb NOT NULL DEFAULT '{}',
                "document_id" uuid,
                "block_id" uuid,
                "ran_at" TIMESTAMP WITH TIME ZONE,
                "recorded_by" uuid,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "PK_terminal_kpi_value_id" PRIMARY KEY ("id"),
                CONSTRAINT "CHK_terminal_kpi_value_present" CHECK ("value" IS NOT NULL OR "text_value" IS NOT NULL),
                CONSTRAINT "CHK_terminal_kpi_value_meta" CHECK (jsonb_typeof("meta") = 'object'),
                CONSTRAINT "FK_terminal_kpi_value_kpi" FOREIGN KEY ("kpi_id") REFERENCES "terminal_kpi"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_terminal_kpi_value_document" FOREIGN KEY ("document_id") REFERENCES "document"("id") ON DELETE SET NULL,
                CONSTRAINT "FK_terminal_kpi_value_user" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE SET NULL
            )
        `);
        // The unique index doubles as the lookup for a KPI's newest readings
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_terminal_kpi_value_as_of" ON "terminal_kpi_value" ("kpi_id", "as_of")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "terminal_kpi_value"`);
        await queryRunner.query(`DROP TABLE "terminal_kpi"`);
    }
}
