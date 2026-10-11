import { MigrationInterface, QueryRunner } from "typeorm";

export class AddToolRequiredEnv1784300000000 implements MigrationInterface {
    name = 'AddToolRequiredEnv1784300000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tool" ADD "required_env" jsonb NOT NULL DEFAULT '[]'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tool" DROP COLUMN "required_env"`);
    }
}
