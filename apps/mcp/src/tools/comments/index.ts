import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { graphql, resolveWorkspaceId, type ToolContext } from '../../graphql.ts';
import { confirm, errorResult, jsonResult, workspaceId } from '../shared.ts';

type Comment = {
  id: string;
  body: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
};

// The API validates this as a UUID and answers anything else with a bare 422.
const notebookId = z.uuid().describe('ID (UUID) of the notebook, as returned by list_projects or create_notebook');

// Backed by GraphQL: comments, createComment, deleteComment
export function registerCommentTools(server: McpServer, ctx: ToolContext): void {
  server.registerTool(
    'list_comments',
    { description: 'List the comments on a notebook', inputSchema: { notebookId } },
    async ({ notebookId }) => {
      try {
        const data = await graphql<{ comments: Comment[] }>(
          ctx,
          `query ($documentId: String!) { comments(documentId: $documentId) { id body authorId createdAt updatedAt } }`,
          { documentId: notebookId },
        );
        return jsonResult(data.comments);
      } catch (err) {
        return errorResult(err);
      }
    },
  );

  server.registerTool(
    'add_comment',
    {
      description: 'Add a comment to a notebook',
      inputSchema: { notebookId, body: z.string().min(1).describe('Comment text') },
    },
    async ({ notebookId, body }) => {
      try {
        const data = await graphql<{ createComment: Comment }>(
          ctx,
          `mutation ($documentId: String!, $input: CreateCommentInput!) {
            createComment(documentId: $documentId, input: $input) { id body authorId createdAt updatedAt }
          }`,
          { documentId: notebookId, input: { id: crypto.randomUUID(), body } },
        );
        return jsonResult(data.createComment);
      } catch (err) {
        return errorResult(err);
      }
    },
  );

  server.registerTool(
    'delete_comment',
    {
      description: 'Delete a comment (only the comment author can)',
      inputSchema: { notebookId, commentId: z.uuid().describe('ID (UUID) of the comment'), workspaceId, confirm },
    },
    async ({ notebookId, commentId, workspaceId }) => {
      try {
        const ws = await resolveWorkspaceId(ctx, workspaceId);
        const data = await graphql<{ deleteComment: boolean }>(
          ctx,
          `mutation ($input: DeleteCommentInput!) { deleteComment(input: $input) }`,
          { input: { workspaceId: ws, documentId: notebookId, commentId } },
        );
        return jsonResult({ deleted: data.deleteComment, commentId });
      } catch (err) {
        return errorResult(err);
      }
    },
  );
}
