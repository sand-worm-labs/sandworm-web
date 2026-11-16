import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { graphql, resolveWorkspaceId, type ToolContext } from '../../graphql.ts';
import { handle, workspaceId } from '../shared.ts';
import { NOTEBOOK_TYPES, notebookType, notebookUrl, parentNotebookId, request, setNotebookTitle } from './shared.ts';

export function registerCreateNotebookTool(server: McpServer, ctx: ToolContext): void {
  server.registerTool(
    'create_notebook',
    {
      description:
        'Create a new, empty notebook in a workspace. Pick its type: cloud for heavy research and SQL, live_dashboard for a light dashboard that runs in the browser, local_analysis for quick browser analysis. ' +
        'Pass parentId to nest it under an existing notebook (it is added as that notebook\'s last nested notebook), e.g. to split a deep dive into sub-notebooks under one overview',
      inputSchema: {
        workspaceId,
        title: z.string().min(1),
        type: notebookType.default('cloud'),
        parentId: parentNotebookId.optional(),
        request: request.optional(),
      },
    },
    handle(async ({ workspaceId, title, type, parentId }) => {
      const resolved = await resolveWorkspaceId(ctx, workspaceId);

      const created = await graphql<{ createDocument: { id: string; title: string; parentId: string | null } }>(
        ctx,
        `mutation ($workspaceId: String!, $input: CreateDocumentInput!) {
          createDocument(workspaceId: $workspaceId, input: $input) { id title parentId }
        }`,
        {
          workspaceId: resolved,
          // A top-level notebook goes first in the sidebar; a nested one goes last among its siblings.
          input: {
            title,
            version: 2,
            orderIndex: parentId ? -1 : 0,
            runtime: NOTEBOOK_TYPES[type],
            ...(parentId ? { parentId } : {}),
          },
        },
      );
      const notebookId = created.createDocument.id;
      await setNotebookTitle(ctx, resolved, notebookId, title);

      return {
        notebookId,
        workspaceId: resolved,
        title: created.createDocument.title,
        type,
        parentId: created.createDocument.parentId,
        url: notebookUrl(ctx, resolved, notebookId),
      };
    }),
  );
}
