"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { PlusSmallIcon } from "@heroicons/react/24/outline";
import type { MouseEventHandler } from "react";
import { ChevronRightIcon, ChevronDownIcon } from "lucide-react";

import { AccountDropdown } from "@/components/AccountDropdown";
import DocumentTree from "@/components/Editor/blocks/DocumentsTree";
import { useStringQuery } from "@/components/Editor/hooks/useQueryArgs";
import { SandwormLogo } from "@/components/Assets";
import { SidebarIcon } from "@/components/Assets/SidebarIcon";
import { useDocuments } from "@/components/Editor/hooks/useDocuments";
import { useSession } from "@/components/Editor/hooks/useAuth";
import { ProjectIcon } from "@/components/Assets/Menu/ProjectIcon";
import { Star } from "@/components/Assets/Menu/Star";
import { SquaresFour } from "@/components/Assets/Menu/SquaresFour";
import { House } from "@/components/Assets/Menu/House";
import { Terminal } from "@/components/Assets/Menu/Terminal";
import { Trash } from "@/components/Assets/Trash";
import WorkspaceSwitcher from "@/components/WorkspaceSwitcher";
import { Binoculars } from "@/components/Assets/Menu/Binoculars";
import { useIsMobile } from "@/hooks/useMobile";
import { TooltipV2 } from "@/components/Editor/blocks/ToolTips";
import { FeedbackModal } from "@/components/FeedbackModal";
import useSideBar from "@/components/Editor/hooks/useSideBar";

// =====================================
// ⬢ Types
// =====================================
interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

