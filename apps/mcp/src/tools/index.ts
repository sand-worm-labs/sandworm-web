import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { registerCommentTools } from './comments.ts';
import { registerDataSourceTools } from './data-sources.ts';
import { registerEnvironmentTools } from './environment.ts';
import { registerFileTools } from './files.ts';
import { registerNotebookTools } from './notebooks.ts';
import { registerProjectTools } from './projects.ts';
import { registerWorkspaceTools } from './workspaces.ts';

export function registerTools(server: McpServer): void {
  registerWorkspaceTools(server);
  registerProjectTools(server);
  registerNotebookTools(server);
  registerCommentTools(server);
  registerDataSourceTools(server);
  registerEnvironmentTools(server);
  registerFileTools(server);
}
