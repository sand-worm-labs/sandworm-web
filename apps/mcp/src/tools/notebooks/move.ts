import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { graphql, resolveWorkspaceId, type ToolContext } from '../../graphql.ts';
import { handle, workspaceId } from '../shared.ts';
import { assertCanNestUnder, fetchTree, type TreeDoc } from '../tree.ts';
import { notebookId, notebookUrl } from './shared.ts';

type Moved = { id: string; title: string; workspaceId: string; parentId: string | null; orderIndex: number };

// The slot after the last sibling, as the sidebar computes it when a notebook is dropped into a folder.
const lastIndex = (docs: TreeDoc[], parentId: string | null, movingId: string) =>
  Math.max(-1, ...docs.filter(d => d.parentId === parentId && d.id !== movingId).map(d => d.orderIndex)) + 1;

export function registerMoveNotebookTool(server: McpServer, ctx: ToolContext): void {
  server.registerTool(
    'move_notebook',
    {
      description:
        'Move a notebook into another top-level notebook (which then works as its folder), back to the top level, or to the start or end of the place it already is. ' +
        'Notebooks nest one level deep: the destination must be a top-level notebook, and a notebook that holds others cannot be moved inside one. ' +
        'Only the place changes, never the content. list_projects shows each notebook\'s parentId and orderIndex',
      inputSchema: {
        notebookId,
        workspaceId,
        parentId: z
          .uuid()
          .nullable()
          .optional()
          .describe('ID of the top-level notebook to move it into, or null for the top level. Leave out to keep its current place and only reorder'),
        position: z
          .enum(['first', 'last'])
          .optional()
          .describe('Where among the notebooks at the destination. Defaults to last when it moves to a new place; leave out to keep its order if it stays where it is'),
      },
    },
    handle(async ({ notebookId, workspaceId, parentId, position }) => {
      if (parentId === undefined && position === undefined) {
        throw new Error('Say where to move it: parentId (a notebook to move it into, or null for the top level), position (first or last), or both.');
      }
      const ws = await resolveWorkspaceId(ctx, workspaceId);
      const docs = await fetchTree(ctx, ws);
      const moving = docs.find(d => d.id === notebookId);
      if (!moving) throw new Error(`No notebook ${notebookId} in this workspace. list_projects shows the IDs.`);

      const target = parentId === undefined ? moving.parentId : parentId;
      const staysPut = target === moving.parentId;
      if (!staysPut && target !== null) assertCanNestUnder(docs, target, moving);

      const place = (parent: string | null, orderIndex: number, moved: boolean) => ({
        notebookId,
        workspaceId: ws,
        title: moving.title,
        moved,
        parentId: parent,
        parentTitle: docs.find(d => d.id === parent)?.title ?? null,
        orderIndex,
        url: notebookUrl(ctx, ws, notebookId),
      });
      if (staysPut && position === undefined) return place(moving.parentId, moving.orderIndex, false);

      const orderIndex = position === 'first' ? 0 : lastIndex(docs, target, notebookId);
      const data = await graphql<{ updateDocument: Moved }>(
        ctx,
        `mutation ($documentId: String!, $workspaceId: String!, $input: UpdateDocumentInput!) {
          updateDocument(documentId: $documentId, workspaceId: $workspaceId, input: $input) {
            id title workspaceId parentId orderIndex
          }
        }`,
        { documentId: notebookId, workspaceId: ws, input: { parentId: target, orderIndex } },
      );
      return place(data.updateDocument.parentId, data.updateDocument.orderIndex, true);
    }),
  );
}
