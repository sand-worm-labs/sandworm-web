import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { id, notImplemented } from '../shared.ts';

// Skeleton only: each handler should eventually call the Sandworm GraphQL API
// as the authenticated workspace user and, where paid, gate on `deps.charge`.
export function registerNotebookStubs(server: McpServer): void {
  server.registerTool(
    'run_notebook',
    {
      description: 'Re-run a notebook (all cells, or only the given cells)',
      inputSchema: { notebookId: id, cellIds: z.array(z.string()).optional() },
    },
    async () => notImplemented('run_notebook'),
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
