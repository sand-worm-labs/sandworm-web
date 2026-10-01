import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { notImplemented, workspaceId } from './shared.ts';

export function registerProjectTools(server: McpServer): void {
  server.registerTool(
    'list_projects',
    { description: 'List projects (notebooks) in a workspace', inputSchema: { workspaceId } },
    async () => notImplemented('list_projects'),
  );
}
