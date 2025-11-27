"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

const dummyUser = {
  id: "user_123",
  lastVisitedWorkspaceId: "2",
};

const dummyWorkspaces = [
  {
    id: "1",
    name: "405498a2-f3cb-4307-bd1e-4daf5b3a1dba",
    ownerId: "user_123",
  },
  {
    id: "2",
    name: "405498a2-f3cb-4307-bd1e-4daf5b3a1dbb",
    ownerId: "user_999",
  },
];

export function getUserRedirectWorkspace(
  workspaces: { id: string; name: string; ownerId: string }[],
  user: { id: string; lastVisitedWorkspaceId: string | null }
) {
  return (
    workspaces.find(w => w.id === user.lastVisitedWorkspaceId) ??
    workspaces.find(w => w.ownerId === user.id) ??
    workspaces[0]
  );
}

export default function WorkspaceRedirectPage() {
  const router = useRouter();

  const user = dummyUser;
  const workspaces = {
    data: dummyWorkspaces,
    isLoading: false,
  };

  const workspace = useMemo(() => {
    if (!workspaces.isLoading && user) {
      return getUserRedirectWorkspace(workspaces.data, user);
    }
    return null;
  }, [workspaces.isLoading, workspaces.data, user]);

  useEffect(() => {
    if (workspaces.isLoading) return;

    if (workspace) {
      router.replace(`/workspace/${workspace.name}`);
    }
  }, [workspace, workspaces.isLoading, router]);

  if (!workspaces.isLoading && !workspace) {
    return (
      <h4>You do not have access to any workspaces. Contact your admin.</h4>
    );
  }

  return null;
}
