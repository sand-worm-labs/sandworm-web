import { MigrationInterface, QueryRunner } from "typeorm";

export class Userandworkspaces1765679617284 implements MigrationInterface {
    name = 'Userandworkspaces1765679617284'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "workspaces" DROP CONSTRAINT "FK_77607c5b6af821ec294d33aab0c"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."user_workspace_role_enum" AS ENUM('editor', 'viewer', 'admin')
        `);
        await queryRunner.query(`
            CREATE TABLE "user_workspace" (
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "user_id" uuid NOT NULL,
                "workspace_id" uuid NOT NULL,
                "inviter_id" uuid,
                "role" "public"."user_workspace_role_enum" NOT NULL DEFAULT 'editor',
                CONSTRAINT "PK_a007c1434d1433fd63d9e5a27a6" PRIMARY KEY ("user_id", "workspace_id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_a007c1434d1433fd63d9e5a27a" ON "user_workspace" ("user_id", "workspace_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "workspaces" DROP COLUMN "ownerId"
        `);
        await queryRunner.query(`
            ALTER TABLE "workspaces" DROP COLUMN "useContext"
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "last_visited_workspace_id" uuid
        `);
        await queryRunner.query(`
            ALTER TABLE "workspaces"
            ADD "use_context" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "workspaces"
            ADD "owner_id" uuid
        `);
        await queryRunner.query(`
            ALTER TABLE "workspaces"
            ADD "assistant_model" character varying NOT NULL DEFAULT 'gpt-4o'
        `);
        await queryRunner.query(`
            ALTER TABLE "user_settings"
            ALTER COLUMN "social_links"
            SET DEFAULT '{}'::jsonb
        `);
        await queryRunner.query(`
            ALTER TABLE "user_settings"
            ALTER COLUMN "wallets"
            SET DEFAULT '[]'::jsonb
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_users_last_visited_workspace_id" ON "users" ("last_visited_workspace_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "user_workspace"
            ADD CONSTRAINT "FK_faf90374b266c152bf3de95eba8" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "user_workspace"
            ADD CONSTRAINT "FK_38805cb60bfb33e754653fbc4f6" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "user_workspace"
            ADD CONSTRAINT "FK_a0f1272c8224ca1432ee6842d2b" FOREIGN KEY ("inviter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "workspaces"
            ADD CONSTRAINT "FK_3bc45ecdd8fdc2108bb92516dde" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "workspaces" DROP CONSTRAINT "FK_3bc45ecdd8fdc2108bb92516dde"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_workspace" DROP CONSTRAINT "FK_a0f1272c8224ca1432ee6842d2b"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_workspace" DROP CONSTRAINT "FK_38805cb60bfb33e754653fbc4f6"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_workspace" DROP CONSTRAINT "FK_faf90374b266c152bf3de95eba8"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_users_last_visited_workspace_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_settings"
            ALTER COLUMN "wallets"
            SET DEFAULT '[]'
        `);
        await queryRunner.query(`
            ALTER TABLE "user_settings"
            ALTER COLUMN "social_links"
            SET DEFAULT '{}'
        `);
        await queryRunner.query(`
            ALTER TABLE "workspaces" DROP COLUMN "assistant_model"
        `);
        await queryRunner.query(`
            ALTER TABLE "workspaces" DROP COLUMN "owner_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "workspaces" DROP COLUMN "use_context"
        `);
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "last_visited_workspace_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "workspaces"
            ADD "useContext" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "workspaces"
            ADD "ownerId" uuid NOT NULL
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_a007c1434d1433fd63d9e5a27a"
        `);
        await queryRunner.query(`
            DROP TABLE "user_workspace"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."user_workspace_role_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "workspaces"
            ADD CONSTRAINT "FK_77607c5b6af821ec294d33aab0c" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

}
