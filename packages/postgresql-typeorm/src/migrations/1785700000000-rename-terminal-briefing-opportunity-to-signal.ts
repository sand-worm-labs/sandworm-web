import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameTerminalBriefingOpportunityToSignal1785700000000 implements MigrationInterface {
    name = 'RenameTerminalBriefingOpportunityToSignal1785700000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "terminal_briefing_item" DROP CONSTRAINT "CHK_terminal_briefing_item_kind"`);
        await queryRunner.query(`UPDATE "terminal_briefing_item" SET "kind" = 'signal' WHERE "kind" = 'opportunity'`);
        await queryRunner.query(`ALTER TABLE "terminal_briefing_item" ADD CONSTRAINT "CHK_terminal_briefing_item_kind" CHECK ("kind" IN ('analysis', 'signal', 'metric'))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "terminal_briefing_item" DROP CONSTRAINT "CHK_terminal_briefing_item_kind"`);
        await queryRunner.query(`UPDATE "terminal_briefing_item" SET "kind" = 'opportunity' WHERE "kind" = 'signal'`);
        await queryRunner.query(`ALTER TABLE "terminal_briefing_item" ADD CONSTRAINT "CHK_terminal_briefing_item_kind" CHECK ("kind" IN ('analysis', 'opportunity', 'metric'))`);
    }
}
