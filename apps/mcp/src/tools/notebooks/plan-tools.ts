import type { ToolContext } from '../../graphql.ts';
import type { PlannedBlock } from './plan.ts';
import { describeOpenData, matchOpenData } from './open-data.ts';
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
  return Promise.all(
    queries.map(async subGoal => ({
      subGoal,
      tools: ctx.openDataOnly ? [] : (await searchCatalog(ctx, subGoal, TOOLS_PER_SUB_GOAL)).map(m => describeTool(m.tool)),
      openData: matchOpenData(subGoal).map(describeOpenData),
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

// With chain data offline, sql against Dune and power tools would only fail at run time.
function offlineCheck(blocks: PlannedBlock[]) {
  const problems = blocks.flatMap((b, i) =>
    b.type === 'power_toolbox' || b.type === 'sql'
      ? [`Block ${i} ("${b.title}") is ${b.type}, but chain data and power tools are offline. Make it a python block that fetches from the openData sources.`]
      : [],
  );
  return { problems, suggestions: new Map<number, { toolId: string; name: string }>() };
}
