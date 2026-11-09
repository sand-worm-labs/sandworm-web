import { MigrationInterface, QueryRunner } from "typeorm";

// A signal carries the facts, entities and next steps behind it, and the client's reason for setting it aside.
export class AddTerminalSignalDetail1786600000000 implements MigrationInterface {
    name = 'AddTerminalSignalDetail1786600000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "terminal_signal" ADD "dismiss_reason" character varying(16)`);
        await queryRunner.query(`ALTER TABLE "terminal_signal" ADD "detail" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "terminal_signal" DROP COLUMN "detail"`);
        await queryRunner.query(`ALTER TABLE "terminal_signal" DROP COLUMN "dismiss_reason"`);
    }
}
