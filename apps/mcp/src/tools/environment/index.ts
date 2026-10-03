import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { graphql, resolveWorkspaceId, type ToolContext } from '../../graphql.ts';
import { confirm, handle, workspaceId } from '../shared.ts';

type EnvVar = { id: string; name: string };

// Write-only on purpose: there is no list tool, because values are plain text
// secrets and an agent must not be able to read them back. Tools below only
// ever return variable names.
// Variables are workspace-wide and are exposed to notebook code at run time.
export function registerEnvironmentTools(server: McpServer, ctx: ToolContext): void {
  const listVars = async (workspaceId: string) =>
    (
      await graphql<{ environmentVariables: EnvVar[] }>(
        ctx,
        `query ($workspaceId: String!) { environmentVariables(workspaceId: $workspaceId) { id name } }`,
        { workspaceId },
      )
    ).environmentVariables;

  server.registerTool(
    'set_env_vars',
    {
      description:
        'Add or update environment variables in a workspace. Values cannot be read back afterwards',
      inputSchema: {
        workspaceId,
        variables: z.array(z.object({ name: z.string().min(1), value: z.string() })).min(1),
      },
    },
    handle(async ({ workspaceId, variables }) => {
      const resolved = await resolveWorkspaceId(ctx, workspaceId);
      // The API's `add` inserts, so replace any existing variable of the same
      // name by removing it in the same call.
      const names = new Set(variables.map(v => v.name));
      const remove = (await listVars(resolved)).filter(v => names.has(v.name)).map(v => v.id);
      await graphql(
        ctx,
        `mutation ($workspaceId: String!, $input: SetEnvironmentVariablesInput!) {
          setEnvironmentVariables(workspaceId: $workspaceId, input: $input) { id }
        }`,
        { workspaceId: resolved, input: { add: variables, remove } },
      );
      return { workspaceId: resolved, set: [...names] };
    }),
  );

  server.registerTool(
    'delete_env_var',
    {
      description: 'Delete an environment variable by name',
      inputSchema: { workspaceId, name: z.string().min(1), confirm },
    },
    handle(async ({ workspaceId, name }) => {
      const resolved = await resolveWorkspaceId(ctx, workspaceId);
      const match = (await listVars(resolved)).find(v => v.name === name);
      if (!match) throw new Error(`No environment variable named ${name}`);
      await graphql(
        ctx,
        `mutation ($workspaceId: String!, $variableId: String!) {
          deleteEnvironmentVariable(workspaceId: $workspaceId, variableId: $variableId)
        }`,
        { workspaceId: resolved, variableId: match.id },
      );
      return { deleted: name };
    }),
  );

  server.registerTool(
    'get_environment_status',
    { description: 'Get the status of the workspace\'s Python environment', inputSchema: { workspaceId } },
    handle(async ({ workspaceId }) => {
      const resolved = await resolveWorkspaceId(ctx, workspaceId);
      const data = await graphql<{ environmentStatus: string }>(
        ctx,
        `query ($workspaceId: String!) { environmentStatus(workspaceId: $workspaceId) }`,
        { workspaceId: resolved },
      );
      return { workspaceId: resolved, status: data.environmentStatus };
    }),
  );

  server.registerTool(
    'restart_environment',
    {
      description:
        'Restart the workspace\'s Python environment. Running code is interrupted and in-memory state is lost',
      inputSchema: { workspaceId },
    },
    handle(async ({ workspaceId }) => {
      const resolved = await resolveWorkspaceId(ctx, workspaceId);
      const data = await graphql<{ restartEnvironment: { status: string } }>(
        ctx,
        `mutation ($input: RestartEnvironmentInput!) { restartEnvironment(input: $input) { status } }`,
        { input: { workspaceId: resolved } },
      );
      return { workspaceId: resolved, status: data.restartEnvironment.status };
    }),
  );
}
