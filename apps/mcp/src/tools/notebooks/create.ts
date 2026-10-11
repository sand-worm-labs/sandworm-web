import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { graphql, resolveWorkspaceId, type ToolContext } from '../../graphql.ts';
import { handle, workspaceId } from '../shared.ts';
import { NOTEBOOK_TYPES, notebookType, notebookUrl, request, setNotebookTitle } from './shared.ts';

export function registerCreateNotebookTool(server: McpServer, ctx: ToolContext): void {
  server.registerTool(
    'create_notebook',
    {
      description: 'Create a new, empty notebook in a workspace. Pick its type: cloud for heavy research and SQL, live_dashboard for a light dashboard that runs in the browser, local_analysis for quick browser analysis',
      inputSchema: {
        workspaceId,
        title: z.string().min(1),
        type: notebookType.default('cloud'),
        request: request.optional(),
      },
    },
    handle(async ({ workspaceId, title, type }) => {
      const resolved = await resolveWorkspaceId(ctx, workspaceId);

      const created = await graphql<{ createDocument: { id: string; title: string } }>(
        ctx,
        `mutation ($workspaceId: String!, $input: CreateDocumentInput!) {
          createDocument(workspaceId: $workspaceId, input: $input) { id title }
        }`,
        { workspaceId: resolved, input: { title, version: 2, orderIndex: 0, runtime: NOTEBOOK_TYPES[type] } },
      );
      const notebookId = created.createDocument.id;
      await setNotebookTitle(ctx, resolved, notebookId, title);

      return {
        notebookId,
        workspaceId: resolved,
        title: created.createDocument.title,
        type,
        url: notebookUrl(ctx, resolved, notebookId),
      };
    }),
  );
}
