import { MigrationInterface, QueryRunner } from "typeorm";

// What a client writes back about a signal: how it applies to them, in their
// own words. Empty until they write something.
export class AddTerminalSignalFeedback1786000000000 implements MigrationInterface {
    name = 'AddTerminalSignalFeedback1786000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "terminal_signal" ADD "feedback" text NOT NULL DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "terminal_signal" DROP COLUMN "feedback"`);
    }
}
