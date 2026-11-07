import { graphql, type ToolContext } from '../graphql.ts';

// The sidebar (apps/web DocumentsTree.tsx) shows two levels: a notebook at the
// top and the notebooks inside it. It refuses to nest deeper and hides anything
// that is, and the API checks neither, so the tools hold the same line.
export type TreeDoc = {
  id: string;
  title: string;
  parentId: string | null;
  orderIndex: number;
};

type TreeRow = TreeDoc & { deletedAt: string | null };

export async function fetchTree(ctx: ToolContext, workspaceId: string): Promise<TreeDoc[]> {
  const data = await graphql<{ getWorkspaceDocuments: TreeRow[] }>(
    ctx,
    `query ($workspaceId: String!) {
      getWorkspaceDocuments(workspaceId: $workspaceId) { id title parentId orderIndex deletedAt }
    }`,
    { workspaceId },
  );
  return data.getWorkspaceDocuments.filter(d => !d.deletedAt);
}

const named = (doc: TreeDoc) => `"${doc.title || 'Untitled'}"`;

// Throws, in words an agent can act on, unless `moving` (or a notebook yet to
// be created, when omitted) may sit inside `parentId`. Because only a top-level
// notebook can be a parent and only a childless one can move in, a notebook can
// never end up inside itself or one of its own descendants.
export function assertCanNestUnder(docs: TreeDoc[], parentId: string, moving?: TreeDoc): void {
  const parent = docs.find(d => d.id === parentId);
  if (!parent) {
    throw new Error(`No notebook ${parentId} in this workspace to nest under. list_projects shows the IDs.`);
  }
  if (moving?.id === parent.id) throw new Error(`${named(parent)} cannot be nested inside itself.`);
  if (parent.parentId !== null) {
    throw new Error(
      `${named(parent)} is already inside another notebook, and notebooks nest one level deep. ` +
        'Pick a top-level notebook (parentId null in list_projects), or move this one to the top level first.',
    );
  }
  if (moving) {
    const inside = docs.filter(d => d.parentId === moving.id).length;
    if (inside > 0) {
      throw new Error(
        `${named(moving)} holds ${inside} notebook${inside === 1 ? '' : 's'} of its own, which nesting it would put two levels deep, where the sidebar hides them. ` +
          'Move those out first, or pick another place.',
      );
    }
  }
}
