import type { ToolContext } from '../../graphql.ts';
import type { PlannedBlock } from './plan.ts';
import { matchOpenData } from './open-data.ts';
import { describeTool, keywordSearch, loadCatalog, searchCatalog } from './tool-catalog.ts';

const TOOLS_PER_SUB_GOAL = 3;
const MAX_SUB_GOALS = 8;

// The agent normally supplies the sub-goals; a goal sent without them is split on its own conjunctions.
const splitGoal = (goal: string) =>
  goal
    .split(/[,;]|\band\b|\bthen\b/i)
    .map(part => part.trim())
    .filter(part => part.length > 3);

export async function research(ctx: ToolContext, goal: string, subGoals: { goal: string; feasible: boolean }[]) {
  const given = subGoals.filter(s => s.feasible).map(s => s.goal);
  const parts = given.length ? given : splitGoal(goal);
  const queries = (parts.length > 1 ? parts : [goal]).slice(0, MAX_SUB_GOALS);

  // Public APIs come back alongside the power tools, so a sub-goal no tool covers
  // still has somewhere to get data from; with chain data offline they are all there is.
  // By id only: several sub-goals usually share a source, which the caller describes once.
  return Promise.all(
    queries.map(async subGoal => ({
      subGoal,
      tools: ctx.openDataOnly ? [] : (await searchCatalog(ctx, subGoal, TOOLS_PER_SUB_GOAL)).map(m => describeTool(m.tool)),
      openData: matchOpenData(subGoal).map(source => source.id),
    })),
  );
}

// A planned tool must exist; a sql/python block whose title fully matches a tool is flagged as replaceable.
export async function checkTools(ctx: ToolContext, blocks: PlannedBlock[]) {
  if (ctx.openDataOnly) return offlineCheck(blocks);
  const catalog = new Map((await loadCatalog(ctx)).map(t => [t.toolId, t]));
  const problems: string[] = [];
  const suggestions = new Map<number, { toolId: string; name: string }>();

  for (const [i, b] of blocks.entries()) {
    if (b.type === 'power_toolbox') {
      if (!b.toolId) problems.push(`Block ${i} ("${b.title}") is a power_toolbox but has no toolId. Pick one from the research step or search_tools.`);
      else if (!catalog.has(b.toolId)) problems.push(`Block ${i} ("${b.title}") uses tool "${b.toolId}", which is not in the catalog. Use search_tools to find a real toolId.`);
    } else if (b.type === 'sql' || b.type === 'python') {
      const [best] = await keywordSearch(ctx, b.title, 1);
      if (best?.allWords) suggestions.set(i, { toolId: best.tool.toolId, name: best.tool.name });
    }
  }
  return { problems, suggestions };
}

// On open data only, a power tool or a sql pull from Dune has no place (and
// fails at run time when chain data is offline). sql that depends on an earlier
// block is fine: it queries that block's dataframe with duckdb.
function offlineCheck(blocks: PlannedBlock[]) {
  const problems = blocks.flatMap((b, i) => {
    const at = `Block ${i} ("${b.title}")`;
    if (b.type === 'power_toolbox') return [`${at} is a power_toolbox, but this plan uses open data only. Make it a python block that fetches from the openData sources.`];
    if (b.type === 'sql' && !b.dependsOn.length) {
      return [`${at} is sql with nothing to query: this plan uses open data only. Fetch the data in a python block first and make this block depend on it, to query its dataframe with duckdb.`];
    }
    return [];
  });
  return { problems, suggestions: new Map<number, { toolId: string; name: string }>() };
}
