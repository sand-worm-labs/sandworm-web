"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useSession } from "@/components/Editor/hooks/useAuth";
import { useCurrentWorkspaceInfo } from "@/components/Editor/hooks/useWorkspaces";

export default function WorkspaceRedirectPage() {
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession({
    redirectToLogin: true,
  });
  const { workspaceInfo, isLoading: workspaceLoading } =
    useCurrentWorkspaceInfo();
  // which of the user workspace does this return?
  //  how does this handle a workspace user has no access to?

  useEffect(() => {
    if (sessionLoading || workspaceLoading) return;
    if (!user) return;

    if (workspaceInfo) {
      router.replace(`/workspace/${workspaceInfo.id}`);
    } else {
      // we need to handle edge case where user has no workspace. also need to handle workspace permissions later
      router.replace("/workspace/new");
    }
  }, [workspaceInfo, sessionLoading, workspaceLoading, user, router]);

  return (
    <div className="loader-container h-screen">
      <div className="bar-loader" />
    </div>
  );
}
