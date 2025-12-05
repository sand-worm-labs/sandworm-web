import { v4 as uuidv4 } from "uuid";
import { useCallback, useEffect, useRef, useMemo, useState } from "react";
import { ChevronDoubleRightIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useRouter, usePathname } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@sandworm/ui/components/resizable";

import type { UserWorkspaceRole } from "@/types";

import { MiniChat } from "../Chats/MiniChat";

import { useStringQuery } from "./hooks/useQueryArgs";
import useSideBar from "./hooks/useSideBar";
import { useDataSources } from "./hooks/useDataSources";
import type { SessionUser } from "./hooks/useAuth";
import type { Page } from "./blocks/PagePath";
import { useDocuments } from "./hooks/useDocuments";
import MobileWarning from "./blocks/MobileWarning";
import CommandPalette from "./blocks/commandPalette";
import { FeaturesDialog } from "./blocks/SubscriptionBadge";
import PagePath from "./blocks/PagePath";
import DragLayer from "./blocks/DragLayer";
import { useFavorites } from "./hooks/useFavorites";

type ConfigItem = {
  id: string;
  name: string;
  href: string;
  icon: React.ComponentType<React.ComponentProps<any>>;
  hidden?: boolean;
  allowedRoles: Set<UserWorkspaceRole>;
  openInNewTab: boolean;
};

interface Props {
  children: React.ReactNode;
  pagePath?: Page[];
  topBarClassname?: string;
  topBarContent?: React.ReactNode;
  hideOnboarding?: boolean;
  user: SessionUser;
  hideChat?: boolean;
}

export default function Layout({
  children,
  pagePath,
  topBarClassname,
  topBarContent,
  user,
  hideOnboarding,
  hideChat,
}: Props) {
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  useHotkeys(["mod+k"], () => {
    setSearchOpen(prev => !prev);
  });

  const {
    state: { isOpen: isSideBarOpen, width: sideBarWidth },
    api: sideBarApi,
  } = useSideBar();

  const toggleSideBar = useCallback(
    (state: boolean) => {
      return () => sideBarApi.toggle(state);
    },
    [sideBarApi.toggle]
  );

  const router = useRouter();
  const pathname = usePathname();

  const workspaceId = useStringQuery("workspace");
  const documentId = useStringQuery("document");

  const [{ datasources: allDataSources, isLoading: isLoadingDataSources }] =
    useDataSources(workspaceId);
  const userDataSources = allDataSources.filter(ds => !ds.config.data.isDemo);
  const hasUserDataSource = !isLoadingDataSources && userDataSources.size > 0;

  const [
    documentsState,
    {
      createDocument,
      duplicateDocument,
      setIcon,
      deleteDocument,
      updateParent: updateDocumentParent,
    },
  ] = useDocuments(workspaceId);

  const documents = documentsState.documents.filter(
    doc => doc.deletedAt === null && doc.version > 1
  );

  const [favorites, { favoriteDocument, unfavoriteDocument }] =
    useFavorites(workspaceId);

  const favoriteDocuments = useMemo(
    () => documents.filter(d => favorites.has(d.id)),
    [documents]
  );

  const onCreateDocument = useCallback(
    async (parentId: string | null) => {
      if (documentsState.loading) {
        return;
      }

      const id = uuidv4();
      try {
        await createDocument({ id, parentId, version: 2 });
        router.push(`/workspace/${workspaceId}/documents/${id}`);
      } catch (err) {
        console.error(err);
      }
    },
    [documentsState, createDocument, router, workspaceId]
  );

  const showConfigItem = useCallback(
    (item: ConfigItem) => {
      if (item.hidden) {
        return false;
      }

      const role = user.roles[workspaceId];
      if (!role) {
        return false;
      }

      return item.allowedRoles.has(role);
    },
    [user, workspaceId]
  );

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
      scrollRef.current.scrollTop = parseInt(scroll);
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
            {/* Original expand sidebar button (visible when sidebar is closed) */}
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
        </div>
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel
            className="overflow-auto"
            defaultSize={isChatOpen ? 70 : 100}
            minSize={40}
            maxSize={100}
          >
            <div className="h-full flex-grow flex overflow-hidden">
              {children}
            </div>
          </ResizablePanel>
          {!hideChat && isChatOpen && (
            <>
              <ResizableHandle withHandle />

              <ResizablePanel
                className="overflow-auto"
                defaultSize={30}
                minSize={0}
                maxSize={60}
                collapsible
              >
                <MiniChat onClose={() => setIsChatOpen(false)} />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </main>
    </div>
  );
}
