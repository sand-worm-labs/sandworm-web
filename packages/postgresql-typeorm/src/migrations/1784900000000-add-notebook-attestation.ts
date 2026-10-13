import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNotebookAttestation1784900000000 implements MigrationInterface {
    name = 'AddNotebookAttestation1784900000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "notebook_attestation" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "document_id" uuid NOT NULL,
                "workspace_id" uuid NOT NULL,
                "agent_id" character varying NOT NULL,
                "request_hash" character varying(66) NOT NULL,
                "receipt_uri" text NOT NULL,
                "code_hash" character varying(66) NOT NULL,
                "input_hash" character varying(66) NOT NULL,
                "ran_at" TIMESTAMP WITH TIME ZONE NOT NULL,
                "validator" character varying(42) NOT NULL,
                "response" smallint,
                "request_tx" character varying(66) NOT NULL,
                "response_tx" character varying(66),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "PK_notebook_attestation_id" PRIMARY KEY ("id"),
                CONSTRAINT "FK_notebook_attestation_document" FOREIGN KEY ("document_id") REFERENCES "document"("id") ON DELETE CASCADE
            )
        `);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_notebook_attestation_request_hash" ON "notebook_attestation" ("request_hash")`);
        await queryRunner.query(`CREATE INDEX "IDX_notebook_attestation_document" ON "notebook_attestation" ("document_id")`);

        await queryRunner.query(`ALTER TABLE "bounty_entry" ADD "attestation_id" uuid`);
        await queryRunner.query(`
            ALTER TABLE "bounty_entry"
            ADD CONSTRAINT "FK_bounty_entry_attestation" FOREIGN KEY ("attestation_id") REFERENCES "notebook_attestation"("id") ON DELETE SET NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bounty_entry" DROP CONSTRAINT "FK_bounty_entry_attestation"`);
        await queryRunner.query(`ALTER TABLE "bounty_entry" DROP COLUMN "attestation_id"`);
        await queryRunner.query(`DROP INDEX "IDX_notebook_attestation_document"`);
        await queryRunner.query(`DROP INDEX "UQ_notebook_attestation_request_hash"`);
        await queryRunner.query(`DROP TABLE "notebook_attestation"`);
    }
}
