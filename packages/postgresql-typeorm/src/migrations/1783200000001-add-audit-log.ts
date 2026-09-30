import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAuditLog1783200000001 implements MigrationInterface {
    name = 'AddAuditLog1783200000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "audit_log_result_enum" AS ENUM ('success', 'failure', 'denied')`);
        await queryRunner.query(`
            CREATE TABLE "audit_log" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "actor_id" uuid,
                "workspace_id" uuid,
                "action" character varying NOT NULL,
                "resource_type" character varying,
                "resource_id" character varying,
                "result" "audit_log_result_enum" NOT NULL,
                "error_message" text,
                "ip" inet,
                "user_agent" text,
                "request_id" character varying,
                "metadata" jsonb,
                CONSTRAINT "PK_audit_log_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`CREATE INDEX "IDX_audit_log_workspace_created" ON "audit_log" ("workspace_id", "created_at")`);
        await queryRunner.query(`CREATE INDEX "IDX_audit_log_actor_created" ON "audit_log" ("actor_id", "created_at")`);

        // Tamper resistance: rows can be inserted but never changed or removed,
        // whichever DB role the app connects as.
        await queryRunner.query(`
            CREATE FUNCTION audit_log_immutable() RETURNS trigger AS $$
            BEGIN
                RAISE EXCEPTION 'audit_log is append-only';
            END;
            $$ LANGUAGE plpgsql
        `);
        await queryRunner.query(`
            CREATE TRIGGER audit_log_no_update_delete
            BEFORE UPDATE OR DELETE ON "audit_log"
            FOR EACH ROW EXECUTE FUNCTION audit_log_immutable()
        `);
        await queryRunner.query(`
            CREATE TRIGGER audit_log_no_truncate
            BEFORE TRUNCATE ON "audit_log"
            FOR EACH STATEMENT EXECUTE FUNCTION audit_log_immutable()
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TRIGGER "audit_log_no_truncate" ON "audit_log"`);
        await queryRunner.query(`DROP TRIGGER "audit_log_no_update_delete" ON "audit_log"`);
        await queryRunner.query(`DROP FUNCTION audit_log_immutable()`);
        await queryRunner.query(`DROP TABLE "audit_log"`);
        await queryRunner.query(`DROP TYPE "audit_log_result_enum"`);
    }
}
