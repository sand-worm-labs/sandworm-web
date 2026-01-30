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

  return (
    <div className="items-center justify-center flex fixed top-0 bottom-0 w-full left-0 z-10 h-screen">
      <div className="loader">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className={`square sq${i + 1}`} />
        ))}
      </div>
    </div>
  );
}
