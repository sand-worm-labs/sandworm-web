import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReferralCode1783300000000 implements MigrationInterface {
    name = 'AddReferralCode1783300000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "referral_code" (
                "code" character varying NOT NULL,
                "max_uses" integer NOT NULL DEFAULT 1,
                "uses" integer NOT NULL DEFAULT 0,
                "note" character varying,
                "expires_at" TIMESTAMP WITH TIME ZONE,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_referral_code" PRIMARY KEY ("code")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "referral_code_use" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "code" character varying NOT NULL,
                "user_id" uuid NOT NULL,
                "used_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_referral_code_use" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`CREATE INDEX "IDX_referral_code_use_code" ON "referral_code_use" ("code")`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_referral_code_use_user" ON "referral_code_use" ("user_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "referral_code_use"`);
        await queryRunner.query(`DROP TABLE "referral_code"`);
    }
}
