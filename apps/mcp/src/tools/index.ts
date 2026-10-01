import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { AuthContext } from '../auth.ts';
import { registerCommentTools } from './comments.ts';
import { registerDataSourceTools } from './data-sources.ts';
import { registerEnvironmentTools } from './environment.ts';
import { registerFileTools } from './files.ts';
import { registerNotebookTools } from './notebooks.ts';
import { registerProjectTools } from './projects.ts';
import { registerWorkspaceTools } from './workspaces.ts';

// `_auth` is the signed-in user; tools will use `_auth.token` to call the API as them.
export function registerTools(server: McpServer, _auth: AuthContext): void {
  registerWorkspaceTools(server);
  registerProjectTools(server);
  registerNotebookTools(server);
  registerCommentTools(server);
  registerDataSourceTools(server);
  registerEnvironmentTools(server);
  registerFileTools(server);
}
