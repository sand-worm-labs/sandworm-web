import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { confirm, id, notImplemented, workspaceId } from './shared.ts';

// Backed by GraphQL: environmentVariables, setEnvironmentVariables,
// deleteEnvironmentVariable, environmentStatus, restartEnvironment.
// Write-only on purpose: there is no list tool, because values are plain text
// secrets and an agent must not be able to read them back.
// Variables are workspace-wide and are exposed to notebook code at run time.
export function registerEnvironmentTools(server: McpServer): void {
  server.registerTool(
    'set_env_vars',
    {
      description: 'Add or update environment variables in a workspace',
      inputSchema: {
        workspaceId,
        variables: z.array(z.object({ name: z.string(), value: z.string() })),
      },
    },
    async () => notImplemented('set_env_vars'),
  );

  server.registerTool(
    'delete_env_var',
    { description: 'Delete an environment variable', inputSchema: { workspaceId, variableId: id, confirm } },
    async () => notImplemented('delete_env_var'),
  );

  server.registerTool(
    'get_environment_status',
    { description: 'Get the status of the workspace\'s Python environment', inputSchema: { workspaceId } },
    async () => notImplemented('get_environment_status'),
  );

  server.registerTool(
    'restart_environment',
    { description: 'Restart the workspace\'s Python environment', inputSchema: { workspaceId } },
    async () => notImplemented('restart_environment'),
  );
}
