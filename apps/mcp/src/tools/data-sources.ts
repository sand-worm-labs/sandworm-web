import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { notImplemented, workspaceId } from './shared.ts';

const dataSourceId = z.string().describe('ID of the data source');

// Backed by REST: v1/workspaces/:workspaceId/data-sources
export function registerDataSourceTools(server: McpServer): void {
  server.registerTool(
    'list_data_sources',
    { description: 'List data sources connected to a workspace', inputSchema: { workspaceId } },
    async () => notImplemented('list_data_sources'),
  );

  server.registerTool(
    'get_data_source_schema',
    {
      description: 'Get the tables and columns of a data source, so SQL can be written against it',
      inputSchema: { workspaceId, dataSourceId },
    },
    async () => notImplemented('get_data_source_schema'),
  );
}
