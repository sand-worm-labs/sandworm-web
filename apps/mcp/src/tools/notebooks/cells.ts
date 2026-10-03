import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { resolveWorkspaceId, type ToolContext } from '../../graphql.ts';
import { rest } from '../../rest.ts';
import { confirm, errorResult, jsonResult, workspaceId } from '../shared.ts';
import { OPEN_DATA_USAGE } from './open-data.ts';
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

// Defaults for writing Python cells, appended to the add and update tool
// descriptions; phrased so the agent can depart from them.
const PYTHON_GUIDANCE = [
  'Python cells.',
  'Charts: prefer Plotly (interactive, any chart type that suits the data); matplotlib also works.',
  'Call `from sandworm_theme import use_theme; use_theme()` once, before drawing, to get Sandworm\'s default colors and font on Plotly and matplotlib charts. Do not hard-code your own palette or fonts unless the data needs something else.',
  'With Plotly Express bars, `color=` on a column other than the category axis gives every colour its own slot and makes each bar thin: add `fig.update_layout(barmode="overlay")` when each category has a single bar.',
  'For HTML summaries, `from sandworm_theme import show, stat_card, card, note` give styled stat cards and cards: `show(stat_card(value, label, secondary=[(value, label), ...]))`. Optional.',
  `Data from public APIs: ${OPEN_DATA_USAGE}`,
].join(' ');

const cellId = z.uuid().describe('ID (UUID) of the cell, as returned by add_cell, get_notebook or run_notebook');

export function registerCellTools(server: McpServer, ctx: ToolContext): void {
  server.registerTool(
    'add_cell',
    {
      description: [
        'Add a cell to a notebook. It appears live in the editor next to cells added by hand. Returns the new cell\'s id. For a new analysis or any multi-cell build, call plan_notebook first and add cells in the order it returns. Cell types: sql, python, markdown, rich_text, visualization, pivot_table, input, dropdown_input, date_input, power_toolbox. For power_toolbox, find the toolId with search_tools first. Adding a cell does not run it: call run_notebook for that.',
        PYTHON_GUIDANCE,
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

  server.registerTool(
    'update_cell',
    {
      description: [
        'Change a cell in place: it keeps its id and position. Send only what should change; anything omitted stays as it is. `content` replaces the whole text of the cell, so send the complete new text, not a fragment. The type of a cell cannot be changed: delete it and add another.',
        'What each type accepts: sql takes title, content, dataSource, dataframeName (renaming resets its result). python, markdown and rich_text take title, content. visualization and pivot_table take title, dataframeName. input, dropdown_input and date_input take title (the label) and content (the value; dropdown_input: the full list of options, one per line; date_input: YYYY/MM/DD). power_toolbox takes title and inputs (the full set of inputs, not a partial one).',
        'An edit does not run the cell: call run_notebook afterwards, and until then run results for the cell are marked stale. Fails while the cell is queued or running.',
        PYTHON_GUIDANCE,
      ].join('\n\n'),
      inputSchema: {
        notebookId,
        workspaceId,
        cellId,
        title: z.string().max(200).optional(),
        content: z.string().max(100_000).optional().describe('The complete new text of the cell'),
        dataSource: z.enum(DATA_SOURCES).optional().describe('SQL cells only: where the query runs'),
        dataframeName: z
          .string()
          .max(100)
          .optional()
          .describe('SQL cells: name the result is stored under. visualization and pivot_table cells: the dataframe to read from'),
        inputs: objectOrJson(z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])))
          .optional()
          .describe("power_toolbox cells only: values for all of the tool's inputs, keyed by input key (see search_tools)"),
      },
    },
    async ({ notebookId, workspaceId, cellId, title, content, dataSource, dataframeName, inputs }) => {
      try {
        const ws = await resolveWorkspaceId(ctx, workspaceId);
        const { block } = await rest<{ block: Cell }>(ctx, 'PATCH', `${notebookApiPath(ws, notebookId)}/blocks/${cellId}`, {
          title,
          source: content,
          dataSource,
          dataframeName,
          inputs,
        });
        return jsonResult({ notebookId, cell: block, url: notebookUrl(ctx, ws, notebookId) });
      } catch (err) {
        return errorResult(err);
      }
    },
  );

  server.registerTool(
    'delete_cell',
    {
      description:
        'Delete a cell from a notebook. These tools cannot undo it. Fails while the cell is queued or running, and for a cell shown on the dashboard unless removeFromDashboard is set.',
      inputSchema: {
        notebookId,
        workspaceId,
        cellId,
        removeFromDashboard: z.boolean().optional().describe('Also remove the cell from the dashboard, if it is shown there'),
        confirm,
      },
    },
    async ({ notebookId, workspaceId, cellId, removeFromDashboard }) => {
      try {
        const ws = await resolveWorkspaceId(ctx, workspaceId);
        const query = removeFromDashboard ? '?removeFromDashboard=true' : '';
        await rest(ctx, 'DELETE', `${notebookApiPath(ws, notebookId)}/blocks/${cellId}${query}`);
        return jsonResult({ notebookId, deleted: cellId, url: notebookUrl(ctx, ws, notebookId) });
      } catch (err) {
        return errorResult(err);
      }
    },
  );
}
