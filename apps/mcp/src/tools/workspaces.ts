import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { notImplemented } from './shared.ts';

export function registerWorkspaceTools(server: McpServer): void {
  server.registerTool(
    'list_workspaces',
    { description: 'List the workspaces the signed-in user belongs to', inputSchema: {} },
    async () => notImplemented('list_workspaces'),
  );
}
