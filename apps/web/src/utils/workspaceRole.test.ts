import { describe, expect, it } from "vitest";
import { getWorkspaceRole, workspaceRoleFlags } from "./workspaceRole";

const roles = [{ "ws-1": "admin" as const }, { "ws-2": "viewer" as const }];

describe("getWorkspaceRole", () => {
  it("reads the role for the given workspace", () => {
    expect(getWorkspaceRole(roles, "ws-1")).toBe("admin");
    expect(getWorkspaceRole(roles, "ws-2")).toBe("viewer");
  });

  it("is undefined for an unknown workspace or missing data", () => {
    expect(getWorkspaceRole(roles, "ws-3")).toBeUndefined();
    expect(getWorkspaceRole(undefined, "ws-1")).toBeUndefined();
    expect(getWorkspaceRole(roles, undefined)).toBeUndefined();
  });
});

describe("workspaceRoleFlags", () => {
  it("derives the flags from the role", () => {
    expect(workspaceRoleFlags(roles, "ws-1")).toMatchObject({ isAdmin: true, canEdit: true, isViewer: false });
    expect(workspaceRoleFlags(roles, "ws-2")).toMatchObject({ isAdmin: false, canEdit: false, isViewer: true });
    expect(workspaceRoleFlags(roles, "ws-3")).toMatchObject({ role: undefined, canEdit: false });
  });
});
