import type { SearchSource } from './search-source';

// Every bounty that is not a draft, as the bounties page lists them.
export const bountiesSource: SearchSource = {
  type: 'bounty',
  build: () => ({
    sql: `
      SELECT
        b.slug AS ref_id,
        b.title,
        concat_ws(' · ', b.sponsor, b.reward) AS subtitle,
        '/bounties/' || b.slug AS url,
        NULL::text AS image,
        concat_ws(' ', 'bounty bounties', b.type, b.sponsor, b.status) AS keywords,
        (CASE WHEN b.status = 'open' THEN 3 ELSE 0 END + CASE WHEN b.featured THEN 3 ELSE 0 END)::real AS popularity,
        b.created_at::timestamptz AS published_at
      FROM bounty b
      WHERE b.status <> 'draft'
    `,
    params: [],
  }),
};
