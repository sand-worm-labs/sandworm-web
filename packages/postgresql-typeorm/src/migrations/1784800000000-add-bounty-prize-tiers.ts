import { MigrationInterface, QueryRunner } from "typeorm";

// The agreed prize for each place of a bounty. A bounty made before this has none: it keeps paying
// what is left in its escrow to one winner.
export class AddBountyPrizeTiers1784800000000 implements MigrationInterface {
    name = 'AddBountyPrizeTiers1784800000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bounty" ADD "prize_tiers" jsonb NOT NULL DEFAULT '[]'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bounty" DROP COLUMN "prize_tiers"`);
    }
}
