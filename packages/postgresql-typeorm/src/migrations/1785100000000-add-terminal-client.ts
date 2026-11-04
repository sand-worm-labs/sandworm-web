import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTerminalClient1785100000000 implements MigrationInterface {
    name = 'AddTerminalClient1785100000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "terminal_client" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "owner_id" uuid NOT NULL,
                "type" character varying(32) NOT NULL,
                "name" character varying(120) NOT NULL DEFAULT '',
                "website" character varying(255) NOT NULL DEFAULT '',
                "tracking" jsonb NOT NULL DEFAULT '{}',
                "goals" text array NOT NULL DEFAULT '{}',
                "invites" jsonb NOT NULL DEFAULT '[]',
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "PK_terminal_client_id" PRIMARY KEY ("id"),
                CONSTRAINT "FK_terminal_client_owner" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE
            )
        `);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_terminal_client_owner" ON "terminal_client" ("owner_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "UQ_terminal_client_owner"`);
        await queryRunner.query(`DROP TABLE "terminal_client"`);
    }
}
