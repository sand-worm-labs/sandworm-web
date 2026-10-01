import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { id, notImplemented } from './shared.ts';

// Backed by GraphQL: comments, createComment, deleteComment
export function registerCommentTools(server: McpServer): void {
  server.registerTool(
    'list_comments',
    { description: 'List the comments on a notebook', inputSchema: { notebookId: id } },
    async () => notImplemented('list_comments'),
  );

  server.registerTool(
    'add_comment',
    {
      description: 'Add a comment to a notebook',
      inputSchema: { notebookId: id, body: z.string().describe('Comment text') },
    },
    async () => notImplemented('add_comment'),
  );

  server.registerTool(
    'delete_comment',
    {
      description: 'Delete a comment (only the comment author can)',
      inputSchema: { notebookId: id, commentId: id },
    },
    async () => notImplemented('delete_comment'),
  );
}
