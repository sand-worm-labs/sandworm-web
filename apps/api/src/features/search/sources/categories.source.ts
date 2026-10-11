import { categoryHasContent, officialShowcaseNotebook } from './predicates';
import type { SearchSource } from './search-source';

// Showcase categories (DEXes, lending, ...) that have something to open. Chain categories
// are left out: they are found as chains. A category is also found by the protocols it
// plans to cover, so "aave" leads to Lending even before there is a page for Aave.
export const categoriesSource: SearchSource = {
  type: 'category',
  build: ({ officialWorkspaceIds }) => ({
    sql: `
      SELECT
        c.slug AS ref_id,
        c.name AS title,
        g.label AS subtitle,
        '/showcase/' || c.slug AS url,
        NULL::text AS image,
        array_to_string(c.protocols, ' ') AS keywords,
        (SELECT count(*) FROM document d
          WHERE ${officialShowcaseNotebook('$1')} AND d.showcase->>'category' = c.slug)::real AS popularity,
        NULL::timestamptz AS published_at
      FROM showcase_category c
      LEFT JOIN showcase_group g ON g.id = c.group_id
      WHERE c.group_id <> 'chains'
        AND ${categoryHasContent('c.slug', '$1')}
    `,
    params: [officialWorkspaceIds],
  }),
};
