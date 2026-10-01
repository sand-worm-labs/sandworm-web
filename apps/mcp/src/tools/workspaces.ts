import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { graphql, resolveWorkspaceId, type ToolContext } from '../graphql.ts';
import { errorResult, jsonResult } from './shared.ts';

type Workspace = { id: string; name: string; icon: string | null; plan: string; ownerId: string };

export function registerWorkspaceTools(server: McpServer, ctx: ToolContext): void {
  server.registerTool(
    'list_workspaces',
    { description:
        'List the workspaces the signed-in user belongs to. isDefault marks the last visited one, which other tools use when no workspaceId is given', inputSchema: {} },
    async () => {
      try {
        const data = await graphql<{ getUserWorkspaces: Workspace[] }>(
          ctx,
          `query { getUserWorkspaces { id name icon plan ownerId } }`,
        );
        // Only look up the default when there are workspaces: that query
        // creates a workspace for a user who has none.
        const defaultId = data.getUserWorkspaces.length ? await resolveWorkspaceId(ctx) : undefined;
        return jsonResult(
          data.getUserWorkspaces.map(w => ({
            id: w.id,
            name: w.name,
            plan: w.plan,
            isOwner: w.ownerId === ctx.auth.userId,
            isDefault: w.id === defaultId,
          })),
        );
      } catch (err) {
        return errorResult(err);
      }
    },
  );
}
