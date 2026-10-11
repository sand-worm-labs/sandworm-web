import { PUBLIC_NOTEBOOK, displayName } from './predicates';
import type { SearchSource } from './search-source';

// People with a public page: a username, and at least one published notebook. They are
// found by name or @username and open /profile/:username.
export const creatorsSource: SearchSource = {
  type: 'creator',
  build: () => ({
    sql: `
      SELECT
        u.id::text AS ref_id,
        ${displayName('u')} AS title,
        '@' || u.username AS subtitle,
        '/profile/' || u.username AS url,
        u.avater AS image,
        u.username AS keywords,
        n.notebooks::real AS popularity,
        n.latest::timestamptz AS published_at
      FROM users u
      JOIN (
        SELECT d.author_id, count(*) AS notebooks, max(d."publishedAt") AS latest
        FROM document d
        WHERE ${PUBLIC_NOTEBOOK}
        GROUP BY d.author_id
      ) n ON n.author_id = u.id
      WHERE u.username IS NOT NULL AND u.username <> ''
    `,
    params: [],
  }),
};
