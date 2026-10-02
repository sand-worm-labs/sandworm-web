import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { ToolContext } from '../graphql.ts';
import { registerCommentTools } from './comments.ts';
import { registerDataSourceTools } from './data-sources.ts';
import { registerEnvironmentTools } from './environment.ts';
import { registerFileTools } from './files.ts';
import { registerNotebookTools } from './notebooks.ts';
import { registerProjectTools } from './projects.ts';
import { registerWorkspaceTools } from './workspaces.ts';

// Tools that are implemented take `ctx` to call the API as the signed-in user;
// the rest are still stubs.
export function registerTools(server: McpServer, ctx: ToolContext): void {
  registerWorkspaceTools(server, ctx);
  registerProjectTools(server, ctx);
  registerNotebookTools(server, ctx);
  registerCommentTools(server);
  registerDataSourceTools(server);
  registerEnvironmentTools(server);
  registerFileTools(server);
}
