import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTerminalClientDescription1785500000000 implements MigrationInterface {
    name = 'AddTerminalClientDescription1785500000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "terminal_client" ADD "description" character varying(500) NOT NULL DEFAULT ''`);

        // The NFT marketplace type is gone from the terminal's options
        await queryRunner.query(`UPDATE "terminal_client" SET "type" = 'other' WHERE "type" = 'nft'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "terminal_client" DROP COLUMN "description"`);
    }
}
