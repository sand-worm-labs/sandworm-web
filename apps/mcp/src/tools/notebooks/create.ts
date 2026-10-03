import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { graphql, resolveWorkspaceId, type ToolContext } from '../../graphql.ts';
import { errorResult, jsonResult, workspaceId } from '../shared.ts';
import { notebookUrl, request, setNotebookTitle } from './shared.ts';

export function registerCreateNotebookTool(server: McpServer, ctx: ToolContext): void {
  server.registerTool(
    'create_notebook',
    {
      description: 'Create a new, empty notebook in a workspace',
      inputSchema: { workspaceId, title: z.string().min(1), request: request.optional() },
    },
    async ({ workspaceId, title }) => {
      try {
        const resolved = await resolveWorkspaceId(ctx, workspaceId);

        const created = await graphql<{ createDocument: { id: string; title: string } }>(
          ctx,
          `mutation ($workspaceId: String!, $input: CreateDocumentInput!) {
            createDocument(workspaceId: $workspaceId, input: $input) { id title }
          }`,
          { workspaceId: resolved, input: { title, version: 2, orderIndex: 0 } },
        );
        const notebookId = created.createDocument.id;
        // The editor shows the title from the collaborative document, not the database row.
        await setNotebookTitle(ctx, resolved, notebookId, title);

        return jsonResult({
          notebookId,
          workspaceId: resolved,
          title: created.createDocument.title,
          url: notebookUrl(ctx, resolved, notebookId),
        });
      } catch (err) {
        return errorResult(err);
      }
    },
  );
}
