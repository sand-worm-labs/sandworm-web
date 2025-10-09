import type { ReactNode } from "react";

import { WorkspaceSidebar } from "@/components/Layout/WorkSpaceSidebar";

interface WorkspaceLayoutProps {
  children: ReactNode;
}

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  return (
    <div className="flex h-screen">
      <WorkspaceSidebar />

      <main className="flex-1 overflow-y-auto dark:bg-background  p-6">
        {children}
      </main>
    </div>
  );
}
