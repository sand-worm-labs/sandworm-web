import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTerminalTeamSetup1785600000000 implements MigrationInterface {
    name = 'AddTerminalTeamSetup1785600000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // A client the team creates has no owner until its admin first logs in
        await queryRunner.query(`ALTER TABLE "terminal_client" ALTER COLUMN "owner_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "terminal_client" ADD "plan" character varying(16) NOT NULL DEFAULT 'starter'`);
        await queryRunner.query(`ALTER TABLE "terminal_client" ADD "status" character varying(16) NOT NULL DEFAULT 'live'`);
        await queryRunner.query(`ALTER TABLE "terminal_client" ADD "created_by" uuid`);
        await queryRunner.query(`ALTER TABLE "terminal_client" ADD "starter_ids" text array NOT NULL DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "terminal_client" ADD "invite_timing" character varying(16) NOT NULL DEFAULT 'manual'`);
        await queryRunner.query(`ALTER TABLE "terminal_client" ADD CONSTRAINT "CHK_terminal_client_plan" CHECK ("plan" IN ('starter', 'pro', 'enterprise'))`);
        await queryRunner.query(`ALTER TABLE "terminal_client" ADD CONSTRAINT "CHK_terminal_client_status" CHECK ("status" IN ('setting_up', 'invite_sent', 'live'))`);
        await queryRunner.query(`ALTER TABLE "terminal_client" ADD CONSTRAINT "CHK_terminal_client_invite_timing" CHECK ("invite_timing" IN ('when_ready', 'now', 'manual'))`);
        await queryRunner.query(`ALTER TABLE "terminal_client" ADD CONSTRAINT "FK_terminal_client_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL`);

        await queryRunner.query(`
            CREATE TABLE "terminal_invite" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "client_id" uuid NOT NULL,
                "email" character varying(255) NOT NULL,
                "name" character varying(120) NOT NULL DEFAULT '',
                "access" character varying(16) NOT NULL DEFAULT 'admin',
                "status" character varying(16) NOT NULL DEFAULT 'pending',
                "sent_at" TIMESTAMP WITH TIME ZONE,
                "claimed_at" TIMESTAMP WITH TIME ZONE,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "PK_terminal_invite_id" PRIMARY KEY ("id"),
                CONSTRAINT "CHK_terminal_invite_access" CHECK ("access" IN ('view', 'request', 'admin')),
                CONSTRAINT "CHK_terminal_invite_status" CHECK ("status" IN ('pending', 'sent', 'claimed')),
                CONSTRAINT "FK_terminal_invite_client" FOREIGN KEY ("client_id") REFERENCES "terminal_client"("id") ON DELETE CASCADE
            )
        `);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_terminal_invite_client_email" ON "terminal_invite" ("client_id", "email")`);
        await queryRunner.query(`CREATE INDEX "IDX_terminal_invite_email" ON "terminal_invite" ("email")`);

        // The welcome shows once per member; people who are already in have seen it
        await queryRunner.query(`ALTER TABLE "terminal_member" ADD "welcomed_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`UPDATE "terminal_member" SET "welcomed_at" = "created_at"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "terminal_member" DROP COLUMN "welcomed_at"`);
        await queryRunner.query(`DROP INDEX "IDX_terminal_invite_email"`);
        await queryRunner.query(`DROP INDEX "UQ_terminal_invite_client_email"`);
        await queryRunner.query(`DROP TABLE "terminal_invite"`);
        await queryRunner.query(`ALTER TABLE "terminal_client" DROP CONSTRAINT "FK_terminal_client_created_by"`);
        await queryRunner.query(`ALTER TABLE "terminal_client" DROP CONSTRAINT "CHK_terminal_client_invite_timing"`);
        await queryRunner.query(`ALTER TABLE "terminal_client" DROP CONSTRAINT "CHK_terminal_client_status"`);
        await queryRunner.query(`ALTER TABLE "terminal_client" DROP CONSTRAINT "CHK_terminal_client_plan"`);
        await queryRunner.query(`ALTER TABLE "terminal_client" DROP COLUMN "invite_timing"`);
        await queryRunner.query(`ALTER TABLE "terminal_client" DROP COLUMN "starter_ids"`);
        await queryRunner.query(`ALTER TABLE "terminal_client" DROP COLUMN "created_by"`);
        await queryRunner.query(`ALTER TABLE "terminal_client" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "terminal_client" DROP COLUMN "plan"`);
        await queryRunner.query(`DELETE FROM "terminal_client" WHERE "owner_id" IS NULL`);
        await queryRunner.query(`ALTER TABLE "terminal_client" ALTER COLUMN "owner_id" SET NOT NULL`);
    }
}
