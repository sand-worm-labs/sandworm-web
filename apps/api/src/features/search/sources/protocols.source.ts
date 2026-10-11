import { officialShowcaseNotebook, slugify } from './predicates';
import type { SearchSource } from './search-source';

// Protocols are not a table: a protocol is a name on the Showcase metadata of case-study
// notebooks. So they are derived: one per distinct name (by its URL slug) with a published
// case study, opening the case study page in the topic (Lending, Perps...) most of its case
// studies are filed under, or in a chain's category when it has none.
// Names that differ only in case or punctuation ("pump.fun", "Pump.Fun") are one protocol.
export const protocolsSource: SearchSource = {
  type: 'protocol',
  build: ({ officialWorkspaceIds, aliasNames, aliasWords }) => ({
    sql: `
      WITH case_studies AS (
        SELECT
          d.showcase->>'protocol' AS protocol,
          ${slugify(`d.showcase->>'protocol'`)} AS slug,
          d.showcase->>'category' AS category,
          coalesce(c.group_id, '') = 'chains' AS in_chain_category
        FROM document d
        LEFT JOIN showcase_category c ON c.slug = d.showcase->>'category'
        WHERE ${officialShowcaseNotebook('$1')}
          AND d.showcase->>'kind' = 'case_study'
          AND coalesce(d.showcase->>'protocol', '') <> ''
      ),
      grouped AS (
        SELECT
          slug,
          mode() WITHIN GROUP (ORDER BY protocol) AS name,
          coalesce(
            mode() WITHIN GROUP (ORDER BY category) FILTER (WHERE NOT in_chain_category),
            mode() WITHIN GROUP (ORDER BY category)
          ) AS category,
          count(*) AS case_studies
        FROM case_studies
        WHERE slug <> ''
        GROUP BY slug
      )
      SELECT
        g.slug AS ref_id,
        g.name AS title,
        cat.name AS subtitle,
        '/showcase/' || g.category || '/' || g.slug AS url,
        NULL::text AS image,
        a.words AS keywords,
        g.case_studies::real AS popularity,
        NULL::timestamptz AS published_at
      FROM grouped g
      LEFT JOIN showcase_category cat ON cat.slug = g.category
      LEFT JOIN unnest($2::text[], $3::text[]) AS a(name, words) ON a.name = search_normalize(g.name)
    `,
    params: [officialWorkspaceIds, aliasNames, aliasWords],
  }),
};
