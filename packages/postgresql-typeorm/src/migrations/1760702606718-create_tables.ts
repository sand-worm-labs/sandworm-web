import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTables1760702606718 implements MigrationInterface {
    name = 'CreateTables1760702606718'

    public async up(queryRunner: QueryRunner): Promise<void> {
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
            CREATE TABLE "document" (
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "slug" character varying NOT NULL,
                "title" character varying NOT NULL,
                "description" character varying NOT NULL DEFAULT '',
                "body" character varying NOT NULL DEFAULT '',
                "author_id" uuid NOT NULL,
                "forked_from_id" uuid,
                CONSTRAINT "PK_document_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "UQ_document_slug" ON "document" ("slug")
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
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "social_links" jsonb NOT NULL DEFAULT '{}'::jsonb,
                "status_text" text NOT NULL DEFAULT 'Just joined 🚀',
                "status_updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "wallets" jsonb NOT NULL DEFAULT '[]'::jsonb,
                CONSTRAINT "PK_user_setting_id" PRIMARY KEY ("id")
            )
        `);
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
            CREATE TYPE "public"."onboarding_tutorials_currentstep_enum" AS ENUM(
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
            CREATE TABLE "users" (
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
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
                "settingsId" uuid,
                CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"),
                CONSTRAINT "REL_76ba283779c8441fd5ff819c8c" UNIQUE ("settingsId"),
                CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "UQ_users_username" ON "users" ("username")
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "UQ_users_email" ON "users" ("email")
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."workspaces_plan_enum" AS ENUM('free', 'pro', 'enterprise')
        `);
        await queryRunner.query(`
            CREATE TABLE "workspaces" (
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "source" character varying,
                "useCases" text array NOT NULL DEFAULT '{}',
                "useContext" character varying,
                "plan" "public"."workspaces_plan_enum" NOT NULL DEFAULT 'free',
                "ownerId" uuid NOT NULL,
                CONSTRAINT "PK_workspace_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "document_to_tag" (
                "document_id" uuid NOT NULL,
                "tag_id" uuid NOT NULL,
                CONSTRAINT "PK_bb1389e75a3e6d0352717b6ec2b" PRIMARY KEY ("document_id", "tag_id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_aa4e4077edf3129bfad8467ad1" ON "document_to_tag" ("document_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_d4d4604e05d9dd2d2c561e00ad" ON "document_to_tag" ("tag_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "user_favorites" (
                "user_id" uuid NOT NULL,
                "document_id" uuid NOT NULL,
                CONSTRAINT "PK_27a1200a71c6745fb668d733ede" PRIMARY KEY ("user_id", "document_id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_5238ce0a21cc77dc16c8efe3d3" ON "user_favorites" ("user_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_427724b662ef66df7f50ca9907" ON "user_favorites" ("document_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "document"
            ADD CONSTRAINT "FK_document_user" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "document"
            ADD CONSTRAINT "FK_document_forked_from" FOREIGN KEY ("forked_from_id") REFERENCES "document"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
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
            ALTER TABLE "user_follows"
            ADD CONSTRAINT "FK_user_follows_follower_id" FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "user_follows"
            ADD CONSTRAINT "FK_user_follows_followee_id" FOREIGN KEY ("followee_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "user_settings"
            ADD CONSTRAINT "FK_00f004f5922a0744d174530d639" FOREIGN KEY ("id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
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
            ALTER TABLE "onboarding_tutorials"
            ADD CONSTRAINT "FK_2a7c3e7cbded6244b7de4eb72c3" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "onboarding_tutorials"
            ADD CONSTRAINT "FK_a2bd797fea759cca6f784a25909" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "FK_76ba283779c8441fd5ff819c8cf" FOREIGN KEY ("settingsId") REFERENCES "user_settings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "workspaces"
            ADD CONSTRAINT "FK_77607c5b6af821ec294d33aab0c" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "document_to_tag"
            ADD CONSTRAINT "FK_document_to_tag_document" FOREIGN KEY ("document_id") REFERENCES "document"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "document_to_tag"
            ADD CONSTRAINT "FK_document_to_tag_tag" FOREIGN KEY ("tag_id") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "user_favorites"
            ADD CONSTRAINT "FK_user_favorites_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "user_favorites"
            ADD CONSTRAINT "FK_user_favorites_document" FOREIGN KEY ("document_id") REFERENCES "document"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user_favorites" DROP CONSTRAINT "FK_user_favorites_document"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_favorites" DROP CONSTRAINT "FK_user_favorites_user"
        `);
        await queryRunner.query(`
            ALTER TABLE "document_to_tag" DROP CONSTRAINT "FK_document_to_tag_tag"
        `);
        await queryRunner.query(`
            ALTER TABLE "document_to_tag" DROP CONSTRAINT "FK_document_to_tag_document"
        `);
        await queryRunner.query(`
            ALTER TABLE "workspaces" DROP CONSTRAINT "FK_77607c5b6af821ec294d33aab0c"
        `);
        await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "FK_76ba283779c8441fd5ff819c8cf"
        `);
        await queryRunner.query(`
            ALTER TABLE "onboarding_tutorials" DROP CONSTRAINT "FK_a2bd797fea759cca6f784a25909"
        `);
        await queryRunner.query(`
            ALTER TABLE "onboarding_tutorials" DROP CONSTRAINT "FK_2a7c3e7cbded6244b7de4eb72c3"
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
            ALTER TABLE "user_settings" DROP CONSTRAINT "FK_00f004f5922a0744d174530d639"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_follows" DROP CONSTRAINT "FK_user_follows_followee_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_follows" DROP CONSTRAINT "FK_user_follows_follower_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "comment" DROP CONSTRAINT "FK_comment_user"
        `);
        await queryRunner.query(`
            ALTER TABLE "comment" DROP CONSTRAINT "FK_comment_document"
        `);
        await queryRunner.query(`
            ALTER TABLE "document" DROP CONSTRAINT "FK_document_forked_from"
        `);
        await queryRunner.query(`
            ALTER TABLE "document" DROP CONSTRAINT "FK_document_user"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_427724b662ef66df7f50ca9907"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_5238ce0a21cc77dc16c8efe3d3"
        `);
        await queryRunner.query(`
            DROP TABLE "user_favorites"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_d4d4604e05d9dd2d2c561e00ad"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_aa4e4077edf3129bfad8467ad1"
        `);
        await queryRunner.query(`
            DROP TABLE "document_to_tag"
        `);
        await queryRunner.query(`
            DROP TABLE "workspaces"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."workspaces_plan_enum"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."UQ_users_email"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."UQ_users_username"
        `);
        await queryRunner.query(`
            DROP TABLE "users"
        `);
        await queryRunner.query(`
            DROP TABLE "onboarding_tutorials"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."onboarding_tutorials_currentstep_enum"
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
            DROP TABLE "comment"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."UQ_document_slug"
        `);
        await queryRunner.query(`
            DROP TABLE "document"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."UQ_tag_name"
        `);
        await queryRunner.query(`
            DROP TABLE "tag"
        `);
    }

}
