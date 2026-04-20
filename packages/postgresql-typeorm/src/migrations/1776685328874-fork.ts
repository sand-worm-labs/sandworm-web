import { MigrationInterface, QueryRunner } from "typeorm";

export class Fork1776685328874 implements MigrationInterface {
    name = 'Fork1776685328874'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "document_fork" (
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "source_document_id" uuid NOT NULL,
                "forked_document_id" uuid NOT NULL,
                "user_id" uuid NOT NULL,
                CONSTRAINT "PK_dbf1454e9ae8d44b47ab2c6c391" PRIMARY KEY ("id")
            )
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
            ALTER TABLE "document_fork"
            ADD CONSTRAINT "FK_5aba3ce0267cbfcd192ede7d52b" FOREIGN KEY ("source_document_id") REFERENCES "document"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "document_fork"
            ADD CONSTRAINT "FK_3b5a6423f8d46ba69d98c2c136f" FOREIGN KEY ("forked_document_id") REFERENCES "document"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "document_fork"
            ADD CONSTRAINT "FK_acf898e8bad50ec52dd732d3544" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "document_fork" DROP CONSTRAINT "FK_acf898e8bad50ec52dd732d3544"
        `);
        await queryRunner.query(`
            ALTER TABLE "document_fork" DROP CONSTRAINT "FK_3b5a6423f8d46ba69d98c2c136f"
        `);
        await queryRunner.query(`
            ALTER TABLE "document_fork" DROP CONSTRAINT "FK_5aba3ce0267cbfcd192ede7d52b"
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
            DROP TABLE "document_fork"
        `);
    }

}
