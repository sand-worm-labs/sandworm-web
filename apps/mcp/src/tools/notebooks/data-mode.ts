import { z } from 'zod';

import { resolveWorkspaceId, type ToolContext } from '../../graphql.ts';
import { rest } from '../../rest.ts';

// "open": public APIs only, fetched in python cells. "sandworm": Sandworm's own
// chain data (Dune, Sandworm Cloud) and power tools.
export type DataMode = 'open' | 'sandworm';

export const data = z
  .enum(['open', 'sandworm'])
  .optional()
  .describe('Where the notebook\'s data comes from. "open": public APIs only, fetched in python cells. "sandworm": Sandworm\'s own chain data (Dune, Sandworm Cloud) and power tools. Pass it when the user says which to use, with the same value on every plan_notebook and search_tools call for that notebook. Left out, it is read from the request, and is "open" only when neither Dune nor Sandworm Cloud can run SQL.');

const OPEN = /\bopen[- ]?data\b|\b(public|open|free) apis?\b|\bpublic data\b/i;
const SANDWORM = /\bsandworm('s)? (data|tools?|cloud)\b|\bdune\b|\bpower ?tools?\b|\b(our|local|own|internal) (data|tools?)\b|\bchain data\b/i;

// What the prompt asks for. Nothing, or both, is no answer.
export function dataModeFromPrompt(prompt = ''): DataMode | undefined {
  const open = OPEN.test(prompt);
  const sandworm = SANDWORM.test(prompt);
  if (open === sandworm) return undefined;
  return open ? 'open' : 'sandworm';
}

type ChainSql = { available: boolean; paidPlanRequired: boolean };

// Chain SQL runs on Dune or Sandworm Cloud; the API says whether either can
// be reached, and whether the free plan is why not. If the check itself
// fails, assume one can.
async function chainSql(ctx: ToolContext): Promise<ChainSql> {
  try {
    const workspaceId = await resolveWorkspaceId(ctx);
    const status = await rest<Partial<ChainSql>>(ctx, 'GET', `/v1/workspaces/${workspaceId}/data-sources/chain-sql`);
    return { available: status.available ?? true, paidPlanRequired: status.paidPlanRequired ?? false };
  } catch {
    return { available: true, paidPlanRequired: false };
  }
}

export type DataScope = { mode: DataMode; freePlan: boolean };

// A free workspace always gets open data. Otherwise the call's own `data` wins,
// then what the prompt says, and with neither it is Sandworm's data unless
// neither Dune nor Sandworm Cloud can run SQL.
export async function resolveDataScope(ctx: ToolContext, given: { data?: DataMode; request?: string }): Promise<DataScope> {
  const sql = await chainSql(ctx);
  if (sql.paidPlanRequired) return { mode: 'open', freePlan: true };
  const mode = given.data ?? dataModeFromPrompt(given.request) ?? (sql.available ? 'sandworm' : 'open');
  return { mode, freePlan: false };
}

export async function resolveDataMode(ctx: ToolContext, given: { data?: DataMode; request?: string }): Promise<DataMode> {
  return (await resolveDataScope(ctx, given)).mode;
}

export const withDataMode = (ctx: ToolContext, scope: DataScope): ToolContext => ({
  ...ctx,
  openDataOnly: scope.mode === 'open',
  freePlan: scope.freePlan,
});

export const upgradeUrl = async (ctx: ToolContext) =>
  `${ctx.webUrl}/workspace/${await resolveWorkspaceId(ctx)}/settings/plan`;

export const PAID_PLAN_REASON = 'needs Sandworm chain data (paid plan)';
