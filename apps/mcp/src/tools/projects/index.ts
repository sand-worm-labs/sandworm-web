import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { graphql, resolveWorkspaceId, type ToolContext } from '../../graphql.ts';
import { handle, workspaceId } from '../shared.ts';

type Document = {
  id: string;
  title: string;
  parentId: string | null;
  orderIndex: number;
  description: string | null;
  visibility: string;
  publishedAt: string | null;
  updatedAt: string;
  deletedAt: string | null;
};

export type ProjectNode = {
  id: string;
  title: string;
  parentId: string | null;
  description: string | null;
  visibility: string;
  published: boolean;
  updatedAt: string;
  children: ProjectNode[];
};

// Nests the workspace's live notebooks the way the sidebar shows them. A
// notebook whose parent is gone (or trashed) is shown at the top level, so
// nothing drops out of the list.
export function buildProjectTree(documents: Document[]): ProjectNode[] {
  const live = documents.filter(d => !d.deletedAt);
  const nodes = new Map<string, ProjectNode & { orderIndex: number }>();
  for (const d of live) {
    nodes.set(d.id, {
      id: d.id,
      title: d.title,
      parentId: d.parentId,
      description: d.description,
      visibility: d.visibility,
      published: d.publishedAt !== null,
      updatedAt: d.updatedAt,
      orderIndex: d.orderIndex,
      children: [],
    });
  }

  // Older rows were saved before the API refused cycles: a notebook whose
  // parent chain leads back to itself goes to the top level instead.
  const inCycle = (id: string) => {
    const seen = new Set<string>();
    for (let at = nodes.get(id)?.parentId; at && nodes.has(at); at = nodes.get(at)!.parentId) {
      if (at === id) return true;
      if (seen.has(at)) return false;
      seen.add(at);
    }
    return false;
  };

  const roots: (ProjectNode & { orderIndex: number })[] = [];
  for (const node of nodes.values()) {
    const parent = node.parentId ? nodes.get(node.parentId) : undefined;
    if (parent && !inCycle(node.id)) parent.children.push(node);
    else roots.push(node);
  }

  const strip = (list: (ProjectNode & { orderIndex: number })[]): ProjectNode[] =>
    list
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map(({ orderIndex: _, children, ...rest }) => ({
        ...rest,
        children: strip(children as (ProjectNode & { orderIndex: number })[]),
      }));
  return strip(roots);
}

// A "project" is a notebook in the workspace (the API calls it a document).
export function registerProjectTools(server: McpServer, ctx: ToolContext): void {
  server.registerTool(
    'list_projects',
    {
      description:
        'List projects (notebooks) in a workspace as a tree, in sidebar order. Notebooks can be nested under other notebooks: ' +
        'each one lists the notebooks nested under it in children',
      inputSchema: { workspaceId },
    },
    handle(async ({ workspaceId }) => {
      const resolvedWorkspaceId = await resolveWorkspaceId(ctx, workspaceId);
      const data = await graphql<{ getWorkspaceDocuments: Document[] }>(
        ctx,
        `query ($workspaceId: String!) {
          getWorkspaceDocuments(workspaceId: $workspaceId) {
            id title parentId orderIndex description visibility publishedAt updatedAt deletedAt
          }
        }`,
        { workspaceId: resolvedWorkspaceId },
      );
      return buildProjectTree(data.getWorkspaceDocuments);
    }),
  );
}
