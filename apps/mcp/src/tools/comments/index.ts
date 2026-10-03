import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { graphql, resolveWorkspaceId, type ToolContext } from '../../graphql.ts';
import { notebookId } from '../notebooks/shared.ts';
import { confirm, handle, workspaceId } from '../shared.ts';

type Comment = {
  id: string;
  body: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
};

export function registerCommentTools(server: McpServer, ctx: ToolContext): void {
  server.registerTool(
    'list_comments',
    { description: 'List the comments on a notebook', inputSchema: { notebookId } },
    handle(async ({ notebookId }) => {
      const data = await graphql<{ comments: Comment[] }>(
        ctx,
        `query ($documentId: String!) { comments(documentId: $documentId) { id body authorId createdAt updatedAt } }`,
        { documentId: notebookId },
      );
      return data.comments;
    }),
  );

  server.registerTool(
    'add_comment',
    {
      description: 'Add a comment to a notebook',
      inputSchema: { notebookId, body: z.string().min(1).describe('Comment text') },
    },
    handle(async ({ notebookId, body }) => {
      const data = await graphql<{ createComment: Comment }>(
        ctx,
        `mutation ($documentId: String!, $input: CreateCommentInput!) {
          createComment(documentId: $documentId, input: $input) { id body authorId createdAt updatedAt }
        }`,
        { documentId: notebookId, input: { id: crypto.randomUUID(), body } },
      );
      return data.createComment;
    }),
  );

  server.registerTool(
    'delete_comment',
    {
      description: 'Delete a comment (only the comment author can)',
      inputSchema: { notebookId, commentId: z.uuid().describe('ID (UUID) of the comment'), workspaceId, confirm },
    },
    handle(async ({ notebookId, commentId, workspaceId }) => {
      const ws = await resolveWorkspaceId(ctx, workspaceId);
      const data = await graphql<{ deleteComment: boolean }>(
        ctx,
        `mutation ($input: DeleteCommentInput!) { deleteComment(input: $input) }`,
        { input: { workspaceId: ws, documentId: notebookId, commentId } },
      );
      return { deleted: data.deleteComment, commentId };
    }),
  );
}
