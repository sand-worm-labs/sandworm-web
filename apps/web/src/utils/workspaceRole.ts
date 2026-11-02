import type { UserWorkspaceRole } from "@/types";

// The session lists roles as [{ [workspaceId]: role }, ...]. Read it here, not
// inline, so a change to that shape is one edit.
type RoleList = Array<Record<string, UserWorkspaceRole>> | undefined | null;

export type WorkspaceRoleFlags = {
  role: UserWorkspaceRole | undefined;
  isAdmin: boolean;
  isEditor: boolean;
  isViewer: boolean;
  // Admins and editors can change the workspace; viewers only read it.
  canEdit: boolean;
};

export function getWorkspaceRole(
  roles: RoleList,
  workspaceId: string | undefined | null
): UserWorkspaceRole | undefined {
  if (!roles || !workspaceId) return undefined;
  return roles.find(entry => workspaceId in entry)?.[workspaceId];
}

export function workspaceRoleFlags(
  roles: RoleList,
  workspaceId: string | undefined | null
): WorkspaceRoleFlags {
  const role = getWorkspaceRole(roles, workspaceId);
  return {
    role,
    isAdmin: role === "admin",
    isEditor: role === "editor",
    isViewer: role === "viewer",
    canEdit: role === "admin" || role === "editor",
  };
}
