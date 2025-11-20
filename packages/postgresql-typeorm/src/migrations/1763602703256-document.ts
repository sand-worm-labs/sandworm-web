import { MigrationInterface, QueryRunner } from "typeorm";

export class Document1763602703256 implements MigrationInterface {
    name = 'Document1763602703256'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "document" DROP CONSTRAINT "FK_workspace_document"
        `);
        await queryRunner.query(`
            ALTER TABLE "document" DROP CONSTRAINT "FK_document_forked_from"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."UQ_document_slug"
        `);
        await queryRunner.query(`
            ALTER TABLE "document" DROP COLUMN "forked_from_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "document" DROP COLUMN "description"
        `);
        await queryRunner.query(`
            ALTER TABLE "document" DROP COLUMN "body"
        `);
        await queryRunner.query(`
            ALTER TABLE "document"
            ADD "order_index" integer NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "document"
            ADD "deleted_at" TIMESTAMP
        `);
        await queryRunner.query(`
            ALTER TABLE "document"
            ADD "version" integer NOT NULL DEFAULT '1'
        `);
        await queryRunner.query(`
            ALTER TABLE "document"
            ADD "isSyncedWithYjs" boolean NOT NULL DEFAULT false
        `);
        await queryRunner.query(`
            ALTER TABLE "document"
            ADD "parent_id" uuid
        `);
        await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "FK_76ba283779c8441fd5ff819c8cf"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_settings" DROP CONSTRAINT "PK_user_setting_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_settings" DROP COLUMN "id"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_settings"
            ADD "id" SERIAL NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "user_settings"
            ADD CONSTRAINT "PK_user_setting_id" PRIMARY KEY ("id")
        `);
        await queryRunner.query(`
            ALTER TABLE "user_settings"
            ALTER COLUMN "social_links"
            SET DEFAULT '{}'::jsonb
        `);
        await queryRunner.query(`
            ALTER TABLE "user_settings"
            ALTER COLUMN "wallets"
            SET DEFAULT '[]'::jsonb
        `);
        await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "REL_76ba283779c8441fd5ff819c8c"
        `);
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "settingsId"
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "settingsId" integer
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "UQ_76ba283779c8441fd5ff819c8cf" UNIQUE ("settingsId")
        `);
        await queryRunner.query(`
            ALTER TABLE "document"
            ALTER COLUMN "slug"
            SET DEFAULT 'DocumentIcon'
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "FK_76ba283779c8441fd5ff819c8cf" FOREIGN KEY ("settingsId") REFERENCES "user_settings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "document"
            ADD CONSTRAINT "FK_document_workspace" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "document"
            ADD CONSTRAINT "FK_document_parent" FOREIGN KEY ("parent_id") REFERENCES "document"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "document" DROP CONSTRAINT "FK_document_parent"
        `);
        await queryRunner.query(`
            ALTER TABLE "document" DROP CONSTRAINT "FK_document_workspace"
        `);
        await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "FK_76ba283779c8441fd5ff819c8cf"
        `);
        await queryRunner.query(`
            ALTER TABLE "document"
            ALTER COLUMN "slug" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "UQ_76ba283779c8441fd5ff819c8cf"
        `);
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "settingsId"
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "settingsId" uuid
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "REL_76ba283779c8441fd5ff819c8c" UNIQUE ("settingsId")
        `);
        await queryRunner.query(`
            ALTER TABLE "user_settings"
            ALTER COLUMN "wallets"
            SET DEFAULT '[]'
        `);
        await queryRunner.query(`
            ALTER TABLE "user_settings"
            ALTER COLUMN "social_links"
            SET DEFAULT '{}'
        `);
        await queryRunner.query(`
            ALTER TABLE "user_settings" DROP CONSTRAINT "PK_user_setting_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_settings" DROP COLUMN "id"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_settings"
            ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()
        `);
        await queryRunner.query(`
            ALTER TABLE "user_settings"
            ADD CONSTRAINT "PK_user_setting_id" PRIMARY KEY ("id")
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "FK_76ba283779c8441fd5ff819c8cf" FOREIGN KEY ("settingsId") REFERENCES "user_settings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "document" DROP COLUMN "parent_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "document" DROP COLUMN "isSyncedWithYjs"
        `);
        await queryRunner.query(`
            ALTER TABLE "document" DROP COLUMN "version"
        `);
        await queryRunner.query(`
            ALTER TABLE "document" DROP COLUMN "deleted_at"
        `);
        await queryRunner.query(`
            ALTER TABLE "document" DROP COLUMN "order_index"
        `);
        await queryRunner.query(`
            ALTER TABLE "document"
            ADD "body" character varying NOT NULL DEFAULT ''
        `);
        await queryRunner.query(`
            ALTER TABLE "document"
            ADD "description" character varying NOT NULL DEFAULT ''
        `);
        await queryRunner.query(`
            ALTER TABLE "document"
            ADD "forked_from_id" uuid
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "UQ_document_slug" ON "document" ("slug")
        `);
        await queryRunner.query(`
            ALTER TABLE "document"
            ADD CONSTRAINT "FK_document_forked_from" FOREIGN KEY ("forked_from_id") REFERENCES "document"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "document"
            ADD CONSTRAINT "FK_workspace_document" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

}
