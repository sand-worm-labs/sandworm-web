import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { graphql, resolveWorkspaceId, type ToolContext } from '../graphql.ts';
import { confirm, errorResult, id, jsonResult, notImplemented, workspaceId } from './shared.ts';

// Notebook format the web app creates new documents with.
const NOTEBOOK_VERSION = 2;

// Where the web app opens a notebook; the same route the sidebar navigates to.
export const notebookUrl = (webUrl: string, workspaceId: string, notebookId: string) =>
  `${webUrl}/workspace/${workspaceId}/documents/${notebookId}`;

// Only create_notebook is implemented; the rest are stubs. Implemented handlers
// call the Sandworm GraphQL API as the authenticated user and, where paid,
// should gate on `deps.charge`.
export function registerNotebookTools(server: McpServer, ctx: ToolContext): void {
  server.registerTool(
    'create_notebook',
    {
      description:
        'Create a new, empty notebook in a workspace and return its id and a link to open it. Add cells to it afterwards',
      inputSchema: {
        workspaceId,
        title: z.string().trim().min(1).max(200).describe('Title of the notebook'),
      },
    },
    async ({ workspaceId, title }) => {
      try {
        const resolvedWorkspaceId = await resolveWorkspaceId(ctx, workspaceId);
        const data = await graphql<{ createDocument: { id: string; title: string } }>(
          ctx,
          `mutation ($workspaceId: String!, $input: CreateDocumentInput!) {
            createDocument(workspaceId: $workspaceId, input: $input) { id title }
          }`,
          { workspaceId: resolvedWorkspaceId, input: { title, parentId: null, version: NOTEBOOK_VERSION } },
        );
        const { id: notebookId } = data.createDocument;
        return jsonResult({
          id: notebookId,
          title: data.createDocument.title,
          workspaceId: resolvedWorkspaceId,
          url: notebookUrl(ctx.webUrl, resolvedWorkspaceId, notebookId),
        });
      } catch (err) {
        return errorResult(err);
      }
    },
  );

  server.registerTool(
    'edit_notebook',
    {
      description: 'Edit an existing notebook: rename it or change its cells',
      inputSchema: {
        notebookId: id,
        title: z.string().optional(),
        cells: z
          .array(z.object({ type: z.enum(['sql', 'python', 'markdown']), content: z.string() }))
          .optional(),
      },
    },
    async () => notImplemented('edit_notebook'),
  );

  server.registerTool(
    'delete_notebook',
    { description: 'Delete a notebook (moves it to trash)', inputSchema: { notebookId: id, confirm } },
    async () => notImplemented('delete_notebook'),
  );

  server.registerTool(
    'publish_notebook',
    { description: 'Publish a notebook so it can be viewed by others', inputSchema: { notebookId: id } },
    async () => notImplemented('publish_notebook'),
  );

  server.registerTool(
    'unpublish_notebook',
    { description: 'Unpublish a previously published notebook', inputSchema: { notebookId: id } },
    async () => notImplemented('unpublish_notebook'),
  );

  server.registerTool(
    'get_notebook',
    { description: 'Fetch a notebook and its cells', inputSchema: { notebookId: id } },
    async () => notImplemented('get_notebook'),
  );

  server.registerTool(
    'run_notebook',
    {
      description: 'Re-run a notebook (all cells, or only the given cells)',
      inputSchema: { notebookId: id, cellIds: z.array(z.string()).optional() },
    },
    async () => notImplemented('run_notebook'),
  );

  server.registerTool(
    'schedule_notebook',
    {
      description: 'Schedule a notebook to re-run on a cron schedule',
      inputSchema: {
        notebookId: id,
        cron: z.string().describe('Cron expression, e.g. "0 9 * * 1"'),
        timezone: z.string().optional().describe('IANA timezone, e.g. "Europe/London"'),
      },
    },
    async () => notImplemented('schedule_notebook'),
  );

  server.registerTool(
    'unschedule_notebook',
    { description: 'Remove the schedule from a notebook', inputSchema: { notebookId: id } },
    async () => notImplemented('unschedule_notebook'),
  );

  server.registerTool(
    'fork_notebook',
    {
      description: 'Fork a published notebook into a workspace',
      inputSchema: { notebookId: id, workspaceId },
    },
    async () => notImplemented('fork_notebook'),
  );

  server.registerTool(
    'get_run_results',
    {
      description: 'Get the outputs of the latest run of a notebook (cell outputs, charts, errors)',
      inputSchema: { notebookId: id },
    },
    async () => notImplemented('get_run_results'),
  );

  // Cell-level editing goes through Yjs (POST /yjs/:documentId/create-block),
  // not GraphQL.
  server.registerTool(
    'add_cell',
    {
      description: 'Add a cell to a notebook',
      inputSchema: {
        notebookId: id,
        type: z.enum(['sql', 'python', 'markdown']),
        content: z.string(),
        position: z.number().int().optional().describe('Index to insert at; appends when omitted'),
      },
    },
    async () => notImplemented('add_cell'),
  );

  server.registerTool(
    'update_cell',
    {
      description: 'Change the content of a cell',
      inputSchema: { notebookId: id, cellId: id, content: z.string() },
    },
    async () => notImplemented('update_cell'),
  );

  server.registerTool(
    'delete_cell',
    { description: 'Delete a cell from a notebook', inputSchema: { notebookId: id, cellId: id } },
    async () => notImplemented('delete_cell'),
  );
}
