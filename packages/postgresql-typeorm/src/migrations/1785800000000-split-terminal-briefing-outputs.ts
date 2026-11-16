import { MigrationInterface, QueryRunner } from "typeorm";

export class SplitTerminalBriefingOutputs1785800000000 implements MigrationInterface {
    name = 'SplitTerminalBriefingOutputs1785800000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "terminal_briefing_item" ADD "outputs" jsonb NOT NULL DEFAULT '[]'`);
        await queryRunner.query(`
            UPDATE "terminal_briefing_item"
            SET "outputs" = COALESCE("detail"->'outputs', '[]'::jsonb),
                "detail" = "detail" - 'outputs'
            WHERE "detail" ? 'outputs'
        `);
        await queryRunner.query(`ALTER TABLE "terminal_briefing_item" ADD CONSTRAINT "CHK_terminal_briefing_item_outputs_array" CHECK (jsonb_typeof("outputs") = 'array')`);
        await queryRunner.query(`ALTER TABLE "terminal_briefing_item" ADD CONSTRAINT "CHK_terminal_briefing_item_outputs_size" CHECK (octet_length("outputs"::text) <= 2097152)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "terminal_briefing_item" DROP CONSTRAINT "CHK_terminal_briefing_item_outputs_size"`);
        await queryRunner.query(`ALTER TABLE "terminal_briefing_item" DROP CONSTRAINT "CHK_terminal_briefing_item_outputs_array"`);
        await queryRunner.query(`
            UPDATE "terminal_briefing_item"
            SET "detail" = "detail" || jsonb_build_object('outputs', "outputs")
            WHERE jsonb_array_length("outputs") > 0
        `);
        await queryRunner.query(`ALTER TABLE "terminal_briefing_item" DROP COLUMN "outputs"`);
    }
}
