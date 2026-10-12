import { MigrationInterface, QueryRunner } from "typeorm";

// What the Showcase knows about each protocol: its links, shown as icons on its page.
// The first links come in with the showcase links seeder.
export class AddShowcaseProtocol1784600000000 implements MigrationInterface {
    name = 'AddShowcaseProtocol1784600000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "showcase_protocol" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "slug" text NOT NULL, "name" text NOT NULL, "links" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "PK_showcase_protocol_slug" PRIMARY KEY ("slug"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "showcase_protocol"`);
    }
}
