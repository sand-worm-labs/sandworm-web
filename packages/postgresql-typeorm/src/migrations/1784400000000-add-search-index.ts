import { MigrationInterface, QueryRunner } from "typeorm";

// The table behind the app's search. One row per thing a visitor can search for
// (a protocol, a chain, a notebook, a creator...), built from the real tables by the
// API's search module (apps/api/src/features/search). It holds nothing the source
// tables do not, so it can be rebuilt at any time.
export class AddSearchIndex1784400000000 implements MigrationInterface {
    name = 'AddSearchIndex1784400000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // pg_trgm: typo-tolerant matching. unaccent: "Zürich" finds "Zurich".
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS unaccent`);

        // unaccent() is only STABLE, so it cannot sit in a generated column or an index.
        // Pinning its dictionary makes this wrapper safe to declare IMMUTABLE. Everything
        // is reduced to lower-case letters and digits separated by single spaces, so
        // "pump.fun" and "Pump Fun" are the same text.
        await queryRunner.query(`
            CREATE FUNCTION search_normalize(text) RETURNS text
            LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT
            AS $$
                SELECT btrim(regexp_replace(lower(public.unaccent('public.unaccent', $1)), '[^a-z0-9]+', ' ', 'g'))
            $$
        `);

        await queryRunner.query(`
            CREATE TABLE "search_entry" (
                "type" text NOT NULL,
                "ref_id" text NOT NULL,
                "title" text NOT NULL,
                "subtitle" text,
                "url" text NOT NULL,
                "image" text,
                "keywords" text,
                "popularity" real NOT NULL DEFAULT 0,
                "published_at" timestamptz,
                "refreshed_at" timestamptz NOT NULL DEFAULT now(),
                "title_norm" text GENERATED ALWAYS AS (search_normalize("title")) STORED,
                "tsv" tsvector GENERATED ALWAYS AS (
                    setweight(to_tsvector('simple', search_normalize("title")), 'A')
                    || setweight(to_tsvector('simple', search_normalize(coalesce("keywords", ''))), 'B')
                    || setweight(to_tsvector('simple', search_normalize(coalesce("subtitle", ''))), 'C')
                ) STORED,
                CONSTRAINT "PK_search_entry" PRIMARY KEY ("type", "ref_id")
            )
        `);

        // Word and prefix matches ("uni" finds "Uniswap").
        await queryRunner.query(`CREATE INDEX "IDX_search_entry_tsv" ON "search_entry" USING GIN ("tsv")`);
        // Typos ("uniswp"). On the title alone: similarity is measured over the whole string, so
        // adding keywords to it would make a misspelt title look less like itself.
        await queryRunner.query(`CREATE INDEX "IDX_search_entry_title_trgm" ON "search_entry" USING GIN ("title_norm" gin_trgm_ops)`);
        // Whole-title prefix, which works from the first keystroke.
        await queryRunner.query(`CREATE INDEX "IDX_search_entry_title_prefix" ON "search_entry" ("title_norm" text_pattern_ops)`);
        // The most popular entries of a kind, for what is shown before anything is typed.
        await queryRunner.query(`CREATE INDEX "IDX_search_entry_popular" ON "search_entry" ("type", "popularity" DESC, "published_at" DESC NULLS LAST)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "search_entry"`);
        await queryRunner.query(`DROP FUNCTION search_normalize(text)`);
        // The extensions stay: other code may use them, and dropping them is not ours to decide.
    }
}
