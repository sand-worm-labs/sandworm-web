import { MigrationInterface, QueryRunner } from "typeorm";

export class FavouriteAndOnboard1763485145967 implements MigrationInterface {
    name = 'FavouriteAndOnboard1763485145967'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user_settings" DROP CONSTRAINT "FK_00f004f5922a0744d174530d639"
        `);
        await queryRunner.query(`
            CREATE TABLE "user_yjs_app_document" (
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "yjs_app_document_id" uuid NOT NULL,
                "user_id" uuid NOT NULL,
                "clock" integer NOT NULL DEFAULT '0',
                "clock_updated_at" TIMESTAMP WITH TIME ZONE,
                "state" bytea NOT NULL,
                "user_changed_state" boolean NOT NULL DEFAULT false,
                CONSTRAINT "PK_5992a657376fc89959351e97ad8" PRIMARY KEY ("yjs_app_document_id", "user_id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "yjs_app_document" (
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "clock" integer NOT NULL DEFAULT '0',
                "clock_updated_at" TIMESTAMP WITH TIME ZONE,
                "state" bytea NOT NULL,
                "has_dashboard" boolean NOT NULL DEFAULT false,
                "document_id" uuid NOT NULL,
                CONSTRAINT "PK_d9ea8acee1f87b1a3b010c5a7df" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "favorites" (
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "document_id" uuid NOT NULL,
                "user_id" uuid NOT NULL,
                CONSTRAINT "PK_favorite_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "UQ_favorite_userid_documentdid" ON "favorites" ("user_id", "document_id")
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."execution_schedule_type_enum" AS ENUM('hourly', 'daily', 'weekly', 'monthly', 'cron')
        `);
        await queryRunner.query(`
            CREATE TABLE "execution_schedule" (
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "type" "public"."execution_schedule_type_enum" NOT NULL,
                "hour" integer,
                "minute" integer,
                "cron" text,
                "weekdays" text,
                "days" text,
                "timezone" text NOT NULL,
                "document_id" uuid NOT NULL,
                CONSTRAINT "PK_55bbd069d5f0fd946433cf8194f" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "reusable_component_instance" (
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "block_id" uuid NOT NULL,
                "reusable_component_id" uuid NOT NULL,
                "document_id" uuid NOT NULL,
                CONSTRAINT "UQ_26498c86f5fbc070d3b15d5f684" UNIQUE ("block_id"),
                CONSTRAINT "PK_431fc75a48eabec75c670ae7049" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."reusable_component_type_enum" AS ENUM('sql', 'python')
        `);
        await queryRunner.query(`
            CREATE TABLE "reusable_component" (
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "state" bytea NOT NULL,
                "type" "public"."reusable_component_type_enum" NOT NULL,
                "title" character varying NOT NULL,
                "block_id" uuid NOT NULL,
                "document_id" uuid NOT NULL,
                "instances_created" boolean NOT NULL DEFAULT true,
                CONSTRAINT "UQ_f3022cf51ea57c40eb685e63c23" UNIQUE ("block_id"),
                CONSTRAINT "PK_4aeff34a0983b0b75f7ede2d486" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "yjs_document" (
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "clock" integer NOT NULL DEFAULT '0',
                "clock_updated_at" TIMESTAMP WITH TIME ZONE,
                "state" bytea NOT NULL,
                "document_id" uuid NOT NULL,
                CONSTRAINT "UQ_c749cda5e928e56dac91a081819" UNIQUE ("document_id"),
                CONSTRAINT "PK_a1c4d05938856a257cecb3ac569" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "yjs_update" (
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "update" bytea NOT NULL,
                "clock" integer NOT NULL,
                "yjs_document_id" uuid,
                "yjs_app_document_id" uuid,
                "user_yjs_app_document_yjs_app_document_id" uuid,
                "user_yjs_app_document_user_id" uuid,
                CONSTRAINT "PK_d51d08e6dd992136cb6432c1931" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "socket_io_attachments" (
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "id" BIGSERIAL NOT NULL,
                "payload" bytea NOT NULL,
                CONSTRAINT "PK_dc5b76127041ee7cfa4d5f416d1" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "pub_sub_payload" (
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "payload" bytea NOT NULL,
                CONSTRAINT "PK_d415b8fae27041727abbf7069ba" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "user_settings"
            ADD "user_id" uuid NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "user_settings"
            ADD CONSTRAINT "UQ_4ed056b9344e6f7d8d46ec4b302" UNIQUE ("user_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "document"
            ADD "runUnexecutedBlocks" boolean NOT NULL DEFAULT false
        `);
        await queryRunner.query(`
            ALTER TABLE "document"
            ADD "runSQLSelection" boolean NOT NULL DEFAULT true
        `);
        await queryRunner.query(`
            ALTER TABLE "document"
            ADD "shareLinksWithoutSidebar" boolean NOT NULL DEFAULT true
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
            ALTER TYPE "public"."onboarding_tutorials_currentstep_enum"
            RENAME TO "onboarding_tutorials_currentstep_enum_old"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."onboarding_tutorials_currentstep_enum" AS ENUM(
                'connectDataSource',
                'runQuery',
                'runPython',
                'createVisualization',
                'publishDashboard',
                'inviteTeamMembers'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "onboarding_tutorials"
            ALTER COLUMN "currentStep" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "onboarding_tutorials"
            ALTER COLUMN "currentStep" TYPE "public"."onboarding_tutorials_currentstep_enum" USING "currentStep"::"text"::"public"."onboarding_tutorials_currentstep_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "onboarding_tutorials"
            ALTER COLUMN "currentStep"
            SET DEFAULT 'runQuery'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."onboarding_tutorials_currentstep_enum_old"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."workspaces_plan_enum"
            RENAME TO "workspaces_plan_enum_old"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."workspaces_plan_enum" AS ENUM('free', 'trial', 'enterprise', 'professional')
        `);
        await queryRunner.query(`
            ALTER TABLE "workspaces"
            ALTER COLUMN "plan" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "workspaces"
            ALTER COLUMN "plan" TYPE "public"."workspaces_plan_enum" USING "plan"::"text"::"public"."workspaces_plan_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "workspaces"
            ALTER COLUMN "plan"
            SET DEFAULT 'free'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."workspaces_plan_enum_old"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_settings"
            ADD CONSTRAINT "FK_4ed056b9344e6f7d8d46ec4b302" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "user_yjs_app_document"
            ADD CONSTRAINT "FK_user_yjs_app_document_yjs_app_document" FOREIGN KEY ("yjs_app_document_id") REFERENCES "yjs_app_document"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "user_yjs_app_document"
            ADD CONSTRAINT "FK_user_yjs_app_document_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "yjs_app_document"
            ADD CONSTRAINT "FK_yjs_app_document_document" FOREIGN KEY ("document_id") REFERENCES "document"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "favorites"
            ADD CONSTRAINT "FK_favorite_document" FOREIGN KEY ("document_id") REFERENCES "document"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "favorites"
            ADD CONSTRAINT "FK_favorite_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "execution_schedule"
            ADD CONSTRAINT "FK_execution_schedule_document" FOREIGN KEY ("document_id") REFERENCES "document"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "reusable_component_instance"
            ADD CONSTRAINT "FK_c8992e1e04e0f4e330f8e2829ef" FOREIGN KEY ("reusable_component_id") REFERENCES "reusable_component"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "reusable_component_instance"
            ADD CONSTRAINT "FK_cd94c016ef90e6456206c241d31" FOREIGN KEY ("document_id") REFERENCES "document"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "reusable_component"
            ADD CONSTRAINT "FK_aacab3ad4b236b4b2ec57d2b5a6" FOREIGN KEY ("document_id") REFERENCES "document"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "yjs_document"
            ADD CONSTRAINT "FK_yjs_document_document" FOREIGN KEY ("document_id") REFERENCES "document"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "yjs_update"
            ADD CONSTRAINT "FK_yjs_update_yjs_document" FOREIGN KEY ("yjs_document_id") REFERENCES "yjs_document"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "yjs_update"
            ADD CONSTRAINT "FK_yjs_update_yjs_app_document" FOREIGN KEY ("yjs_app_document_id") REFERENCES "yjs_app_document"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "yjs_update"
            ADD CONSTRAINT "FK_yjs_update_user_yjs_app_document_yjs_app_document" FOREIGN KEY (
                    "user_yjs_app_document_yjs_app_document_id",
                    "user_yjs_app_document_user_id"
                ) REFERENCES "user_yjs_app_document"("yjs_app_document_id", "user_id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "yjs_update" DROP CONSTRAINT "FK_yjs_update_user_yjs_app_document_yjs_app_document"
        `);
        await queryRunner.query(`
            ALTER TABLE "yjs_update" DROP CONSTRAINT "FK_yjs_update_yjs_app_document"
        `);
        await queryRunner.query(`
            ALTER TABLE "yjs_update" DROP CONSTRAINT "FK_yjs_update_yjs_document"
        `);
        await queryRunner.query(`
            ALTER TABLE "yjs_document" DROP CONSTRAINT "FK_yjs_document_document"
        `);
        await queryRunner.query(`
            ALTER TABLE "reusable_component" DROP CONSTRAINT "FK_aacab3ad4b236b4b2ec57d2b5a6"
        `);
        await queryRunner.query(`
            ALTER TABLE "reusable_component_instance" DROP CONSTRAINT "FK_cd94c016ef90e6456206c241d31"
        `);
        await queryRunner.query(`
            ALTER TABLE "reusable_component_instance" DROP CONSTRAINT "FK_c8992e1e04e0f4e330f8e2829ef"
        `);
        await queryRunner.query(`
            ALTER TABLE "execution_schedule" DROP CONSTRAINT "FK_execution_schedule_document"
        `);
        await queryRunner.query(`
            ALTER TABLE "favorites" DROP CONSTRAINT "FK_favorite_user"
        `);
        await queryRunner.query(`
            ALTER TABLE "favorites" DROP CONSTRAINT "FK_favorite_document"
        `);
        await queryRunner.query(`
            ALTER TABLE "yjs_app_document" DROP CONSTRAINT "FK_yjs_app_document_document"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_yjs_app_document" DROP CONSTRAINT "FK_user_yjs_app_document_user"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_yjs_app_document" DROP CONSTRAINT "FK_user_yjs_app_document_yjs_app_document"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_settings" DROP CONSTRAINT "FK_4ed056b9344e6f7d8d46ec4b302"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."workspaces_plan_enum_old" AS ENUM('free', 'pro', 'enterprise')
        `);
        await queryRunner.query(`
            ALTER TABLE "workspaces"
            ALTER COLUMN "plan" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "workspaces"
            ALTER COLUMN "plan" TYPE "public"."workspaces_plan_enum_old" USING "plan"::"text"::"public"."workspaces_plan_enum_old"
        `);
        await queryRunner.query(`
            ALTER TABLE "workspaces"
            ALTER COLUMN "plan"
            SET DEFAULT 'free'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."workspaces_plan_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."workspaces_plan_enum_old"
            RENAME TO "workspaces_plan_enum"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."onboarding_tutorials_currentstep_enum_old" AS ENUM(
                'runQuery',
                'runPython',
                'createVisualization',
                'publishDashboard',
                'inviteTeamMembers'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "onboarding_tutorials"
            ALTER COLUMN "currentStep" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "onboarding_tutorials"
            ALTER COLUMN "currentStep" TYPE "public"."onboarding_tutorials_currentstep_enum_old" USING "currentStep"::"text"::"public"."onboarding_tutorials_currentstep_enum_old"
        `);
        await queryRunner.query(`
            ALTER TABLE "onboarding_tutorials"
            ALTER COLUMN "currentStep"
            SET DEFAULT 'runQuery'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."onboarding_tutorials_currentstep_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."onboarding_tutorials_currentstep_enum_old"
            RENAME TO "onboarding_tutorials_currentstep_enum"
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
            ALTER TABLE "document" DROP COLUMN "shareLinksWithoutSidebar"
        `);
        await queryRunner.query(`
            ALTER TABLE "document" DROP COLUMN "runSQLSelection"
        `);
        await queryRunner.query(`
            ALTER TABLE "document" DROP COLUMN "runUnexecutedBlocks"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_settings" DROP CONSTRAINT "UQ_4ed056b9344e6f7d8d46ec4b302"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_settings" DROP COLUMN "user_id"
        `);
        await queryRunner.query(`
            DROP TABLE "pub_sub_payload"
        `);
        await queryRunner.query(`
            DROP TABLE "socket_io_attachments"
        `);
        await queryRunner.query(`
            DROP TABLE "yjs_update"
        `);
        await queryRunner.query(`
            DROP TABLE "yjs_document"
        `);
        await queryRunner.query(`
            DROP TABLE "reusable_component"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."reusable_component_type_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "reusable_component_instance"
        `);
        await queryRunner.query(`
            DROP TABLE "execution_schedule"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."execution_schedule_type_enum"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."UQ_favorite_userid_documentdid"
        `);
        await queryRunner.query(`
            DROP TABLE "favorites"
        `);
        await queryRunner.query(`
            DROP TABLE "yjs_app_document"
        `);
        await queryRunner.query(`
            DROP TABLE "user_yjs_app_document"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_settings"
            ADD CONSTRAINT "FK_00f004f5922a0744d174530d639" FOREIGN KEY ("id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

}
