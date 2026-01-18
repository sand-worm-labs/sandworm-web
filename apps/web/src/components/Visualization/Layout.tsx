import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDoubleRightIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";


import NotebookPanel from "../Layout/NotebookPanel";

import { useStringQuery } from "./hooks/useQueryArgs";
import useSideBar from "./hooks/useSideBar";
import type { Page } from "./blocks/PagePath";
import MobileWarning from "./blocks/MobileWarning";
import CommandPalette from "./blocks/commandPalette";
import { FeaturesDialog } from "./blocks/SubscriptionBadge";
import PagePath from "./blocks/PagePath";
import DragLayer from "./blocks/DragLayer";

interface Props {
  children: React.ReactNode;
  pagePath?: Page[];
  topBarClassname?: string;
  topBarContent?: React.ReactNode;
  sidebarContent?: React.ReactNode;
  onToggleChat?: () => void;
}

export default function Layout({
  children,
  pagePath,
  topBarClassname,
  topBarContent,
  sidebarContent,
  onToggleChat,
}: Props) {
  const [isSearchOpen, setSearchOpen] = useState(false);
  useHotkeys(["mod+k"], () => {
    setSearchOpen(prev => !prev);
  });

  const {
    state: { isOpen: isSideBarOpen },
    api: sideBarApi,
  } = useSideBar();

  const toggleSideBar = useCallback(
    (state: boolean) => {
      return () => sideBarApi.toggle(state);
    },
    [sideBarApi.toggle]
  );

  const pathname = usePathname();

  const workspaceId = useStringQuery("workspace");

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

    // Run when route changes (pathname updates)
    return () => {
      saveScroll();
    };
  }, [pathname, workspaceId]);

  // Restore scroll position when returning to this route
  useEffect(() => {
    const scroll = localStorage.getItem(`scroll-${workspaceId}`);
    if (scroll && scrollRef.current) {
      scrollRef.current.scrollTop = parseInt(scroll, 10);
    }
  }, [workspaceId]);

  const [isUpgradeDialogOpen, setUpgradeDialogOpen] = useState(false);

  return (
    <div className="flex w-full h-full overflow-hidden relative">
      <MobileWarning />

      <DragLayer />

      <CommandPalette
        workspaceId={workspaceId}
        isOpen={isSearchOpen}
        setOpen={setSearchOpen}
      />

      <FeaturesDialog
        open={isUpgradeDialogOpen}
        setOpen={setUpgradeDialogOpen}
        currentPlan="open-source"
      />

      <main
        className="flex flex-col h-screen flex-1 overflow-hidden relative"
        style={{
          transition: "flex 0.2s ease-in-out",
        }}
      >
        <div
          className={clsx(
            isSideBarOpen ? "px-8" : "pr-8",
            "shrink-0 w-full h-12 border-b b-1 border-gray-200 dark:border-[#262A30] flex justify-between",
            topBarClassname
          )}
        >
          <div className="flex w-full">
            <button
              type="button"
              className={clsx(
                isSideBarOpen ? "hidden" : "mr-8",
                "relative h-12 w-12 border-b border-gray-200 bg-ceramic-50 text-gray-500 dark:text-[#868E96] cursor-pointer hover:bg-ceramic-100 flex-shrink-0"
              )}
              onClick={toggleSideBar(true)}
            >
              <ChevronDoubleRightIcon className="w-5 h-5 absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2" />
            </button>
            {pagePath && <PagePath pages={pagePath} />}
            {topBarContent}
          </div>
             <div className="h-full flex-grow flex overflow-hidden">
              {children}
            </div>
          <NotebookPanel
            sidebarContent={sidebarContent}
            onToggleChat={onToggleChat}
          />
        </div>
      </main>
    </div>
  );
}
