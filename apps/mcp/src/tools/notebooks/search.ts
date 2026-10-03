import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { graphql, type ToolContext } from '../../graphql.ts';
import { errorResult, jsonResult } from '../shared.ts';

type Explored = {
  title: string;
  slug: string;
  description: string | null;
  tags: string[];
  forkCount: number;
};

export function registerNotebookSearchTools(server: McpServer, ctx: ToolContext): void {
  server.registerTool(
    'search_notebooks',
    {
      description:
        'Search the public explore page for published notebooks matching a topic (e.g. "uniswap v3 liquidity"). Use fork_notebook with a result\'s slug to copy one',
      inputSchema: {
        query: z.string().min(1),
        limit: z.number().int().min(1).max(25).optional().describe('Max results (default 10)'),
      },
    },
    async ({ query, limit = 10 }) => {
      try {
        const { getTrendingPublishedDocuments: feed } = await graphql<{ getTrendingPublishedDocuments: Explored[] }>(
          ctx,
          `query { getTrendingPublishedDocuments(limit: 100, offset: 0) { title slug description tags forkCount } }`,
        );
        const terms = query.toLowerCase().split(/\W+/).filter(Boolean);
        // A term in the title counts most, then tags, then the description.
        const score = (d: Explored) => {
          const title = d.title.toLowerCase();
          const tags = d.tags.join(' ').toLowerCase();
          const description = (d.description ?? '').toLowerCase();
          return terms.reduce((sum, t) => sum + (title.includes(t) ? 3 : 0) + (tags.includes(t) ? 2 : 0) + (description.includes(t) ? 1 : 0), 0);
        };
        const results = feed
          .map((d) => ({ d, s: score(d) }))
          .filter(({ s }) => s > 0)
          .sort((a, b) => b.s - a.s || b.d.forkCount - a.d.forkCount)
          .slice(0, limit)
          .map(({ d }) => ({ ...d, publicUrl: `${ctx.webUrl}/notebooks/${d.slug}` }));
        return jsonResult(results);
      } catch (err) {
        return errorResult(err);
      }
    },
  );
}
