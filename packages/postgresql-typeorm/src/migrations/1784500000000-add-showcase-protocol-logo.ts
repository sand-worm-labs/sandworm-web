import { MigrationInterface, QueryRunner } from "typeorm";

// Protocol logos for the Showcase, edited in the studio like the rest of its content.
// The first logos come in with the showcase logo seeder.
export class AddShowcaseProtocolLogo1784500000000 implements MigrationInterface {
    name = 'AddShowcaseProtocolLogo1784500000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "showcase_protocol_logo" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "slug" text NOT NULL, "name" text NOT NULL, "content_type" text NOT NULL, "data" bytea NOT NULL, "etag" text NOT NULL, CONSTRAINT "PK_showcase_protocol_logo_slug" PRIMARY KEY ("slug"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "showcase_protocol_logo"`);
    }
}
