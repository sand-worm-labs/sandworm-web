import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { graphql, resolveWorkspaceId, type ToolContext } from '../../graphql.ts';
import { handle, workspaceId } from '../shared.ts';
import { assertCanNestUnder, fetchTree } from '../tree.ts';
import { NOTEBOOK_TYPES, notebookType, notebookUrl, request, setNotebookTitle } from './shared.ts';

export function registerCreateNotebookTool(server: McpServer, ctx: ToolContext): void {
  server.registerTool(
    'create_notebook',
    {
      description:
        'Create a new, empty notebook in a workspace. Pick its type: cloud for heavy research and SQL, live_dashboard for a light dashboard that runs in the browser, local_analysis for quick browser analysis. ' +
        'Pass parentId to put it inside an existing top-level notebook, which then works as its folder; leave it out for the top level',
      inputSchema: {
        workspaceId,
        title: z.string().min(1),
        type: notebookType.default('cloud'),
        parentId: z
          .uuid()
          .optional()
          .describe('ID of a top-level notebook (from list_projects) to create this one inside. Notebooks nest one level deep, so it cannot itself be inside another'),
        request: request.optional(),
      },
    },
    handle(async ({ workspaceId, title, type, parentId }) => {
      const resolved = await resolveWorkspaceId(ctx, workspaceId);
      if (parentId) assertCanNestUnder(await fetchTree(ctx, resolved), parentId);

      const created = await graphql<{ createDocument: { id: string; title: string } }>(
        ctx,
        `mutation ($workspaceId: String!, $input: CreateDocumentInput!) {
          createDocument(workspaceId: $workspaceId, input: $input) { id title }
        }`,
        {
          workspaceId: resolved,
          input: { title, version: 2, orderIndex: 0, runtime: NOTEBOOK_TYPES[type], ...(parentId ? { parentId } : {}) },
        },
      );
      const notebookId = created.createDocument.id;
      await setNotebookTitle(ctx, resolved, notebookId, title);

      return {
        notebookId,
        workspaceId: resolved,
        title: created.createDocument.title,
        type,
        parentId: parentId ?? null,
        url: notebookUrl(ctx, resolved, notebookId),
      };
    }),
  );
}
