import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { resolveWorkspaceId, type ToolContext } from '../../graphql.ts';
import { handle, workspaceId } from '../shared.ts';

// The three fixed connector ids the API knows about (see DataSourceId in
// @sandworm/types) — data sources aren't user-created, so this is the
// complete set, not just a default.
const dataSourceId = z
  .enum(['duckdb', 'dune-datasource', 'sandwormcloud-datasource'])
  .describe('ID of the data source, as returned by list_data_sources');

type DataSource = { type: string; data: Record<string, unknown> };

async function getRest<T>(ctx: ToolContext, path: string): Promise<T> {
  const res = await fetch(`${ctx.apiUrl}/api${path}`, {
    headers: { Cookie: `access_token=${ctx.auth.token}` },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`Sandworm API returned ${res.status}`);
  return res.json() as Promise<T>;
}

export function registerDataSourceTools(server: McpServer, ctx: ToolContext): void {
  server.registerTool(
    'list_data_sources',
    { description: 'List data sources connected to a workspace', inputSchema: { workspaceId } },
    handle(async ({ workspaceId }) => {
      const ws = await resolveWorkspaceId(ctx, workspaceId);
      const sources = await getRest<DataSource[]>(ctx, `/v1/workspaces/${ws}/data-sources`);
      return sources.map(s => ({ ...s.data, type: s.type }));
    }),
  );

  server.registerTool(
    'get_data_source_schema',
    {
      description:
        'Get the tables and columns of a data source, so SQL can be written against it. Only sandworm_cloud is supported today',
      inputSchema: { workspaceId, dataSourceId },
    },
    handle(async ({ workspaceId, dataSourceId }) => {
      const ws = await resolveWorkspaceId(ctx, workspaceId);
      const schema = await getRest(ctx, `/v1/workspaces/${ws}/data-sources/${dataSourceId}/schema`);
      return schema;
    }),
  );
}
