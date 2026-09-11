import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateDefaultAssistantModel1783200000000 implements MigrationInterface {
    name = 'UpdateDefaultAssistantModel1783200000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "workspace" ALTER COLUMN "assistant_model" SET DEFAULT 'deepseek/deepseek-v4-flash-0731'
        `);
        await queryRunner.query(`
            UPDATE "workspace" SET "assistant_model" = 'deepseek/deepseek-v4-flash-0731'
            WHERE "assistant_model" = 'anthropic/claude-sonnet-4.6'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "workspace" ALTER COLUMN "assistant_model" SET DEFAULT 'anthropic/claude-sonnet-4.6'
        `);
        await queryRunner.query(`
            UPDATE "workspace" SET "assistant_model" = 'anthropic/claude-sonnet-4.6'
            WHERE "assistant_model" = 'deepseek/deepseek-v4-flash-0731'
        `);
    }
}
