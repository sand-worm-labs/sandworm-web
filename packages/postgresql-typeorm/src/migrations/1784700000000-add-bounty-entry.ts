import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBountyEntry1784700000000 implements MigrationInterface {
    name = 'AddBountyEntry1784700000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "bounty_entry" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "bounty_slug" character varying NOT NULL,
                "document_id" uuid NOT NULL,
                "author_id" uuid NOT NULL,
                "wallet" character varying,
                "submitted_at" TIMESTAMP WITH TIME ZONE,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "PK_bounty_entry_id" PRIMARY KEY ("id"),
                CONSTRAINT "FK_bounty_entry_bounty" FOREIGN KEY ("bounty_slug") REFERENCES "bounty"("slug") ON DELETE CASCADE,
                CONSTRAINT "FK_bounty_entry_document" FOREIGN KEY ("document_id") REFERENCES "document"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_bounty_entry_author" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE
            )
        `);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_bounty_entry_bounty_author" ON "bounty_entry" ("bounty_slug", "author_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "UQ_bounty_entry_bounty_author"`);
        await queryRunner.query(`DROP TABLE "bounty_entry"`);
    }
}
