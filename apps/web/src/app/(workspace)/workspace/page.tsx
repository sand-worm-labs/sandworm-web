"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useSession } from "@/components/Visualization/hooks/useAuth";

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
  if (!workspaces || workspaces.length === 0) {
    return {
      id: "405498a2-f3cb-4307-bd1e-4daf5b3a1dba",
      name: "default-workspace",
      ownerId: user.id,
    };
  }

  return (
    (user.lastVisitedWorkspaceId &&
      workspaces.find(w => w.id === user.lastVisitedWorkspaceId)) ??
    workspaces.find(w => w.ownerId === user.id) ??
    workspaces[0]
  );
}

export default function WorkspaceRedirectPage() {
  const router = useRouter();
  const session = useSession({ redirectToLogin: true });

  const user = useMemo(() => {
    if (!session.user) return null;

    return {
      ...session.user,
      lastVisitedWorkspaceId: session.user.lastVisitedWorkspaceId ?? null,
    };
  }, [session.user]);

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
    if (session.loading) return;
    if (workspaces.isLoading) return;
    if (!user) return;

    if (workspace) {
      router.replace(`/workspace/${workspace.name}`);
    }
  }, [workspace, session.loading, workspaces.isLoading, user, router]);

  return null;
}
