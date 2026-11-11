import { MigrationInterface, QueryRunner } from "typeorm";

// When a client last changed what it tracks, so its Overview can show as recalculating.
export class AddTerminalClientTrackingChangedAt1786800000000 implements MigrationInterface {
    name = 'AddTerminalClientTrackingChangedAt1786800000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "terminal_client" ADD "tracking_changed_at" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "terminal_client" DROP COLUMN "tracking_changed_at"`);
    }
}
