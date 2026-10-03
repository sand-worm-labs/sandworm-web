import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { ToolContext } from '../../graphql.ts';
import { errorResult, jsonResult } from '../shared.ts';
import { request } from './shared.ts';
import { OPEN_DATA_USAGE } from './open-data.ts';
import { checkTools, research } from './plan-tools.ts';

// Ported from apps/ai's block planner (services/block_planner). There the
// planner is its own LLM call; here the calling agent is the LLM, so this tool
// carries the planner's rules and checks the plan the agent submits against them.
const PLAN_BLOCK_TYPES = [
  'sql',
  'python',
  'visualization',
  'pivot_table',
  'markdown',
  'rich_text',
  'dashboard_header',
  'input',
  'dropdown_input',
  'date_input',
  'power_toolbox',
] as const;
type PlanBlockType = (typeof PLAN_BLOCK_TYPES)[number];

// How each planned block type maps onto what add_cell creates.
const CELL_FOR: Record<PlanBlockType, { type: PlanBlockType; note?: string }> = {
  sql: { type: 'sql' },
  python: { type: 'python' },
  visualization: {
    type: 'python',
    note: 'Write the chart as Plotly in a python cell that reads the dataframe it depends on. (type "visualization" only binds an empty chart to a dataframe for the user to configure.)',
  },
  markdown: { type: 'markdown' },
  rich_text: { type: 'rich_text', note: 'A heading and a few bullets or short paragraphs.' },
  dashboard_header: {
    type: 'markdown',
    note: 'A single `# Title` line naming the specific metric and subject, placed first. Also set the notebook title with edit_notebook.',
  },
  pivot_table: { type: 'pivot_table', note: 'Pass dataframeName; the user picks rows and metrics in the editor.' },
  input: { type: 'input', note: 'title is the label, content the default value.' },
  dropdown_input: { type: 'dropdown_input', note: 'title is the label, content one option per line.' },
  date_input: { type: 'date_input', note: 'title is the label, content a default date as YYYY/MM/DD.' },
  power_toolbox: {
    type: 'power_toolbox',
    note: 'Call search_tools first and pass its toolId plus every required input. Use only a tool that search_tools returned.',
  },
};

const DESCRIPTION_PARTS = [
  'Plan a notebook BEFORE adding cells. Call this first for any new analysis or multi-cell build, then create the cells with add_cell in the order returned. Skip it for a single small edit.',
  'Two calls. First call with the goal, split into subGoals, and no blocks: it searches the catalog of ready-made tools separately for each sub-goal and returns the tools that may fit each one, so you plan with them in view. Second call with the same goal plus blocks: it validates the plan, checks every power_toolbox block\'s toolId against the catalog, and flags sql/python blocks that an existing tool already covers.',
  'Block types: sql (first sql block for a sub-goal pulls chain data from dune; a later sql block may depend on an earlier one and query its result with duckdb), python (pandas/numpy transforms, or a fetch from a public API: the research step lists the ones that fit each sub-goal under openData), visualization (plotly chart from a prior sql/python block), pivot_table, markdown, rich_text, dashboard_header, input, dropdown_input, date_input, power_toolbox (a ready-made tool: call search_tools before planning one, and plan it only if a result fits).',
  'Rules: (1) a visualization or pivot_table must depend on a sql or python block; (2) each sql/python block has at most one visualization; (3) prefer chained sql blocks over one large query; (4) open with a dashboard_header when there are 3+ other blocks, and do not restate its topic in other titles; (5) add input/dropdown_input/date_input only for a value meant to be adjustable, and put them before any sql block; (6) titles of 8 words or fewer; descriptions say what, not how; (7) skip sub-goals that are not feasible.',
];

const OFFLINE_NOTE =
  'Chain data (Dune, Sandworm Cloud) and power tools are offline right now. Get all data with python blocks that fetch from the openData sources the research step returns, combining sources when one does not cover a sub-goal. A sql block may then depend on a python block and query its dataframe with duckdb. Do not plan power_toolbox blocks, or sql blocks that depend on nothing; the plan is rejected if it has any.';

const describePlanTool = (ctx: ToolContext) => [...DESCRIPTION_PARTS, ...(ctx.openDataOnly ? [OFFLINE_NOTE] : [])].join('\n\n');

const planBlock = z.object({
  type: z.enum(PLAN_BLOCK_TYPES),
  title: z.string().min(1),
  description: z.string().min(1),
  dependsOn: z.array(z.number().int().min(0)).default([]).describe('0-based indices of earlier blocks whose output this one needs'),
  toolId: z.string().optional().describe('power_toolbox blocks only: the toolId from the research step or search_tools'),
});
export type PlannedBlock = z.infer<typeof planBlock>;

const WORD_LIMIT = 8;

