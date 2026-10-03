import { z } from 'zod';

import { resolveWorkspaceId, type ToolContext } from '../../graphql.ts';
import { rest } from '../../rest.ts';

// "open": public APIs only, fetched in python cells. "sandworm": Sandworm's own
// chain data (Dune, Sandworm Cloud) and power tools.
export type DataMode = 'open' | 'sandworm';

export const data = z
  .enum(['open', 'sandworm'])
  .optional()
  .describe('Where the notebook\'s data comes from. "open": public APIs only, fetched in python cells. "sandworm": Sandworm\'s own chain data (Dune, Sandworm Cloud) and power tools. Pass it when the user says which to use, with the same value on every plan_notebook and search_tools call for that notebook. Left out, it is read from the request, and is "open" only when Sandworm\'s SQL data is offline.');

const OPEN = /\bopen[- ]?data\b|\b(public|open|free) apis?\b|\bpublic data\b/i;
const SANDWORM = /\bsandworm('s)? (data|tools?|cloud)\b|\bdune\b|\bpower ?tools?\b|\b(our|local|own|internal) (data|tools?)\b|\bchain data\b/i;

// What the prompt asks for. Nothing, or both, is no answer.
export function dataModeFromPrompt(prompt = ''): DataMode | undefined {
  const open = OPEN.test(prompt);
  const sandworm = SANDWORM.test(prompt);
  if (open === sandworm) return undefined;
  return open ? 'open' : 'sandworm';
}

// Dune is where chain SQL runs; its ping says whether the endpoint can be
// reached. If the check itself fails, assume it can.
async function canRunSql(ctx: ToolContext): Promise<boolean> {
  try {
    const workspaceId = await resolveWorkspaceId(ctx);
    const ping = await rest<{ connStatus: string }>(ctx, 'POST', `/v1/workspaces/${workspaceId}/data-sources/dune-datasource/ping`);
    return ping.connStatus !== 'offline';
  } catch {
    return true;
  }
}

// The call's own `data` wins, then what the prompt says. With neither, it is
// Sandworm's data unless SQL cannot run.
export async function resolveDataMode(ctx: ToolContext, given: { data?: DataMode; request?: string }): Promise<DataMode> {
  return given.data ?? dataModeFromPrompt(given.request) ?? ((await canRunSql(ctx)) ? 'sandworm' : 'open');
}

export const withDataMode = (ctx: ToolContext, mode: DataMode): ToolContext => ({ ...ctx, openDataOnly: mode === 'open' });
