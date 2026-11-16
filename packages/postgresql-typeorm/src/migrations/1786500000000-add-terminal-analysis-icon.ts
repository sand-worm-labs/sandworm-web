import { MigrationInterface, QueryRunner } from "typeorm";

// A project, region or sector can carry a logo, a flag or a symbol next to its name.
export class AddTerminalAnalysisIcon1786500000000 implements MigrationInterface {
    name = 'AddTerminalAnalysisIcon1786500000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "terminal_analysis_subject" ADD "icon" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "terminal_analysis_subject" DROP COLUMN "icon"`);
    }
}
