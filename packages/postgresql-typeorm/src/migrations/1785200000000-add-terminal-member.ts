import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTerminalMember1785200000000 implements MigrationInterface {
    name = 'AddTerminalMember1785200000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "terminal_member" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "client_id" uuid NOT NULL,
                "user_id" uuid NOT NULL,
                "access" character varying(16) NOT NULL DEFAULT 'view',
                "last_seen_briefing_at" TIMESTAMP WITH TIME ZONE,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "PK_terminal_member_id" PRIMARY KEY ("id"),
                CONSTRAINT "CHK_terminal_member_access" CHECK ("access" IN ('view', 'request', 'admin')),
                CONSTRAINT "FK_terminal_member_client" FOREIGN KEY ("client_id") REFERENCES "terminal_client"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_terminal_member_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
            )
        `);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_terminal_member_client_user" ON "terminal_member" ("client_id", "user_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_terminal_member_user" ON "terminal_member" ("user_id")`);

        // Every existing owner becomes an admin member of their client
        await queryRunner.query(`
            INSERT INTO "terminal_member" ("client_id", "user_id", "access")
            SELECT "id", "owner_id", 'admin' FROM "terminal_client"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_terminal_member_user"`);
        await queryRunner.query(`DROP INDEX "UQ_terminal_member_client_user"`);
        await queryRunner.query(`DROP TABLE "terminal_member"`);
    }
}
