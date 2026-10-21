import { MigrationInterface, QueryRunner } from "typeorm";

// A notebook shared by an unguessable link: readable by anyone who has it, listed nowhere.
export class AddUnlistedVisibility1785000000000 implements MigrationInterface {
    name = 'AddUnlistedVisibility1785000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."document_visibility_enum" ADD VALUE IF NOT EXISTS 'UNLISTED'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Postgres cannot drop a value from an enum. Make sure nothing is left using it; the value stays in the type.
        await queryRunner.query(`
            UPDATE "document"
            SET "visibility" = 'WORKSPACE', "publishedAt" = NULL
            WHERE "visibility" = 'UNLISTED'
        `);
    }
}
