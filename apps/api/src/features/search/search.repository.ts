import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import type { ParsedQuery } from './search-text';
import { TYPE_BOOST, TYPE_ORDER } from './search.constants';
import type { SearchEntryType } from './search.types';

export type SearchRow = {
  type: SearchEntryType;
  ref_id: string;
  title: string;
  subtitle: string | null;
  url: string;
  image: string | null;
  // How many entries of this type matched, whatever the page asked for.
  total: string;
};

// A fixed CASE over our own constants, never built from input.
const caseOf = (column: string, values: Record<string, number>) =>
  `CASE ${column} ${Object.entries(values)
    .map(([type, value]) => `WHEN '${type}' THEN ${value}`)
    .join(' ')} ELSE 0 END`;

const typeBoost = (column: string) => caseOf(column, TYPE_BOOST);
const typeOrder = (column: string) =>
  caseOf(
    column,
    Object.fromEntries(TYPE_ORDER.map((type, index) => [type, index])),
  );

// Looking for something. $1 normalized text   $2 prefix tsquery   $3 one type (or null)
// $4 page size per type   $5 offset   $6 the same tsquery, title words only
//
// Built so that most of the work touches only narrow columns:
//   1. Candidates come from one index per way of matching, each carrying just what ranking
//      needs (key, normalized title, popularity, date):
//        - the title starts with the text   (prefix index; works from the first keystroke)
//        - every word is a word-prefix of the title, keywords or subtitle   (full-text index; 2+ characters)
//        - the title is close in spelling   (trigram index; 4+ characters, and only when the two
//          above found nothing: a typo is guessed at only when the text matches nothing as typed)
//   2. They are scored and ranked per kind.
//   3. Only the rows that make the page are read in full, by primary key.
//
// Relevance: an exact title beats a title prefix, which beats a word in the title, which beats
// a word in the keywords or subtitle, which beats a near-spelling. Then the kind, popularity
// and recency break ties.
export const SEARCH_SQL = `
  WITH q AS (
    SELECT to_tsquery('simple', $2) AS tsq, to_tsquery('simple', $6) AS title_tsq
  ),
  matched AS (
    SELECT e.type, e.ref_id, e.title_norm, e.popularity, e.published_at,
           true AS by_prefix, false AS by_word, false AS in_title, 0::real AS fuzzy
    FROM search_entry e
    WHERE ($3::text IS NULL OR e.type = $3) AND e.title_norm LIKE $1 || '%'
    UNION ALL
    SELECT e.type, e.ref_id, e.title_norm, e.popularity, e.published_at,
           false, true, e.tsv @@ (SELECT title_tsq FROM q), 0
    FROM search_entry e
    WHERE ($3::text IS NULL OR e.type = $3) AND char_length($1) >= 2 AND e.tsv @@ (SELECT tsq FROM q)
  ),
  fuzzy AS (
    SELECT e.type, e.ref_id, e.title_norm, e.popularity, e.published_at,
           false, false, false, similarity(e.title_norm, $1)
    FROM search_entry e
    WHERE ($3::text IS NULL OR e.type = $3) AND char_length($1) >= 4 AND e.title_norm % $1
      AND NOT EXISTS (SELECT 1 FROM matched)
  ),
  combined AS (
    SELECT type, ref_id, title_norm,
           max(popularity) AS popularity, max(published_at) AS published_at,
           bool_or(by_prefix) AS by_prefix, bool_or(by_word) AS by_word,
           bool_or(in_title) AS in_title, max(fuzzy) AS fuzzy
    FROM (SELECT * FROM matched UNION ALL SELECT * FROM fuzzy) m
    GROUP BY type, ref_id, title_norm
  ),
  ranked AS (
    SELECT
      c.type, c.ref_id,
      row_number() OVER (PARTITION BY c.type ORDER BY c.score DESC, c.title_norm) AS rn,
      count(*) OVER (PARTITION BY c.type) AS total
    FROM (
      SELECT combined.*, (
        CASE WHEN combined.title_norm = $1 THEN 100 WHEN combined.by_prefix THEN 60 ELSE 0 END
        + CASE WHEN combined.in_title THEN 25 WHEN combined.by_word THEN 15 ELSE 0 END
        + combined.fuzzy * 20
        + ${typeBoost('combined.type')}
        + ln(1 + combined.popularity)
        + CASE WHEN combined.published_at > now() - interval '90 days' THEN 1 ELSE 0 END
      ) AS score
      FROM combined
    ) c
  )
  SELECT e.type, e.ref_id, e.title, e.subtitle, e.url, e.image, r.total
  FROM ranked r
  CROSS JOIN LATERAL (
    SELECT * FROM search_entry s WHERE s.type = r.type AND s.ref_id = r.ref_id
  ) e
  WHERE r.rn > $5 AND r.rn <= $5 + $4
  ORDER BY ${typeOrder('r.type')}, r.rn
`;

// Nothing typed: the most popular of each kind, newest first among equals. $1 one type
// (or null), $2 page size per type, $3 offset. Each kind is a top-N read of the
// (type, popularity) index, so this stays cheap however many entries there are.
export const BROWSE_SQL = `
  WITH kinds AS (
    SELECT t AS type FROM unnest(ARRAY[${TYPE_ORDER.map((type) => `'${type}'`).join(', ')}]::text[]) AS t
    WHERE $1::text IS NULL OR t = $1
  )
  SELECT e.type, e.ref_id, e.title, e.subtitle, e.url, e.image, totals.total
  FROM kinds k
  CROSS JOIN LATERAL (
    SELECT * FROM search_entry s
    WHERE s.type = k.type
    ORDER BY s.popularity DESC, s.published_at DESC NULLS LAST, s.title
    LIMIT $2 OFFSET $3
  ) e
  JOIN (SELECT type, count(*) AS total FROM search_entry GROUP BY type) totals ON totals.type = e.type
  ORDER BY ${typeOrder('e.type')}, e.popularity DESC, e.published_at DESC NULLS LAST, e.title
`;

@Injectable()
export class SearchRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  // `manager` lets a test run the same query inside its own transaction.
  find(
    query: ParsedQuery,
    options: { type?: SearchEntryType; limit: number; offset: number },
    manager: EntityManager = this.dataSource.manager,
  ): Promise<SearchRow[]> {
    const type = options.type ?? null;
    if (!query.term) {
      return manager.query(BROWSE_SQL, [type, options.limit, options.offset]);
    }
    return manager.query(SEARCH_SQL, [
      query.term,
      query.tsquery,
      type,
      options.limit,
      options.offset,
      query.titleTsquery,
    ]);
  }
}
