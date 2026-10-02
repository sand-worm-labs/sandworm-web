import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { ToolContext } from '../../graphql.ts';
import { registerCellTools } from './cells.ts';
import { registerCreateNotebookTool } from './create.ts';
import { registerNotebookManageTools } from './manage.ts';
import { registerNotebookStubs } from './stubs.ts';

export function registerNotebookTools(server: McpServer, ctx: ToolContext): void {
  registerCreateNotebookTool(server, ctx);
  registerNotebookManageTools(server, ctx);
  registerCellTools(server, ctx);
  registerNotebookStubs(server);
}
