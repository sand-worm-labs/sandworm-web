"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useSession } from "@/components/Visualization/hooks/useAuth";
import { useCurrentWorkspaceInfo } from "@/components/Visualization/hooks/useWorkspaces";

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

  if (sessionLoading || workspaceLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
          <p className="text-sm text-gray-600">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return null;
}
