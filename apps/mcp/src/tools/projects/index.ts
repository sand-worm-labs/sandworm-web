import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { graphql, resolveWorkspaceId, type ToolContext } from '../../graphql.ts';
import { handle, workspaceId } from '../shared.ts';

type Document = {
  id: string;
  title: string;
  parentId: string | null;
  description: string | null;
  visibility: string;
  publishedAt: string | null;
  updatedAt: string;
  deletedAt: string | null;
};

// A "project" is a notebook in the workspace (the API calls it a document).
export function registerProjectTools(server: McpServer, ctx: ToolContext): void {
  server.registerTool(
    'list_projects',
    { description: 'List projects (notebooks) in a workspace', inputSchema: { workspaceId } },
    handle(async ({ workspaceId }) => {
      const resolvedWorkspaceId = await resolveWorkspaceId(ctx, workspaceId);
      const data = await graphql<{ getWorkspaceDocuments: Document[] }>(
        ctx,
        `query ($workspaceId: String!) {
          getWorkspaceDocuments(workspaceId: $workspaceId) {
            id title parentId description visibility publishedAt updatedAt deletedAt
          }
        }`,
        { workspaceId: resolvedWorkspaceId },
      );
      return data.getWorkspaceDocuments
        .filter(d => !d.deletedAt)
        .map(d => ({
          id: d.id,
          title: d.title,
          parentId: d.parentId,
          description: d.description,
          visibility: d.visibility,
          published: d.publishedAt !== null,
          updatedAt: d.updatedAt,
        }));
    }),
  );
}
