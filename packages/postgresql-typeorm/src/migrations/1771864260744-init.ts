import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1771864260744 implements MigrationInterface {
    name = 'Init1771864260744'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "votes" (
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "user_id" uuid NOT NULL,
                "chat_id" uuid NOT NULL,
                "message_id" uuid NOT NULL,
                "is_upvoted" boolean NOT NULL,
                CONSTRAINT "PK_3c797a2a6a2dc026144a41755f6" PRIMARY KEY ("user_id", "chat_id", "message_id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "messages" (
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "role" character varying NOT NULL,
                "parts" jsonb NOT NULL,
                "attachments" jsonb NOT NULL,
                "chat_id" uuid,
                CONSTRAINT "PK_message_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "chats" (
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" text NOT NULL,
                "is_visible" boolean NOT NULL DEFAULT false,
                "last_context" jsonb,
                "user_id" uuid NOT NULL,
                CONSTRAINT "PK_chat_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "comment" (
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "body" character varying NOT NULL,
                "document_id" uuid NOT NULL,
                "author_id" uuid NOT NULL,
                CONSTRAINT "PK_comment_id" PRIMARY KEY ("id")
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
            CREATE TABLE "onboarding_tutorials" (
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL,
                "workspaceId" uuid NOT NULL,
                "currentStep" "public"."onboarding_tutorials_currentstep_enum" NOT NULL DEFAULT 'runQuery',
                "isComplete" boolean NOT NULL DEFAULT false,
                "isDismissed" boolean NOT NULL DEFAULT false,
                CONSTRAINT "user_workspace_unique" UNIQUE ("userId", "workspaceId"),
                CONSTRAINT "PK_onboarding_tutorial_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "user_follows" (
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "follower_id" uuid NOT NULL,
                "followee_id" uuid NOT NULL,
                CONSTRAINT "PK_user_follows_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "UQ_user_follows_follower_id" ON "user_follows" ("follower_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "UQ_user_follows_followee_id" ON "user_follows" ("followee_id")
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "UQ_user_follows_follower_id_followee_id" ON "user_follows" ("follower_id", "followee_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "user_settings" (
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "id" SERIAL NOT NULL,
                "user_id" uuid NOT NULL,
                "social_links" jsonb NOT NULL DEFAULT '{}'::jsonb,
                "status_text" text NOT NULL DEFAULT 'Just joined 🚀',
                "status_updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "wallets" jsonb NOT NULL DEFAULT '[]'::jsonb,
                CONSTRAINT "UQ_4ed056b9344e6f7d8d46ec4b302" UNIQUE ("user_id"),
                CONSTRAINT "REL_4ed056b9344e6f7d8d46ec4b30" UNIQUE ("user_id"),
                CONSTRAINT "PK_user_setting_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."user_workspace_role_enum" AS ENUM('editor', 'viewer', 'admin')
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."user_workspace_status_enum" AS ENUM('active', 'removed', 'pending')
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."user_workspace_requested_role_enum" AS ENUM('editor', 'viewer', 'admin')
        `);
        await queryRunner.query(`
            CREATE TABLE "user_workspace" (
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "user_id" uuid NOT NULL,
                "workspace_id" uuid NOT NULL,
                "inviter_id" uuid,
                "role" "public"."user_workspace_role_enum" NOT NULL DEFAULT 'editor',
                "status" "public"."user_workspace_status_enum" NOT NULL DEFAULT 'pending',
                "requested_role" "public"."user_workspace_requested_role_enum",
                CONSTRAINT "PK_a007c1434d1433fd63d9e5a27a6" PRIMARY KEY ("user_id", "workspace_id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_a007c1434d1433fd63d9e5a27a" ON "user_workspace" ("user_id", "workspace_id")
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
            CREATE TABLE "users" (
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "provider" character varying NOT NULL DEFAULT 'email',
                "social_id" character varying,
                "username" character varying,
                "email" character varying,
                "first_name" character varying,
                "last_name" character varying,
                "full_name" character varying,
                "avater" character varying,
                "is_onboarded" boolean NOT NULL DEFAULT false,
                "email_verified_at" TIMESTAMP WITH TIME ZONE,
                "email_verified" boolean,
                "password" character varying,
                "last_visited_workspace_id" uuid,
                "settingsId" integer,
                CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"),
                CONSTRAINT "REL_76ba283779c8441fd5ff819c8c" UNIQUE ("settingsId"),
                CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_users_social_id" ON "users" ("social_id")
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "UQ_users_username" ON "users" ("username")
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "UQ_users_email" ON "users" ("email")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_users_last_visited_workspace_id" ON "users" ("last_visited_workspace_id")
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."environment_status_enum" AS ENUM(
                'Running',
                'Stopped',
                'Failing',
                'Starting',
                'Stopping'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "environment" (
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "workspace_id" uuid NOT NULL,
                "status" "public"."environment_status_enum" NOT NULL DEFAULT 'Stopped',
                "started_at" TIMESTAMP,
                "last_activity_at" TIMESTAMP,
                "resource_version" integer NOT NULL DEFAULT '0',
                "jupyter_token" character varying NOT NULL DEFAULT '',
                CONSTRAINT "UQ_0acde356a5740e99296eb524abe" UNIQUE ("workspace_id"),
                CONSTRAINT "unique_workspaceId" UNIQUE ("workspace_id"),
                CONSTRAINT "REL_0acde356a5740e99296eb524ab" UNIQUE ("workspace_id"),
                CONSTRAINT "PK_environment_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "environment_variable" (
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "value" character varying NOT NULL,
                "workspace_id" uuid NOT NULL,
                CONSTRAINT "unique_workspaceId_name" UNIQUE ("workspace_id", "name"),
                CONSTRAINT "PK_environment_variable_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."workspaces_plan_enum" AS ENUM('free', 'trial', 'enterprise', 'professional')
        `);
        await queryRunner.query(`
            CREATE TABLE "workspaces" (
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "icon" character varying NOT NULL,
                "name" character varying NOT NULL,
                "source" character varying,
                "useCases" text array NOT NULL DEFAULT '{}',
                "use_context" character varying,
                "plan" "public"."workspaces_plan_enum" NOT NULL DEFAULT 'free',
                "owner_id" uuid,
                "assistant_model" character varying NOT NULL DEFAULT 'gpt-4o',
                CONSTRAINT "PK_workspace_id" PRIMARY KEY ("id")
            )
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
                "isActive" boolean NOT NULL DEFAULT false,
                "lastExecutedAt" TIMESTAMP,
                "nextExecutionAt" TIMESTAMP,
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
            CREATE TABLE "document" (
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "slug" character varying NOT NULL DEFAULT 'DocumentIcon',
                "order_index" integer NOT NULL,
                "deleted_at" TIMESTAMP,
                "version" integer NOT NULL DEFAULT '1',
                "isSyncedWithYjs" boolean NOT NULL DEFAULT false,
                "workspace_id" uuid NOT NULL,
                "author_id" uuid NOT NULL,
                "parent_id" uuid,
                "runUnexecutedBlocks" boolean NOT NULL DEFAULT false,
                "runSQLSelection" boolean NOT NULL DEFAULT true,
                "shareLinksWithoutSidebar" boolean NOT NULL DEFAULT true,
                "publishedAt" TIMESTAMP,
                CONSTRAINT "PK_document_id" PRIMARY KEY ("id")
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
            CREATE TABLE "tag" (
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                CONSTRAINT "PK_tag_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "UQ_tag_name" ON "tag" ("name")
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
            CREATE TABLE "sessions" (
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "hash" character varying NOT NULL,
                "deletedAt" TIMESTAMP,
                "userId" uuid,
                CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_57de40bc620f456c7311aa3a1e" ON "sessions" ("userId")
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
            CREATE TABLE "lock" (
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "acquired_at" TIMESTAMP NOT NULL DEFAULT now(),
                "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
                "is_locked" boolean NOT NULL DEFAULT false,
                "owner_id" uuid NOT NULL,
                "clock" bigint NOT NULL DEFAULT '0',
                CONSTRAINT "PK_b47095fc0260d85601062b8ed1d" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_ac5fb94b61c32ab89034409abe" ON "lock" ("name")
        `);
        await queryRunner.query(`
            ALTER TABLE "votes"
            ADD CONSTRAINT "FK_votes_message" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "votes"
            ADD CONSTRAINT "FK_votes_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "votes"
            ADD CONSTRAINT "FK_votes_chat" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "messages"
            ADD CONSTRAINT "FK_7540635fef1922f0b156b9ef74f" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "chats"
            ADD CONSTRAINT "FK_chat_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "comment"
            ADD CONSTRAINT "FK_comment_document" FOREIGN KEY ("document_id") REFERENCES "document"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "comment"
            ADD CONSTRAINT "FK_comment_user" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
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
            ALTER TABLE "onboarding_tutorials"
            ADD CONSTRAINT "FK_2a7c3e7cbded6244b7de4eb72c3" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "onboarding_tutorials"
            ADD CONSTRAINT "FK_a2bd797fea759cca6f784a25909" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "user_follows"
            ADD CONSTRAINT "FK_user_follows_follower_id" FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "user_follows"
            ADD CONSTRAINT "FK_user_follows_followee_id" FOREIGN KEY ("followee_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "user_settings"
            ADD CONSTRAINT "FK_4ed056b9344e6f7d8d46ec4b302" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
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
            ALTER TABLE "users"
            ADD CONSTRAINT "FK_76ba283779c8441fd5ff819c8cf" FOREIGN KEY ("settingsId") REFERENCES "user_settings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "environment"
            ADD CONSTRAINT "FK_environment_workspace" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "environment_variable"
            ADD CONSTRAINT "FK_environment_variable_workspace" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "workspaces"
            ADD CONSTRAINT "FK_3bc45ecdd8fdc2108bb92516dde" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
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
            ALTER TABLE "document"
            ADD CONSTRAINT "FK_document_workspace" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "document"
            ADD CONSTRAINT "FK_document_user" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "document"
            ADD CONSTRAINT "FK_document_parent" FOREIGN KEY ("parent_id") REFERENCES "document"("id") ON DELETE CASCADE ON UPDATE NO ACTION
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
        await queryRunner.query(`
            ALTER TABLE "sessions"
            ADD CONSTRAINT "FK_57de40bc620f456c7311aa3a1e6" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "sessions" DROP CONSTRAINT "FK_57de40bc620f456c7311aa3a1e6"
        `);
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
            ALTER TABLE "document" DROP CONSTRAINT "FK_document_parent"
        `);
        await queryRunner.query(`
            ALTER TABLE "document" DROP CONSTRAINT "FK_document_user"
        `);
        await queryRunner.query(`
            ALTER TABLE "document" DROP CONSTRAINT "FK_document_workspace"
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
            ALTER TABLE "workspaces" DROP CONSTRAINT "FK_3bc45ecdd8fdc2108bb92516dde"
        `);
        await queryRunner.query(`
            ALTER TABLE "environment_variable" DROP CONSTRAINT "FK_environment_variable_workspace"
        `);
        await queryRunner.query(`
            ALTER TABLE "environment" DROP CONSTRAINT "FK_environment_workspace"
        `);
        await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "FK_76ba283779c8441fd5ff819c8cf"
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
            ALTER TABLE "user_workspace" DROP CONSTRAINT "FK_a0f1272c8224ca1432ee6842d2b"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_workspace" DROP CONSTRAINT "FK_38805cb60bfb33e754653fbc4f6"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_workspace" DROP CONSTRAINT "FK_faf90374b266c152bf3de95eba8"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_settings" DROP CONSTRAINT "FK_4ed056b9344e6f7d8d46ec4b302"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_follows" DROP CONSTRAINT "FK_user_follows_followee_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_follows" DROP CONSTRAINT "FK_user_follows_follower_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "onboarding_tutorials" DROP CONSTRAINT "FK_a2bd797fea759cca6f784a25909"
        `);
        await queryRunner.query(`
            ALTER TABLE "onboarding_tutorials" DROP CONSTRAINT "FK_2a7c3e7cbded6244b7de4eb72c3"
        `);
        await queryRunner.query(`
            ALTER TABLE "favorites" DROP CONSTRAINT "FK_favorite_user"
        `);
        await queryRunner.query(`
            ALTER TABLE "favorites" DROP CONSTRAINT "FK_favorite_document"
        `);
        await queryRunner.query(`
            ALTER TABLE "comment" DROP CONSTRAINT "FK_comment_user"
        `);
        await queryRunner.query(`
            ALTER TABLE "comment" DROP CONSTRAINT "FK_comment_document"
        `);
        await queryRunner.query(`
            ALTER TABLE "chats" DROP CONSTRAINT "FK_chat_user"
        `);
        await queryRunner.query(`
            ALTER TABLE "messages" DROP CONSTRAINT "FK_7540635fef1922f0b156b9ef74f"
        `);
        await queryRunner.query(`
            ALTER TABLE "votes" DROP CONSTRAINT "FK_votes_chat"
        `);
        await queryRunner.query(`
            ALTER TABLE "votes" DROP CONSTRAINT "FK_votes_user"
        `);
        await queryRunner.query(`
            ALTER TABLE "votes" DROP CONSTRAINT "FK_votes_message"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_ac5fb94b61c32ab89034409abe"
        `);
        await queryRunner.query(`
            DROP TABLE "lock"
        `);
        await queryRunner.query(`
            DROP TABLE "pub_sub_payload"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_57de40bc620f456c7311aa3a1e"
        `);
        await queryRunner.query(`
            DROP TABLE "sessions"
        `);
        await queryRunner.query(`
            DROP TABLE "socket_io_attachments"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."UQ_tag_name"
        `);
        await queryRunner.query(`
            DROP TABLE "tag"
        `);
        await queryRunner.query(`
            DROP TABLE "yjs_update"
        `);
        await queryRunner.query(`
            DROP TABLE "yjs_document"
        `);
        await queryRunner.query(`
            DROP TABLE "document"
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
            DROP TABLE "workspaces"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."workspaces_plan_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "environment_variable"
        `);
        await queryRunner.query(`
            DROP TABLE "environment"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."environment_status_enum"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_users_last_visited_workspace_id"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."UQ_users_email"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."UQ_users_username"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_users_social_id"
        `);
        await queryRunner.query(`
            DROP TABLE "users"
        `);
        await queryRunner.query(`
            DROP TABLE "yjs_app_document"
        `);
        await queryRunner.query(`
            DROP TABLE "user_yjs_app_document"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_a007c1434d1433fd63d9e5a27a"
        `);
        await queryRunner.query(`
            DROP TABLE "user_workspace"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."user_workspace_requested_role_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."user_workspace_status_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."user_workspace_role_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "user_settings"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."UQ_user_follows_follower_id_followee_id"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."UQ_user_follows_followee_id"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."UQ_user_follows_follower_id"
        `);
        await queryRunner.query(`
            DROP TABLE "user_follows"
        `);
        await queryRunner.query(`
            DROP TABLE "onboarding_tutorials"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."onboarding_tutorials_currentstep_enum"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."UQ_favorite_userid_documentdid"
        `);
        await queryRunner.query(`
            DROP TABLE "favorites"
        `);
        await queryRunner.query(`
            DROP TABLE "comment"
        `);
        await queryRunner.query(`
            DROP TABLE "chats"
        `);
        await queryRunner.query(`
            DROP TABLE "messages"
        `);
        await queryRunner.query(`
            DROP TABLE "votes"
        `);
    }

}
