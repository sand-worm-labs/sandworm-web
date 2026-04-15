"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { WorkspaceSidebar } from "@/components/Layout/WorkSpaceSidebar";
import { AppHeader } from "@/components/Layout/AppHeader";
import { useSession } from "@/components/Editor/hooks/useAuth";
import {
  useRequestRoleUpgrade,
  useCurrentWorkspaceInfo,
} from "@/components/Editor/hooks/useWorkspaces";
import { ViewerAccessBar } from "@/components/ViewerAccessBar";
import { Loader } from "@/components/Loader";

interface WorkspaceLayoutProps {
  children: ReactNode;
}

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const { loading: sessionLoading, isAuthenticated } = useSession({
    redirectToLogin: true,
  });

  const { workspaceInfo, isLoading: workspaceLoading } =
    useCurrentWorkspaceInfo(sessionLoading || !isAuthenticated);

  const pathname = usePathname();
  const workspaceId = workspaceInfo?.id ?? "";

  const { requestRoleUpgrade } = useRequestRoleUpgrade(workspaceId);

  const [accessStatus, setAccessStatus] = useState<
    "viewing" | "sent" | "pending" | "approved"
  >("viewing");

  const shouldHideHeader =
    pathname.includes("/documents/") &&
    (pathname.endsWith("/edit") || pathname.includes("/notebook"));

  const isViewer = workspaceInfo?.role === "viewer";

  const handleRequestAccess = async () => {
    await requestRoleUpgrade("editor");
    setAccessStatus("sent");
  };

  // Gate everything — don't render children until both session AND workspace resolve
  if (sessionLoading || workspaceLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-base-100">
      <WorkspaceSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        {!shouldHideHeader && <AppHeader />}
        <main className="flex-1 overflow-y-auto bg-base-100">{children}</main>
      </div>
      {isViewer && (
        <ViewerAccessBar
          status={accessStatus}
          onRequestAccess={handleRequestAccess}
        />
      )}
    </div>
  );
}
