import { MigrationInterface, QueryRunner } from "typeorm";

export class ParentMessage1782397334225 implements MigrationInterface {
    name = 'ParentMessage1782397334225'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "messages"
            ADD "parent_id" uuid
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
            ALTER TABLE "messages"
            ADD CONSTRAINT "FK_message_parent" FOREIGN KEY ("parent_id") REFERENCES "messages"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "messages" DROP CONSTRAINT "FK_message_parent"
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
            ALTER TABLE "messages" DROP COLUMN "parent_id"
        `);
    }

}
