import { MigrationInterface, QueryRunner } from "typeorm";

export class AddShowcase1783900000000 implements MigrationInterface {
    name = 'AddShowcase1783900000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document" ADD "showcase" jsonb`);
        await queryRunner.query(`CREATE INDEX "IDX_document_showcase_category" ON "document" (("showcase"->>'category')) WHERE "showcase" IS NOT NULL`);
        await queryRunner.query(`CREATE TABLE "showcase_lead" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "kind" character varying NOT NULL, "category" text, "protocol" text NOT NULL, "email" text, "company" text, "notebook_slug" text, "role" text, "source" jsonb, "user_id" uuid, CONSTRAINT "PK_showcase_lead_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_showcase_lead_kind" ON "showcase_lead" ("kind")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_showcase_lead_kind"`);
        await queryRunner.query(`DROP TABLE "showcase_lead"`);
        await queryRunner.query(`DROP INDEX "IDX_document_showcase_category"`);
        await queryRunner.query(`ALTER TABLE "document" DROP COLUMN "showcase"`);
    }
}
