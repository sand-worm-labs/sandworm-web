import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { ToolContext } from '../../graphql.ts';
import { errorResult, jsonResult } from '../shared.ts';
import { describeTool, searchCatalog, tokens } from './tool-catalog.ts';

export function registerToolSearchTool(server: McpServer, ctx: ToolContext): void {
  server.registerTool(
    'search_tools',
    {
      description: [
        'Search the catalog of ready-made analytics tools (power tools). Use it before writing SQL or Python by hand: if a tool covers the task, add it with add_cell type "power_toolbox" and its toolId.',
        'Returns each match with its toolId and its inputs. Required inputs must be passed to add_cell as `inputs`, keyed by the input key. Only use a tool that came back from this search.',
      ].join('\n\n'),
      inputSchema: {
        query: z.string().min(1).describe('What you want to do, in plain words, e.g. "decode calldata" or "token holders by chain"'),
        limit: z.number().int().min(1).max(15).default(5),
      },
    },
    async ({ query, limit }) => {
      try {
        if (!tokens(query).length) return errorResult(new Error('Give a query with at least one word of two letters or more.'));

        const matches = await searchCatalog(ctx, query, limit);
        return jsonResult({
          query,
          matches: matches.map(m => describeTool(m.tool)),
          ...(matches.length ? {} : { hint: 'No tool matched. Try fewer or different words, or write a sql or python cell instead.' }),
        });
      } catch (err) {
        return errorResult(err);
      }
    },
  );
}
