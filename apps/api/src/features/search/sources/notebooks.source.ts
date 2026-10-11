import { PUBLIC_NOTEBOOK, displayName } from './predicates';
import type { SearchSource } from './search-source';

// Every public notebook, found by its title, tags and the Showcase protocol and category it
// is filed under. Its subtitle is its author.
export const notebooksSource: SearchSource = {
  type: 'notebook',
  build: () => ({
    sql: `
      SELECT
        d.id::text AS ref_id,
        d.title,
        ${displayName('u')} AS subtitle,
        '/notebooks/' || d.slug AS url,
        NULL::text AS image,
        concat_ws(' ', array_to_string(d.tags, ' '), d.showcase->>'protocol', d.showcase->>'category') AS keywords,
        (coalesce(f.forks, 0) + CASE WHEN d."featuredDocument" THEN 5 ELSE 0 END)::real AS popularity,
        d."publishedAt"::timestamptz AS published_at
      FROM document d
      LEFT JOIN users u ON u.id = d.author_id
      LEFT JOIN (
        SELECT source_document_id, count(*) AS forks FROM document_fork GROUP BY source_document_id
      ) f ON f.source_document_id = d.id
      WHERE ${PUBLIC_NOTEBOOK}
    `,
    params: [],
  }),
};
