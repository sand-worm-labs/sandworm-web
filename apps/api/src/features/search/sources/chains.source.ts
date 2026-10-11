import { categoryHasContent, officialShowcaseNotebook } from './predicates';
import type { SearchSource } from './search-source';

// Chains that have a Showcase page. A chain's page is its category (Showcase keeps one
// category per chain), so a chain without one has nothing to open and is left out.
export const chainsSource: SearchSource = {
  type: 'chain',
  build: ({ officialWorkspaceIds, aliasNames, aliasWords }) => ({
    sql: `
      SELECT
        c.slug AS ref_id,
        sc.name AS title,
        'Chain' AS subtitle,
        '/showcase/' || c.slug AS url,
        NULL::text AS image,
        a.words AS keywords,
        (SELECT count(*) FROM document d
          WHERE ${officialShowcaseNotebook('$1')} AND d.showcase->>'category' = c.slug)::real AS popularity,
        NULL::timestamptz AS published_at
      FROM showcase_chain sc
      JOIN showcase_category c ON c.group_id = 'chains' AND lower(c.name) = lower(sc.name)
      LEFT JOIN unnest($2::text[], $3::text[]) AS a(name, words) ON a.name = search_normalize(sc.name)
      WHERE ${categoryHasContent('c.slug', '$1')}
    `,
    params: [officialWorkspaceIds, aliasNames, aliasWords],
  }),
};
