import type { ReactNode } from "react";

import { WorkspaceSidebar } from "@/components/Layout/WorkSpaceSidebar";
import { AppHeader } from "@/components/Layout/AppHeader";

interface WorkspaceLayoutProps {
  children: ReactNode;
}

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  return (
    <div className="flex h-screen w-full bg-background">
      <WorkspaceSidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <AppHeader />

        <main className="flex-1 overflow-y-auto ">{children}</main>
      </div>
    </div>
  );
}
