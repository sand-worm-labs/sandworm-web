import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBountyDetails1783700000000 implements MigrationInterface {
    name = 'AddBountyDetails1783700000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bounty" ADD "details" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bounty" DROP COLUMN "details"`);
    }
}
