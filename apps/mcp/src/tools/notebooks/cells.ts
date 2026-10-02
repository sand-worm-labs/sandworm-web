import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { resolveWorkspaceId, type ToolContext } from '../../graphql.ts';
import { rest } from '../../rest.ts';
import { errorResult, jsonResult, workspaceId } from '../shared.ts';
import { guidanceFor } from './cell-guidance.ts';
import { notebookApiPath, notebookId, notebookUrl, objectOrJson } from './shared.ts';

const CELL_TYPES = [
  'sql',
  'python',
  'markdown',
  'rich_text',
  'visualization',
  'pivot_table',
  'input',
  'dropdown_input',
  'date_input',
  'power_toolbox',
] as const;
const DATA_SOURCES = ['dune', 'duckdb', 'sandworm_cloud'] as const;

type Cell = { id: string; kind: string; title: string } & Record<string, unknown>;

export function registerCellTools(server: McpServer, ctx: ToolContext): void {
  server.registerTool(
    'add_cell',
    {
      description: [
        'Add a cell to a notebook. It appears live in the editor next to cells added by hand. Returns the new cell\'s id. For a new analysis or any multi-cell build, call plan_notebook first and add cells in the order it returns. Cell types: sql, python, markdown, rich_text, visualization, pivot_table, input, dropdown_input, date_input, power_toolbox. For power_toolbox, find the toolId with search_tools first; the cell is configured but not run, so the user presses Run.',
        guidanceFor('python'),
      ].join('\n\n'),
      inputSchema: {
        notebookId,
        workspaceId,
        type: z.enum(CELL_TYPES),
        title: z.string().max(200).optional(),
        content: z
          .string()
          .max(100_000)
          .optional()
          .describe(
            'The cell text: SQL, Python, Markdown or rich text. For input cells, the default value (dropdown_input: one option per line; date_input: YYYY/MM/DD), with `title` as the visible label',
          ),
        dataSource: z.enum(DATA_SOURCES).optional().describe('SQL cells only: where the query runs'),
        dataframeName: z
          .string()
          .max(100)
          .optional()
          .describe('SQL cells: name the result is stored under. visualization and pivot_table cells: the dataframe to read from'),
        toolId: z.string().max(200).optional().describe('power_toolbox cells only: a toolId returned by search_tools'),
        inputs: objectOrJson(z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])))
          .optional()
          .describe("power_toolbox cells only: values for the tool's inputs, keyed by input key (see search_tools)"),
        position: z.number().int().min(0).optional().describe('Index to insert at; appends when omitted'),
      },
    },
    async ({ notebookId, workspaceId, type, title, content, dataSource, dataframeName, toolId, inputs, position }) => {
      try {
        const ws = await resolveWorkspaceId(ctx, workspaceId);
        const { blocks } = await rest<{ blocks: Cell[] }>(ctx, 'POST', `${notebookApiPath(ws, notebookId)}/blocks`, {
          blocks: [{ kind: type, title, source: content, dataSource, dataframeName, toolId, inputs }],
          position,
        });
        return jsonResult({ notebookId, cell: blocks[0], url: notebookUrl(ctx, ws, notebookId) });
      } catch (err) {
        return errorResult(err);
      }
    },
  );
}
