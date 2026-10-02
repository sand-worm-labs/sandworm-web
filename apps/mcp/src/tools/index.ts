import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { ToolContext } from '../graphql.ts';
import { registerCommentTools } from './comments/index.ts';
import { registerDataSourceTools } from './data-sources/index.ts';
import { registerEnvironmentTools } from './environment/index.ts';
import { registerFileTools } from './files/index.ts';
import { registerNotebookTools } from './notebooks/index.ts';
import { registerProjectTools } from './projects/index.ts';
import { registerWorkspaceTools } from './workspaces/index.ts';

// Tools that are implemented take `ctx` to call the API as the signed-in user;
// the rest are still stubs.
export function registerTools(server: McpServer, ctx: ToolContext): void {
  registerWorkspaceTools(server, ctx);
  registerProjectTools(server, ctx);
  registerNotebookTools(server, ctx);
  registerCommentTools(server, ctx);
  registerDataSourceTools(server, ctx);
  registerEnvironmentTools(server, ctx);
  registerFileTools(server, ctx);
}
