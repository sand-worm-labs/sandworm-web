import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { resolveWorkspaceId, type ToolContext } from '../../graphql.ts';
import { rest } from '../../rest.ts';
import { handle, workspaceId } from '../shared.ts';
import { notebookApiPath, notebookId, objectOrJson, turnRequest } from './shared.ts';

const COLUMNS = 24;

const tile = z.object({
  cellId: z.uuid().describe('ID of the cell, as returned by add_cell or get_notebook'),
  width: z
    .number()
    .int()
    .min(1)
    .max(COLUMNS)
    .optional()
    .describe(`Width in columns out of ${COLUMNS}. A row's widths must add up to ${COLUMNS}; leave every width out to split the row evenly`),
});

const row = z.object({
  heading: z.string().max(120).optional().describe('A section title, drawn full width above this row. A row may have only a heading'),
  height: z
    .number()
    .int()
    .min(1)
    .max(40)
    .optional()
    .describe('Height in grid rows, shared by every tile in the row so their tops and bottoms line up. Defaults to 8 for charts, tables and queries, 3 for text, 2 for inputs'),
  tiles: z.array(tile).max(12).optional().describe('The row\'s cells, left to right'),
});

// The sizes are for a 1300px-wide screen, where the dashboard is 1164px wide:
// a column is 42px plus a 6px gap, a grid row 50px plus a 6px gap. Chart text
// is the reason for the minimums: the dashboard draws a Plotly figure at the
// size of its tile and shrinks the text by how much smaller the tile is than
// the figure was made (700x450 unless the cell sets it).
const SIZING = [
  'Sizes assume a 1300px screen: a column is about 48px (6 columns = 285px, 8 = 380px, 12 = 573px, 24 = 1152px) and a grid row about 56px (3 rows = 162px, 5 = 274px, 8 = 442px, 10 = 554px). A tile with a title spends 40px of its height on it.',
  'Choose sizes by what the cell shows:',
  '- stat_card (big number): 6 to 8 columns wide so 3 or 4 sit in a row, 5 rows tall when it has secondary figures, 3 when it has none.',
  '- Chart (python + Plotly): at least 12 columns and 8 rows. A chart is drawn at 700x450px and its text shrinks in a smaller tile, so a narrow tile gives tiny text; for a chart that must go narrower, set the figure size in its cell (fig.update_layout(width=380, height=330)). Pair a wide chart with a narrow one as 16 + 8 or 14 + 10; use 8 + 8 + 8 only for small charts such as a pie or gauge made at that size.',
  '- Table: 12 columns or more, about 1 grid row per 1.5 table rows plus 2 for the header (a top-10 table is 9 rows). Rows past the tile height are cut off.',
  '- Markdown or rich text: 8 to 24 columns, 3 rows. Inputs: 4 to 6 columns, 2 rows, in a row of their own at the top.',
].join('\n');

const EXAMPLE = JSON.stringify([
  { tiles: [{ cellId: '<tvl>', width: 8 }, { cellId: '<stablecoins>', width: 8 }, { cellId: '<dex volume>', width: 8 }], height: 5 },
  { heading: 'Where the value sits', tiles: [{ cellId: '<bar chart>', width: 14 }, { cellId: '<donut>', width: 10 }], height: 9 },
  { tiles: [{ cellId: '<tvl history>' }], height: 8 },
]);

export function registerDashboardTools(server: McpServer, ctx: ToolContext): void {
  const dashboardApiPath = (ws: string, id: string) => `${notebookApiPath(ws, id)}/dashboard`;
  const dashboardUrl = (ws: string, id: string) => `${ctx.webUrl}/workspace/${ws}/documents/${id}/dashboard`;

  server.registerTool(
    'set_dashboard',
    {
      description: [
        'Lay out the dashboard of a notebook: which cells appear on it, in what order, and how big. Call it last, after the cells exist and have run (a cell that has not run is an empty tile). It replaces the whole dashboard: cells you leave out come off the dashboard but stay in the notebook, and an empty `rows` clears it.',
        `The dashboard is a grid ${COLUMNS} columns wide, written as rows from top to bottom. Each row lists its \`tiles\` left to right with a \`width\` in columns that add up to ${COLUMNS}, and one \`height\` in grid rows for the whole row. You never give positions. Put a \`heading\` on a row to open a section.`,
        SIZING,
        'The dashboard already shows the notebook title above the grid, so leave the title cell off it. Only python, sql, pivot_table, markdown, rich_text and input cells can be tiles: build charts as python cells with Plotly, since `visualization` cells render blank on the dashboard. A cell appears at most once.',
        `Example: ${EXAMPLE}`,
        'The reply gives the layout as drawn, with each tile\'s approximate pixel size, and `warnings` for tiles likely to look wrong (not run, or a chart that would be drawn with tiny text). Read them and call again to adjust.',
      ].join('\n\n'),
      inputSchema: {
        notebookId,
        workspaceId,
        rows: objectOrJson(z.array(row).max(60)).describe('The layout, top to bottom'),
        request: turnRequest,
      },
    },
    handle(async ({ notebookId, workspaceId, rows }) => {
      const ws = await resolveWorkspaceId(ctx, workspaceId);
      const layout = await rest<Record<string, unknown>>(ctx, 'PUT', dashboardApiPath(ws, notebookId), { rows });
      return { notebookId, ...layout, url: dashboardUrl(ws, notebookId) };
    }),
  );

  server.registerTool(
    'edit_header',
    {
      description:
        'Change the text of one dashboard heading (the section title drawn above a row), leaving the layout and every cell as they are. Take the headingId from get_dashboard or set_dashboard, which list it on each row that has a heading. To add or remove a heading, or change the layout, use set_dashboard instead.',
      inputSchema: {
        notebookId,
        workspaceId,
        headingId: z.uuid().describe('ID of the heading, as returned by get_dashboard as the row\'s headingId'),
        content: z.string().min(1).max(120).describe('The new heading text, plain text on one line'),
        request: turnRequest,
      },
    },
    handle(async ({ notebookId, workspaceId, headingId, content }) => {
      const ws = await resolveWorkspaceId(ctx, workspaceId);
      const layout = await rest<Record<string, unknown>>(ctx, 'PATCH', `${dashboardApiPath(ws, notebookId)}/headings/${headingId}`, {
        content,
      });
      return { notebookId, ...layout, url: dashboardUrl(ws, notebookId) };
    }),
  );

  server.registerTool(
    'get_dashboard',
    {
      description:
        'Read the dashboard layout of a notebook, in the same shape set_dashboard takes: rows of tiles with their widths and heights, plus warnings. Use it before changing a dashboard someone has already arranged',
      inputSchema: { notebookId, workspaceId, request: turnRequest },
    },
    handle(async ({ notebookId, workspaceId }) => {
      const ws = await resolveWorkspaceId(ctx, workspaceId);
      const layout = await rest<Record<string, unknown>>(ctx, 'GET', dashboardApiPath(ws, notebookId));
      return { notebookId, ...layout, url: dashboardUrl(ws, notebookId) };
    }),
  );
}
