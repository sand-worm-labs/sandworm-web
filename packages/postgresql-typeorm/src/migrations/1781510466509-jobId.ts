import { MigrationInterface, QueryRunner } from "typeorm";

export class JobId1781510466509 implements MigrationInterface {
    name = 'JobId1781510466509'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "messages"
            ADD "jobId" character varying
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "messages" DROP COLUMN "jobId"
        `);
    }
}
