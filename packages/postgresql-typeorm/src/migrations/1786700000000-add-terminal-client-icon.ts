import { MigrationInterface, QueryRunner } from "typeorm";

// A client can carry a logo, shown beside its name.
export class AddTerminalClientIcon1786700000000 implements MigrationInterface {
    name = 'AddTerminalClientIcon1786700000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "terminal_client" ADD "icon" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "terminal_client" DROP COLUMN "icon"`);
    }
}
