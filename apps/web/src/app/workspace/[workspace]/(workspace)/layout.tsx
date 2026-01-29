"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { WorkspaceSidebar } from "@/components/Layout/WorkSpaceSidebar";
import { AppHeader } from "@/components/Layout/AppHeader";

interface WorkspaceLayoutProps {
  children: ReactNode;
}

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const pathname = usePathname();

  const shouldHideHeader =
    pathname.includes("/documents/") &&
    (pathname.endsWith("/edit") || pathname.includes("/notebook"));

  return (
    <div className="flex h-screen w-full bg-background">
      <WorkspaceSidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        {!shouldHideHeader && <AppHeader />}

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
