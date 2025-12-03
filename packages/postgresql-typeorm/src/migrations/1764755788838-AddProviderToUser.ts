import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProviderToUser1764755788838 implements MigrationInterface {
    name = 'AddProviderToUser1764755788838'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."environment_status_enum" AS ENUM('Running', 'Stopped', 'Failing', 'Starting', 'Stopping')`);
        await queryRunner.query(`CREATE TABLE "environment" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "workspace_id" uuid NOT NULL, "status" "public"."environment_status_enum" NOT NULL DEFAULT 'Stopped', "started_at" TIMESTAMP, "last_activity_at" TIMESTAMP, "resource_version" integer NOT NULL DEFAULT '0', "jupyter_token" character varying NOT NULL DEFAULT '', CONSTRAINT "UQ_0acde356a5740e99296eb524abe" UNIQUE ("workspace_id"), CONSTRAINT "unique_workspaceId" UNIQUE ("workspace_id"), CONSTRAINT "REL_0acde356a5740e99296eb524ab" UNIQUE ("workspace_id"), CONSTRAINT "PK_environment_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "environment_variable" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "value" character varying NOT NULL, "workspace_id" uuid NOT NULL, CONSTRAINT "unique_workspaceId_name" UNIQUE ("workspace_id", "name"), CONSTRAINT "PK_environment_variable_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sessions" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "hash" character varying NOT NULL, "deletedAt" TIMESTAMP, "userId" uuid, CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_57de40bc620f456c7311aa3a1e" ON "sessions" ("userId") `);
        await queryRunner.query(`ALTER TABLE "users" ADD "provider" character varying NOT NULL DEFAULT 'email'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "social_id" character varying`);
        await queryRunner.query(`ALTER TABLE "execution_schedule" ADD "isActive" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "execution_schedule" ADD "lastExecutedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "execution_schedule" ADD "nextExecutionAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "user_settings" ALTER COLUMN "social_links" SET DEFAULT '{}'::jsonb`);
        await queryRunner.query(`ALTER TABLE "user_settings" ALTER COLUMN "wallets" SET DEFAULT '[]'::jsonb`);
        await queryRunner.query(`CREATE INDEX "IDX_users_social_id" ON "users" ("social_id") `);
        await queryRunner.query(`ALTER TABLE "environment" ADD CONSTRAINT "FK_environment_workspace" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "environment_variable" ADD CONSTRAINT "FK_environment_variable_workspace" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD CONSTRAINT "FK_57de40bc620f456c7311aa3a1e6" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_57de40bc620f456c7311aa3a1e6"`);
        await queryRunner.query(`ALTER TABLE "environment_variable" DROP CONSTRAINT "FK_environment_variable_workspace"`);
        await queryRunner.query(`ALTER TABLE "environment" DROP CONSTRAINT "FK_environment_workspace"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_users_social_id"`);
        await queryRunner.query(`ALTER TABLE "user_settings" ALTER COLUMN "wallets" SET DEFAULT '[]'`);
        await queryRunner.query(`ALTER TABLE "user_settings" ALTER COLUMN "social_links" SET DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "execution_schedule" DROP COLUMN "nextExecutionAt"`);
        await queryRunner.query(`ALTER TABLE "execution_schedule" DROP COLUMN "lastExecutedAt"`);
        await queryRunner.query(`ALTER TABLE "execution_schedule" DROP COLUMN "isActive"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "social_id"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "provider"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_57de40bc620f456c7311aa3a1e"`);
        await queryRunner.query(`DROP TABLE "sessions"`);
        await queryRunner.query(`DROP TABLE "environment_variable"`);
        await queryRunner.query(`DROP TABLE "environment"`);
        await queryRunner.query(`DROP TYPE "public"."environment_status_enum"`);
    }

}
