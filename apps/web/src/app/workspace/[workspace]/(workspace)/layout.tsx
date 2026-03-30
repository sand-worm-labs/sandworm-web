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
  const { loading: sessionLoading } = useSession({ redirectToLogin: true });
  const { workspaceInfo } = useCurrentWorkspaceInfo();

  const pathname = usePathname();
  const workspaceId = workspaceInfo?.id ?? "";

  const { requestRoleUpgrade } = useRequestRoleUpgrade(workspaceId);

  // TODO: Replace with polling or WebSocket event to detect approval.
  // Currently status resets to "viewing" on refresh — no persistence yet.
  const [accessStatus, setAccessStatus] = useState<
    "viewing" | "sent" | "pending" | "approved"
  >("viewing");

  const shouldHideHeader =
    pathname.includes("/documents/") &&
    (pathname.endsWith("/edit") || pathname.includes("/notebook"));

  console.log(workspaceInfo, "workspace");
  const isViewer = workspaceInfo?.role === "viewer";

  const handleRequestAccess = async () => {
    await requestRoleUpgrade("editor");
    setAccessStatus("sent");
    // TODO: Poll getUserWorkspaceInfo or listen to WebSocket to transition
    // from "sent" -> "pending" -> "approved" when admin acts on the request.
  };

  if (sessionLoading) {
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