// Returns every rule the plan breaks; an empty list means it is good to go.
function validate(blocks: PlannedBlock[]): string[] {
  const problems: string[] = [];
  const isData = (t: PlanBlockType) => t === 'sql' || t === 'python';
  const vizCount = new Map<number, number>();
  let seenSql = false;

  blocks.forEach((b, i) => {
    const at = `Block ${i} ("${b.title}")`;
    for (const d of b.dependsOn) if (d >= i) problems.push(`${at} depends on block ${d}, which does not come before it.`);
    if (b.title.trim().split(/\s+/).length > WORD_LIMIT) problems.push(`${at} has a title over ${WORD_LIMIT} words.`);

    if (b.type === 'visualization' || b.type === 'pivot_table') {
      const source = b.dependsOn.find(d => d < i && isData(blocks[d]!.type));
      if (source === undefined) problems.push(`${at} must depend on a sql or python block.`);
      else if (b.type === 'visualization') {
        const n = (vizCount.get(source) ?? 0) + 1;
        vizCount.set(source, n);
        if (n > 1) problems.push(`Block ${source} has more than one visualization; keep at most one per sql/python block.`);
      }
    }
    if (b.type === 'sql') seenSql = true;
    if ((b.type === 'input' || b.type === 'dropdown_input' || b.type === 'date_input') && seenSql) {
      problems.push(`${at} is an interactive block placed after a sql block; move it to the top.`);
    }
  });

  const header = blocks.findIndex(b => b.type === 'dashboard_header');
  const others = blocks.length - (header === -1 ? 0 : 1);
  if (header === -1 && others >= 3) problems.push('A plan with 3 or more blocks should open with a dashboard_header.');
  if (header > 0) problems.push('The dashboard_header should be the first block.');
  return problems;
}

const researchNext = (ctx: ToolContext, subGoalTools: { tools: unknown[] }[]) => {
  if (ctx.openDataOnly) {
    return `Chain data and power tools are offline. Plan python blocks that fetch from each sub-goal's openData sources (sql blocks may query their dataframes with duckdb), then call plan_notebook again with the same goal and your blocks. ${OPEN_DATA_USAGE}`;
  }
  if (subGoalTools.some(g => g.tools.length)) {
    return 'For each sub-goal, plan one of its tools as a power_toolbox block with its toolId when it fits. Plan sql/python only for sub-goals no tool covers; a python block can fetch from that sub-goal\'s openData sources. Then call plan_notebook again with the same goal and your blocks.';
  }
  return 'No catalog tool matched. Try search_tools with other words, or plan sql blocks, or python blocks that fetch from the openData sources, and call plan_notebook again with your blocks.';
};

export function registerPlanTool(server: McpServer, ctx: ToolContext): void {
  server.registerTool(
    'plan_notebook',
    {
      description: describePlanTool(ctx),
      inputSchema: {
        goal: z.string().min(1).describe('What the notebook should answer, in one sentence'),
        // Only saved when calls are logged, so only asked for then.
        request: ctx.logToolCalls ? request : request.optional(),
        subGoals: z
          .array(z.object({ goal: z.string(), feasible: z.boolean(), reason: z.string().optional() }))
          .optional()
          .describe('The goal split into its parts, ideally 2 to 6. Each one is searched in the tool catalog on its own. Mark a sub-goal feasible: false when the data is not available; no blocks are planned for it.'),
        blocks: z.array(planBlock).min(1).max(40).optional().describe('Omit on the first call to get candidate tools; send the plan on the second'),
      },
    },
    async ({ goal, subGoals, blocks }) => {
      try {
        if (!blocks) {
          const subGoalTools = await research(ctx, goal, subGoals ?? []);
          return jsonResult({
            step: 'research',
            goal,
            subGoals: subGoalTools,
            next: researchNext(ctx, subGoalTools),
          });
        }

        const toolCheck = await checkTools(ctx, blocks);
        const problems = [...validate(blocks), ...toolCheck.problems];
        if (problems.length) {
          return {
            isError: true,
            content: [{ type: 'text' as const, text: `Plan not accepted. Fix these and call plan_notebook again:\n- ${problems.join('\n- ')}` }],
          };
        }

        const steps = blocks.map((b, i) => {
          const cell = CELL_FOR[b.type];
          return {
            step: i,
            plannedType: b.type,
            title: b.title,
            description: b.description,
            dependsOn: b.dependsOn,
            addCell: { type: cell.type, ...(cell.note ? { note: cell.note } : {}) },
            ...(b.toolId ? { toolId: b.toolId } : {}),
            ...(toolCheck.suggestions.has(i)
              ? { toolSuggestion: { ...toolCheck.suggestions.get(i), note: 'An existing tool may already do this. Plan it as power_toolbox instead, or keep this block if the tool does not fit.' } }
              : {}),
          };
        });

        return jsonResult({
          goal,
          skippedSubGoals: (subGoals ?? []).filter(s => !s.feasible),
          steps,
          next: [
            'Create the cells with add_cell in step order (pass position to keep that order), then check the notebook with get_notebook.',
            ...(blocks.some(b => b.type === 'python') ? [OPEN_DATA_USAGE] : []),
          ].join(' '),
        });
      } catch (err) {
        return errorResult(err);
      }
    },
  );
}
