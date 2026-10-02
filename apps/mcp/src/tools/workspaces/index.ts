import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { graphql, resolveWorkspaceId, type ToolContext } from '../../graphql.ts';
import { errorResult, jsonResult } from '../shared.ts';

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

  server.registerTool(
    'create_workspace',
    { description: 'Create a new workspace, owned by the signed-in user', inputSchema: { name: z.string().min(1) } },
    async ({ name }) => {
      try {
        const data = await graphql<{ createWorkspace: Workspace }>(
          ctx,
          `mutation ($name: String!) { createWorkspace(name: $name) { id name icon plan ownerId } }`,
          { name },
        );
        const w = data.createWorkspace;
        return jsonResult({ id: w.id, name: w.name, plan: w.plan, isOwner: w.ownerId === ctx.auth.userId });
      } catch (err) {
        return errorResult(err);
      }
    },
  );
}
