"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { WorkspaceSidebar } from "@/components/Layout/WorkSpaceSidebar";
import { AppHeader } from "@/components/Layout/AppHeader";
import { useSession } from "@/components/Editor/hooks/useAuth";
import {
  useRequestRoleUpgrade,
  useCurrentWorkspaceInfo,
} from "@/components/Editor/hooks/useWorkspaces";
import { ViewerAccessBar } from "@/components/ViewerAccessBar";
import { Loader } from "@/components/Loader";
import MobileWarning from "@/components/Editor/blocks/MobileWarning";
import useSideBar, {
  SideBarProvider,
} from "@/components/Editor/hooks/useSideBar";
import { useIsMobile } from "@/hooks/useMobile";

// =====================================
// ⬢ Types
// =====================================
interface WorkspaceLayoutProps {
  children: ReactNode;
}

// ⬢ Auto-Collapse Guard
// =====================================
function AutoCollapseOnNotebook() {
  const pathname = usePathname();
  const { api } = useSideBar();
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    const prev = prevPathRef.current;
    const wasDocument = prev.includes("/documents/");
    const isDocument = pathname.includes("/documents/");

    if (!wasDocument && isDocument) {
      api.close();
    }

    prevPathRef.current = pathname;
  }, [pathname, api]);

  return null;
}

function WorkspaceLayoutInner({ children }: WorkspaceLayoutProps) {
  const { loading: sessionLoading, isAuthenticated } = useSession({
    redirectToLogin: true,
  });
  const isMobile = useIsMobile();

  const { workspaceInfo, isLoading: workspaceLoading } =
    useCurrentWorkspaceInfo(sessionLoading || !isAuthenticated);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const workspaceId = workspaceInfo?.id ?? "";

  // Set by a "share link" copied with the "Share links without sidebar"
  // page setting on — a presentational gate only, never persisted, so it
  // doesn't clobber the viewer's own sidebar preference in localStorage.
  const shouldHideSidebar = searchParams.get("sidebar") === "hidden";

  const { requestRoleUpgrade } = useRequestRoleUpgrade(workspaceId);

  const [accessStatus, setAccessStatus] = useState<
    "viewing" | "sent" | "pending" | "approved"
  >("viewing");

  const shouldHideHeader = pathname.includes("/documents/");

  const isViewer = workspaceInfo?.role === "viewer";

  const handleRequestAccess = async () => {
    await requestRoleUpgrade("editor");
    setAccessStatus("sent");
  };

  if (sessionLoading || workspaceLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-base-100">
      <AutoCollapseOnNotebook />
      <MobileWarning />
      {!shouldHideSidebar &&
        (isMobile ? (
          <div className="w-0 overflow-visible flex-none">
            <WorkspaceSidebar />
          </div>
        ) : (
          <WorkspaceSidebar />
        ))}
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

// =====================================
// ⬢ Workspace Layout
// =====================================
export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  return (
    <SideBarProvider>
      <WorkspaceLayoutInner>{children}</WorkspaceLayoutInner>
    </SideBarProvider>
  );
}
