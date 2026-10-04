import type { AuthContext } from './auth.ts';
import type { ClientInfo } from './client.ts';

export type ToolContext = {
  auth: AuthContext;
  apiUrl: string;
  webUrl: string;
  // Set per call from the data mode (tools/notebooks/data-mode.ts): build from public APIs only.
  openDataOnly?: boolean;
  // The workspace is on the free plan, which is why chain SQL is off.
  freePlan?: boolean;
  // Save every tool call to the notebook's MCP chat (see tools/call-log.ts).
  logToolCalls?: boolean;
  client?: ClientInfo;
};

export class GraphQLError extends Error {}

// Calls the Sandworm API as the signed-in user. The API's auth guard reads the
// access token from the `access_token` cookie, so the user's token is sent that
// way (server to server, so there is no browser cookie handling involved).
export async function graphql<T>(
  ctx: ToolContext,
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const res = await fetch(`${ctx.apiUrl}/api/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: `access_token=${ctx.auth.token}` },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(30_000),
  });

  const body = (await res.json().catch(() => null)) as {
    data?: T;
    errors?: { message: string }[];
  } | null;

  if (body?.errors?.length) throw new GraphQLError(body.errors.map(e => e.message).join('; '));
  if (!res.ok || !body?.data) throw new GraphQLError(`Sandworm API returned ${res.status}`);
  return body.data;
}

// Tools take an optional workspaceId. When the agent leaves it out, use the
// user's last visited workspace (same one the web app opens), so they never
// have to look up or paste an ID.
export async function resolveWorkspaceId(ctx: ToolContext, workspaceId?: string): Promise<string> {
  if (workspaceId) return workspaceId;
  const data = await graphql<{ getUserWorkspaceInfo: { id: string } }>(
    ctx,
    `query { getUserWorkspaceInfo { id } }`,
  );
  return data.getUserWorkspaceInfo.id;
}
