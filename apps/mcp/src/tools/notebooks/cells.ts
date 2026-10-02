import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { resolveWorkspaceId, type ToolContext } from '../../graphql.ts';
import { rest } from '../../rest.ts';
import { errorResult, jsonResult, workspaceId } from '../shared.ts';
import { notebookApiPath, notebookId, notebookUrl } from './shared.ts';

const CELL_TYPES = ['sql', 'python', 'markdown'] as const;
const DATA_SOURCES = ['dune', 'duckdb', 'sandworm_cloud'] as const;

type Cell = { id: string; kind: string; title: string } & Record<string, unknown>;

export function registerCellTools(server: McpServer, ctx: ToolContext): void {
  server.registerTool(
    'add_cell',
    {
      description:
        'Add a cell to a notebook. It appears live in the editor next to cells added by hand. Returns the new cell\'s id',
      inputSchema: {
        notebookId,
        workspaceId,
        type: z.enum(CELL_TYPES),
        title: z.string().max(200).optional(),
        content: z.string().max(100_000).optional().describe('The SQL, Python or Markdown text of the cell'),
        dataSource: z.enum(DATA_SOURCES).optional().describe('SQL cells only: where the query runs'),
        dataframeName: z.string().max(100).optional().describe('SQL cells only: name the result is stored under'),
        position: z.number().int().min(0).optional().describe('Index to insert at; appends when omitted'),
      },
    },
    async ({ notebookId, workspaceId, type, title, content, dataSource, dataframeName, position }) => {
      try {
        const ws = await resolveWorkspaceId(ctx, workspaceId);
        const { blocks } = await rest<{ blocks: Cell[] }>(ctx, 'POST', `${notebookApiPath(ws, notebookId)}/blocks`, {
          blocks: [{ kind: type, title, source: content, dataSource, dataframeName }],
          position,
        });
        return jsonResult({ notebookId, cell: blocks[0], url: notebookUrl(ctx, ws, notebookId) });
      } catch (err) {
        return errorResult(err);
      }
    },
  );
}
