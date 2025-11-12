import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import type { ReactNode } from "react";

import { WorkspaceSidebar } from "@/components/Layout/WorkSpaceSidebar";

interface WorkspaceLayoutProps {
  children: ReactNode;
}

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  return (
    <div className="flex h-screen">
      <WorkspaceSidebar />

      <main className="flex-1 overflow-y-auto bg-background ">{children}</main>
    </div>
  );
}
