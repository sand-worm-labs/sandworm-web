import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { confirm, id, notImplemented, workspaceId } from './shared.ts';

export function registerFileTools(server: McpServer): void {
  server.registerTool(
    'upload_file',
    {
      description: 'Upload a file (e.g. CSV) to a workspace so analyses can use it',
      inputSchema: {
        workspaceId,
        fileName: z.string(),
        contentBase64: z.string().describe('File contents, base64-encoded'),
        mimeType: z.string().optional(),
      },
    },
    async () => notImplemented('upload_file'),
  );

  server.registerTool(
    'list_files',
    { description: 'List files uploaded to a workspace', inputSchema: { workspaceId } },
    async () => notImplemented('list_files'),
  );

  server.registerTool(
    'delete_file',
    { description: 'Delete an uploaded file', inputSchema: { fileId: id, confirm } },
    async () => notImplemented('delete_file'),
  );
}