// =====================================
// ⬢ Workspace Sidebar Main
// =====================================
export const WorkspaceSidebar = () => {
  const pathname = usePathname();
  const workspaceId = useStringQuery("workspace");
  const router = useRouter();
  const documentId = useStringQuery("document");
  const session = useSession({ redirectToLogin: true });
  const user = session?.user;
  const isMobile = useIsMobile();
  const favoriteDocument: any = [];
  const unfavoriteDocument: any = [];

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSectionOpen, setIsSectionOpen] = useState(true);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // ⬢ Shared sidebar state — single source of truth
  // collapsed === !isOpen; no local collapsed state needed
  // =====================================
  const {
    state: { isOpen },
    api: sideBarApi,
  } = useSideBar();
  const collapsed = !isOpen;

  // ⬢ Nav config
  // =====================================
  const mainNav: NavItem[] = [
    { name: " Home", href: `/workspace/${workspaceId}`, icon: House },
    {
      name: "Projects",
      href: `/workspace/${workspaceId}/session`,
      icon: ProjectIcon,
    },
    {
      name: "Explore",
      href: `/workspace/${workspaceId}/explore`,
      icon: Binoculars,
    },
  ];

  const toolsNav: NavItem[] = [
    {
      name: "Favorites",
      href: `/workspace/${workspaceId}/favorites`,
      icon: Star,
    },
    {
      name: "Console",
      href: `/workspace/${workspaceId}/console`,
      icon: Terminal,
    },
    {
      name: "All tools",
      href: `/workspace/${workspaceId}/tools`,
      icon: SquaresFour,
    },
    { name: "Trash", href: `/workspace/${workspaceId}/trash`, icon: Trash },
  ];

  const linkClasses = (href: string) =>
    `flex items-center gap-3 rounded-xl px-2 py-1.5 text-sm font-medium transition-colors
     ${
       pathname === href
         ? "dark:bg-base-600 bg-base-600 text-primary dark:text-ink-100"
         : "text-menu-ink dark:text-white hover:bg-base-600 dark:hover:bg-base-600 hover:text-primary hover:text-black dark:hover:text-white"
     }`;

  const [
    documentsState,
    {
      createDocument,
      duplicateDocument,
      deleteDocument,
      updateParent: updateDocumentParent,
    },
  ] = useDocuments(workspaceId);

  const documents = documentsState.documents.filter(
    doc => doc.deletedAt === null && doc.version >= 1
  );

  // ⬢ Toggle
  // =====================================
  const handleToggle = useCallback(() => {
    if (isMobile) {
      setIsMobileOpen(false);
    } else {
      sideBarApi.toggle();
    }
  }, [isMobile, sideBarApi]);

  // ⬢ Create Document
  // Collapse *before* push so the sidebar is already icons-only on first paint
  // of the notebook page
  // =====================================
  const onCreateDocument = useCallback(
    async (parentId: string | null) => {
      if (documentsState.loading) return;

      try {
        const doc = await createDocument({ parentId, version: 2 });
        sideBarApi.close();
        router.push(`/workspace/${workspaceId}/documents/${doc.id}`);
      } catch (err) {
        console.error(err);
      }
    },
    [documentsState, createDocument, router, workspaceId, sideBarApi]
  );

  const onCreateDocumentHandler: MouseEventHandler<HTMLButtonElement> =
    useCallback(
      e => {
        e.preventDefault();
        onCreateDocument(null);
      },
      [onCreateDocument]
    );

  // ⬢ Delete Document
  // =====================================
  const onDeleteDocument = useCallback(
    (id: string) => {
      if (documentsState.loading) return;
      deleteDocument(id);
    },
    [documentsState, deleteDocument]
  );

  // ⬢ Duplicate Document
  // =====================================
  const onDuplicateDocument = useCallback(
    async (id: string) => {
      if (documentsState.loading) return;

      const doc = await duplicateDocument(id);
      sideBarApi.close();
      router.push(`/workspace/${workspaceId}/documents/${doc.id}`);
    },
    [documentsState, duplicateDocument, router, workspaceId, sideBarApi]
  );

  // ⬢ Favorite / Unfavorite
  // =====================================
  const onFavoriteDocument = useCallback(
    (docId: string) => {
      if (documentsState.loading) return;
      favoriteDocument(docId);
    },
    [documentsState, workspaceId, favoriteDocument]
  );

  const onUnfavoriteDocument = useCallback(
    (docId: string) => {
      if (documentsState.loading) return;
      unfavoriteDocument(docId);
    },
    [workspaceId, unfavoriteDocument]
  );

  // ⬢ Update Document Parent
  // =====================================
  const onUpdateDocumentParent = useCallback(
    async (id: string, parentId: string | null, orderIndex: number) => {
      if (documentsState.loading) return;
      await updateDocumentParent(id, parentId, orderIndex);
    },
    [documentsState, updateDocumentParent]
  );

  const onBeforeNavigate = useCallback(() => {
    if (!pathname.includes("/documents/")) {
      sideBarApi.close();
    }
  }, [pathname, sideBarApi]);

  return (
    <>
      <aside
        className={`
          bg-[#FEFFFF] dark:bg-base-500 border-r border-border-secondary dark:border-border-tertiary
          font-body justify-between flex flex-col
          transition-all duration-300 ease-in-out relative
      
          ${isMobile ? "fixed top-0 left-0 h-full z-50 w-[17.5rem]" : "h-full"}
          ${
            isMobile
              ? isMobileOpen
                ? "translate-x-0"
                : "-translate-x-full border-none"
              : collapsed
                ? "w-16"
                : "w-[17.5rem]"
          }
        `}
      >
        <div>
          {/* ✦ Header ✦ */}
          <div className="flex justify-between py-[0.69rem] px-3 bg-[#F9F9F9] dark:bg-base-500 items-center">
            {!collapsed && (
              <Link href="/" className="flex items-center gap-2">
                <SandwormLogo width="30" height="30" />
                <span className="font-bold text-[1.05rem] uppercase font-tertiary">
                  SandWorm
                </span>
              </Link>
            )}

            <TooltipV2<HTMLButtonElement>
              title={
                isMobile
                  ? "Close sidebar"
                  : collapsed
                    ? "Open sidebar"
                    : "Close sidebar"
              }
              active
              position="right"
            >
              {ref => (
                <button
                  ref={ref}
                  type="button"
                  aria-label={
                    isMobile
                      ? "Close sidebar"
                      : collapsed
                        ? "Open sidebar"
                        : "Close sidebar"
                  }
                  aria-expanded={isMobile ? isMobileOpen : !collapsed}
                  onClick={handleToggle}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-[#181C21] flex items-center justify-center text-[#868E96] dark:text-ink-400"
                >
                  <SidebarIcon />
                </button>
              )}
            </TooltipV2>
          </div>

          <WorkspaceSwitcher collapsed={collapsed} />

          {/* ✦ Nav ✦ */}
          <nav className="flex-1 px-3">
            <ul className="space-y-1.5">
              {mainNav.map(item => (
                <li key={item.name}>
                  <TooltipV2<HTMLAnchorElement>
                    title={item.name.trim()}
                    active={collapsed}
                    position="right"
                  >
                    {ref => (
                      <Link
                        ref={ref}
                        href={item.href}
                        aria-label={item.name.trim()}
                        className={linkClasses(item.href)}
                      >
                        <item.icon
                          size={18}
                          className={`hover:text-[#A308F0] ${
                            pathname === item.href
                              ? "text-[#A308F0] dark:text-ink-100"
                              : "text-ink-icon"
                          }`}
                        />
                        {!collapsed && item.name}
                      </Link>
                    )}
                  </TooltipV2>
                </li>
              ))}
            </ul>

            <hr className="border-t-[1px] border-transparent dark:border-transparent mt-5" />

            {/* ✦ Tools section ✦ */}
            <div>
              <button
                type="button"
                onClick={() => setIsToolsOpen(v => !v)}
                className="w-full flex items-center gap-x-1 px-1 py-1 mb-1 text-[12px] font-medium dark:text-ink-400 text-[#8C98A3] font-body"
              >
                {!collapsed && (
                  <>
                    {isToolsOpen ? (
                      <ChevronDownIcon className="h-4 w-4" />
                    ) : (
                      <ChevronRightIcon className="h-4 w-4" />
                    )}
                    <span>More</span>
                  </>
                )}
              </button>

              {isToolsOpen && (
                <ul className="space-y-1.5 mt-1">
                  {toolsNav.map(item => (
                    <li key={item.name}>
                      <Link href={item.href} className={linkClasses(item.href)}>
                        <item.icon
                          size={18}
                          color={pathname === item.href ? "#A308F0" : "#39414E"}
                        />
                        {!collapsed && item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* ✦ Document tree — hidden when icon-only ✦ */}
            {!collapsed && (
              <ul>
                {user?.role?.[0]?.[workspaceId] !== "viewer" && (
                  <button
                    type="button"
                    id="create-workspace-doc"
                    onClick={onCreateDocumentHandler}
                    className="p-2 dark:bg-base-500 rounded-xl hover:cursor-pointer text-sm border mt-3 flex px-5 items-center justify-center w-full border-[#D000FF] text-primary mb-3 font-body font-medium dark:border-[#A78BFA] dark:text-[#A78BFA]"
                  >
                    <PlusSmallIcon
                      className="h-4 w-4 mr-1"
                      aria-hidden="true"
                    />
                    <span>New Project</span>
                  </button>
                )}

                <div>
                  <button
                    type="button"
                    onClick={() => setIsSectionOpen(v => !v)}
                    className="w-full flex items-center gap-x-1 px-1 py-1 mb-1 text-[12px] font-medium dark:text-ink-400 text-[#8C98A3] font-body"
                  >
                    {isSectionOpen ? (
                      <ChevronDownIcon className="h-4 w-4" />
                    ) : (
                      <ChevronRightIcon className="h-4 w-4" />
                    )}
                    <span>Recent Projects</span>
                  </button>

                  {isSectionOpen && (
                    <DocumentTree
                      workspaceId={workspaceId}
                      current={documentId}
                      documents={documents}
                      onDuplicate={onDuplicateDocument}
                      onDelete={onDeleteDocument}
                      onFavorite={onFavoriteDocument}
                      onUnfavorite={onUnfavoriteDocument}
                      role={user?.role?.[0]?.[workspaceId] ?? "viewer"}
                      onCreate={onCreateDocument}
                      onUpdateParent={onUpdateDocumentParent}
                      onBeforeNavigate={onBeforeNavigate}
                    />
                  )}
                </div>
              </ul>
            )}
          </nav>
        </div>

        {/* ✦ Account footer ✦ */}
        {!collapsed && (
          <div className="absolute bottom-0 left-0 right-0 border-t border-border-secondary dark:border-border-tertiary py-1.5 px-1.5 bg-base-100">
            <AccountDropdown onToggleFeedback={() => setIsFeedbackOpen(true)} />
          </div>
        )}
      </aside>

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </>
  );
};
