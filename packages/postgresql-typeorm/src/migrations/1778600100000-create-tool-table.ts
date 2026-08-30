import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateToolTable1778600100000 implements MigrationInterface {
    name = 'CreateToolTable1778600100000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "tool" (
                "tool_id" character varying NOT NULL,
                "category_id" character varying NOT NULL,
                "name" character varying NOT NULL,
                "description" text NOT NULL,
                "tags" text[] NOT NULL DEFAULT '{}',
                "ui_hint" character varying NOT NULL DEFAULT 'form',
                "language" character varying NOT NULL DEFAULT 'sql',
                "params" jsonb NOT NULL DEFAULT '[]',
                "template" text NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "PK_tool_tool_id" PRIMARY KEY ("tool_id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_tool_category_id" ON "tool" ("category_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_tool_category_id"`);
        await queryRunner.query(`DROP TABLE "tool"`);
    }
}
