import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { ToolContext } from '../../graphql.ts';
import { registerCellTools } from './cells.ts';
import { registerCreateNotebookTool } from './create.ts';
import { registerNotebookManageTools } from './manage.ts';
import { registerPlanTool } from './plan.ts';
import { registerReplyTool } from './reply.ts';
import { registerRunTools } from './run.ts';
import { registerNotebookSearchTools } from './search.ts';
import { registerToolSearchTool } from './tools.ts';

export function registerNotebookTools(server: McpServer, ctx: ToolContext): void {
  registerNotebookSearchTools(server, ctx);
  registerCreateNotebookTool(server, ctx);
  registerPlanTool(server, ctx);
  registerToolSearchTool(server, ctx);
  registerNotebookManageTools(server, ctx);
  registerCellTools(server, ctx);
  registerRunTools(server, ctx);
  if (ctx.logToolCalls) registerReplyTool(server, ctx);
}
