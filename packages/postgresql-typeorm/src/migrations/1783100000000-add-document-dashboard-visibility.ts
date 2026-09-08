import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDocumentDashboardVisibility1783100000000 implements MigrationInterface {
    name = 'AddDocumentDashboardVisibility1783100000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "document" ADD COLUMN "isDashboardPublic" boolean NOT NULL DEFAULT true
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "document" DROP COLUMN "isDashboardPublic"
        `);
    }
}
