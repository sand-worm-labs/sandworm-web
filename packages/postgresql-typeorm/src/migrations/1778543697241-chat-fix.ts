import { MigrationInterface, QueryRunner } from "typeorm";

export class ChatFix1778543697241 implements MigrationInterface {
    name = 'ChatFix1778543697241'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "chats"
            ADD "workspace_id" uuid NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "chats"
            ADD "document_id" uuid NOT NULL
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
            ALTER TABLE "chats"
            ADD CONSTRAINT "FK_chat_workspace" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "chats"
            ADD CONSTRAINT "FK_chat_document" FOREIGN KEY ("document_id") REFERENCES "document"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "chats" DROP CONSTRAINT "FK_chat_document"
        `);
        await queryRunner.query(`
            ALTER TABLE "chats" DROP CONSTRAINT "FK_chat_workspace"
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
            ALTER TABLE "chats" DROP COLUMN "document_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "chats" DROP COLUMN "workspace_id"
        `);
    }

}
