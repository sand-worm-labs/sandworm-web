import { PUBLIC_NOTEBOOK, displayName } from './predicates';
import type { SearchSource } from './search-source';

// A notebook that also has a dashboard its author left public, as a result of its own: it
// opens /notebooks/:slug/dashboard, where the notebook result opens the notebook. The
// published copy records whether it has a dashboard (set when the notebook is published).
export const dashboardsSource: SearchSource = {
  type: 'dashboard',
  build: () => ({
    sql: `
      SELECT
        d.id::text AS ref_id,
        d.title,
        ${displayName('u')} AS subtitle,
        '/notebooks/' || d.slug || '/dashboard' AS url,
        NULL::text AS image,
        concat_ws(' ', 'dashboard', array_to_string(d.tags, ' ')) AS keywords,
        (coalesce(f.forks, 0) + CASE WHEN d."featuredDocument" THEN 5 ELSE 0 END)::real AS popularity,
        d."publishedAt"::timestamptz AS published_at
      FROM document d
      LEFT JOIN users u ON u.id = d.author_id
      LEFT JOIN (
        SELECT source_document_id, count(*) AS forks FROM document_fork GROUP BY source_document_id
      ) f ON f.source_document_id = d.id
      WHERE ${PUBLIC_NOTEBOOK}
        AND d."isDashboardPublic"
        AND EXISTS (
          SELECT 1 FROM yjs_app_document a WHERE a.document_id = d.id AND a.has_dashboard
        )
    `,
    params: [],
  }),
};
