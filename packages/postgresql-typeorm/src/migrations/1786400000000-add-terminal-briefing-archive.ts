import { MigrationInterface, QueryRunner } from "typeorm";

// A member can put a briefing item away. It stays in the briefing for the team
// and for the member's Archived tab; archiving reads it too.
export class AddTerminalBriefingArchive1786400000000 implements MigrationInterface {
    name = 'AddTerminalBriefingArchive1786400000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "terminal_briefing_read" ADD "archived_at" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "terminal_briefing_read" DROP COLUMN "archived_at"`);
    }
}
