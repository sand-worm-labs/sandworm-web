"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { NetworkStatus } from "@apollo/client";

import { useSession, useSignout } from "@/components/Editor/hooks/useAuth";
import { useCurrentWorkspaceInfo } from "@/components/Editor/hooks/useWorkspaces";

export default function WorkspaceRedirectPage() {
  const router = useRouter();
  const signout = useSignout();

  const {
    user,
    loading: sessionLoading,
    isAuthenticated,
  } = useSession({
    redirectToLogin: true,
  });

  const {
    workspaceInfo,
    isLoading: workspaceLoading,
    error,
    networkStatus,
  } = useCurrentWorkspaceInfo(sessionLoading || !isAuthenticated || !user);

  console.log(
    "[workspace] sessionLoading:",
    sessionLoading,
    "| isAuthenticated:",
    isAuthenticated,
    "| user:",
    user?.id ?? null
  );
  console.log(
    "[workspace] skip:",
    sessionLoading || !isAuthenticated || !user,
    "| workspaceLoading:",
    workspaceLoading,
    "| workspaceInfo:",
    workspaceInfo ?? null,
    "| networkStatus:",
    networkStatus,
    "| error:",
    error?.message ?? null
  );

  useEffect(() => {
    // @hack this is too much code that shouldn't exist and too much condition, this is claude fault need to test this
    if (sessionLoading || workspaceLoading) return;
    if (!isAuthenticated) return;
    const queryDone =
      networkStatus === NetworkStatus.ready ||
      networkStatus === NetworkStatus.error;

    if (!queryDone) return;

    if (workspaceInfo?.id) {
      router.replace(`/workspace/${workspaceInfo.id}`);
      return;
    }

    if (error) {
      console.error(
        "[workspace] session invalid, forcing signout:",
        error.message
      );
      signout();
      return;
    }

    // Authenticated, query completed successfully, no error, but no workspace
    console.warn(
      "[workspace] no workspace found, no error — redirecting to signin"
    );
    window.location.href = "/signin?error=no-workspace";
  }, [
    workspaceInfo,
    sessionLoading,
    workspaceLoading,
    isAuthenticated,
    networkStatus,
    error,
    router,
    signout,
  ]);

  return (
    <div className="loader-container h-screen">
      <div className="bar-loader" />
    </div>
  );
}
