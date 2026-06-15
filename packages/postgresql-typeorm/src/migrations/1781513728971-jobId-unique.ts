import { MigrationInterface, QueryRunner } from "typeorm";

export class JobIdUnique1781513728971 implements MigrationInterface {
    name = 'JobIdUnique1781513728971'

    public async up(queryRunner: QueryRunner): Promise<void> {
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
            DELETE FROM "messages" m1
            USING "messages" m2
            WHERE m1.ctid > m2.ctid
              AND m1."jobId" IS NOT NULL
              AND m1."jobId" = m2."jobId"
              AND m1."chat_id" = m2."chat_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "messages"
            ADD CONSTRAINT "UQ_bfb819432a57dc69dd2ec9b3f87" UNIQUE ("jobId", "chat_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "messages" DROP CONSTRAINT "UQ_bfb819432a57dc69dd2ec9b3f87"
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
    }

}
