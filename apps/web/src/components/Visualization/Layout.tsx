import {  useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";

import NotebookPanel from "../Layout/NotebookPanel";
import { useStringQuery } from "../Editor/hooks/useQueryArgs";
import useSideBar from "../Editor/hooks/useSideBar";
import type { Page } from "../Editor/blocks/PagePath";
import CommandPalette from "../Editor/blocks/commandPalette";
import PagePath from "../Editor/blocks/PagePath";
import DragLayer from "../Editor/blocks/DragLayer";

interface Props {
  children: React.ReactNode;
  pagePath?: Page[];
  topBarClassname?: string;
  topBarContent?: React.ReactNode;
  sidebarContent?: React.ReactNode;
  onToggleChat?: () => void;
  isViewer?: boolean;
}

// =====================================
// ⬢ Layout
// =====================================
export default function Layout({
  children,
  pagePath,
  topBarClassname,
  topBarContent,
  sidebarContent,
  onToggleChat,
  isViewer,
}: Props) {
  const [isSearchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const workspaceId = useStringQuery("workspace");

  const {
    state: { isOpen: isSideBarOpen },
  } = useSideBar();

  useHotkeys(["mod+k"], () => {
    setSearchOpen(prev => !prev);
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const saveScroll = () => {
      if (scrollRef.current) {
        localStorage.setItem(
          `scroll-${workspaceId}`,
          scrollRef.current.scrollTop.toString()
        );
      }
    };

    return () => {
      saveScroll();
    };
  }, [pathname, workspaceId]);

  useEffect(() => {
    const scroll = localStorage.getItem(`scroll-${workspaceId}`);
    if (scroll && scrollRef.current) {
      scrollRef.current.scrollTop = parseInt(scroll, 10);
    }
  }, [workspaceId]);

  return (
    <div className="flex w-full h-full overflow-hidden relative">
      <DragLayer />

      <CommandPalette
        workspaceId={workspaceId}
        isOpen={isSearchOpen}
        setOpen={setSearchOpen}
      />

      <main
        className="flex flex-col h-screen flex-1 overflow-hidden relative"
        style={{
          transition: "flex 0.2s ease-in-out",
        }}
      >
        {/* ✦ Top Bar ✦ */}
        <div
          className={clsx(
            isSideBarOpen ? "px-8" : "pr-8",
            "shrink-0 w-full h-12 border-b border-border-secondary dark:border-border-tertiary flex justify-between print:hidden",
            topBarClassname
          )}
        >
          <div className="flex w-full items-center px-4 pl-10">
            {pagePath && <PagePath pages={pagePath} />}
            {topBarContent}
          </div>
        </div>

        {/* ✦ Body - Editor and NotebookPanel ✦ */}
        <div className="flex-grow flex overflow-hidden">
          {children}

          {!isViewer && (
            <NotebookPanel
              sidebarContent={sidebarContent}
              onToggleChat={onToggleChat}
            />
          )}
        </div>
      </main>
    </div>
  );
}
