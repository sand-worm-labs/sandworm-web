import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDocumentRuntime1784200000000 implements MigrationInterface {
    name = 'AddDocumentRuntime1784200000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."document_runtime_enum" AS ENUM('CLOUD', 'BROWSER_ANALYSIS', 'BROWSER_DASHBOARD')`);
        await queryRunner.query(`ALTER TABLE "document" ADD "runtime" "public"."document_runtime_enum" NOT NULL DEFAULT 'CLOUD'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document" DROP COLUMN "runtime"`);
        await queryRunner.query(`DROP TYPE "public"."document_runtime_enum"`);
    }
}
