"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import type { MouseEventHandler } from "react";
import {
  PiPlus,
  PiCaretRight,
  PiCaretDown,
  PiHouse,
  PiBinoculars,
  PiStar,
  PiTerminal,
  PiSquaresFour,
  PiTrash,
  PiToolbox,
} from "react-icons/pi";

import { AccountDropdown } from "@/components/AccountDropdown";
import DocumentTree from "@/components/Editor/blocks/DocumentsTree";
import { useStringQuery } from "@/components/Editor/hooks/useQueryArgs";
import { Shimmer } from "@/components/Skeletons";
import { SandwormLogo } from "@/components/Assets";
import { SidebarIcon } from "@/components/Assets/SidebarIcon";
import { useDocuments } from "@/components/Editor/hooks/useDocuments";
import { useFavorites } from "@/components/Editor/hooks/useFavorites";
import { useSession } from "@/components/Editor/hooks/useAuth";
import WorkspaceSwitcher from "@/components/WorkspaceSwitcher";
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
// ⬢ WorkspaceSidebar
// =====================================
export const WorkspaceSidebar = () => {
  const pathname = usePathname();
  const workspaceId = useStringQuery("workspace");
  const router = useRouter();
  const documentId = useStringQuery("document");
  const session = useSession({ redirectToLogin: true });
  const user = session?.user;
  const isMobile = useIsMobile();

  const [favorites, { favoriteDocument, unfavoriteDocument }] =
    useFavorites(workspaceId);

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSectionOpen, setIsSectionOpen] = useState(true);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const {
    state: { isOpen },
    api: sideBarApi,
  } = useSideBar();
  const collapsed = !isOpen;

  const mainNav: NavItem[] = [
    { name: "Home", href: `/workspace/${workspaceId}`, icon: PiHouse },
    {
      name: "Projects",
      href: `/workspace/${workspaceId}/session`,
      icon: PiToolbox,
    },
    {
      name: "Explore",
      href: `/workspace/${workspaceId}/explore`,
      icon: PiBinoculars,
    },
  ];

  const toolsNav: NavItem[] = [
    {
      name: "Favorites",
      href: `/workspace/${workspaceId}/favorites`,
      icon: PiStar,
    },
    {
      name: "Console",
      href: `/workspace/${workspaceId}/console`,
      icon: PiTerminal,
    },
    {
      name: "All tools",
      href: `/workspace/${workspaceId}/tools`,
      icon: PiSquaresFour,
    },
    { name: "Trash", href: `/workspace/${workspaceId}/trash`, icon: PiTrash },
  ];

  const linkClasses = (href: string) =>
    `flex items-center ${collapsed ? "justify-center" : "justify-start"} gap-3
     rounded-xl px-2 py-1.5 text-sm font-medium transition-colors
     ${
       pathname === href
         ? "bg-base-600 text-primary dark:bg-base-600 dark:text-ink-100"
         : "text-menu-ink dark:text-white hover:bg-base-600 dark:hover:bg-base-600 hover:text-black dark:hover:text-white"
     }`;

  const iconClass = (href: string) =>
    `flex-shrink-0 transition-colors ${
      pathname === href ? "text-[#A308F0] dark:text-ink-100" : "text-ink-icon"
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

  const documents = documentsState.documents
    .filter(doc => doc.deletedAt === null && doc.version >= 1)
    .map(doc => ({ ...doc, isFavorite: favorites.has(doc.id) }));

  const handleToggle = useCallback(() => {
    if (isMobile) setIsMobileOpen(false);
    else sideBarApi.toggle();
  }, [isMobile, sideBarApi]);

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

  const onDeleteDocument = useCallback(
    (id: string) => {
      if (!documentsState.loading) deleteDocument(id);
    },
    [documentsState, deleteDocument]
  );

  const onDuplicateDocument = useCallback(
    async (id: string) => {
      if (documentsState.loading) return;
      const doc = await duplicateDocument(id);
      sideBarApi.close();
      router.push(`/workspace/${workspaceId}/documents/${doc.id}`);
    },
    [documentsState, duplicateDocument, router, workspaceId, sideBarApi]
  );

  const onFavoriteDocument = useCallback(
    (docId: string) => {
      if (!documentsState.loading) favoriteDocument(docId);
    },
    [documentsState, workspaceId, favoriteDocument]
  );

  const onUnfavoriteDocument = useCallback(
    (docId: string) => {
      if (!documentsState.loading) unfavoriteDocument(docId);
    },
    [workspaceId, unfavoriteDocument]
  );

  const onUpdateDocumentParent = useCallback(
    async (id: string, parentId: string | null, orderIndex: number) => {
      if (!documentsState.loading)
        await updateDocumentParent(id, parentId, orderIndex);
    },
    [documentsState, updateDocumentParent]
  );

  const onBeforeNavigate = useCallback(() => {
    if (!pathname.includes("/documents/")) sideBarApi.close();
  }, [pathname, sideBarApi]);

  const userRole =
    user?.role?.find(r => r[workspaceId])?.[workspaceId] ?? "viewer";

  const isEditor = userRole !== "viewer";

  console.log("editor?", user?.role?.[0]?.[workspaceId], user?.role);

  return (
    <>
      <aside
        className={`
          bg-[#FEFFFF] dark:bg-base-500
          border-r border-border-secondary dark:border-border-tertiary
          font-body flex flex-col justify-between
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
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex justify-between py-[0.69rem] px-3 bg-[#F9F9F9] dark:bg-base-500 items-center flex-shrink-0">
            {!collapsed && (
              <Link href="/" className="flex items-center gap-2">
                <SandwormLogo width="30" height="30" />
                <span className="font-bold text-[1.05rem] uppercase font-tertiary">
                  SandWorm
                </span>
              </Link>
            )}
            <TooltipV2<HTMLButtonElement>
              title={collapsed ? "Open sidebar" : "Close sidebar"}
              active
              position="right"
            >
              {ref => (
                <button
                  ref={ref}
                  type="button"
                  aria-label={collapsed ? "Open sidebar" : "Close sidebar"}
                  aria-expanded={!collapsed}
                  onClick={handleToggle}
                  className="p-1 rounded-md hover:bg-[#E8E8E6] dark:hover:bg-[#2A2A28]
                    flex items-center justify-center
                    text-ink-400 dark:text-ink-400 transition-all duration-100"
                >
                  <SidebarIcon />
                </button>
              )}
            </TooltipV2>
          </div>

          <WorkspaceSwitcher collapsed={collapsed} />

          <nav className="flex-1 px-3 overflow-y-auto">
            <ul className="space-y-1 mt-1">
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
                        <item.icon size={18} className={iconClass(item.href)} />
                        {!collapsed && item.name}
                      </Link>
                    )}
                  </TooltipV2>
                </li>
              ))}
            </ul>

            <div className="my-3 h-px bg-[#F1F3F4] dark:bg-[#2A2A28]" />

            <div>
              {!collapsed && (
                <button
                  type="button"
                  onClick={() => setIsToolsOpen(v => !v)}
                  className="w-full flex items-center gap-1 px-1 py-1 mb-1
                    text-[11px] font-medium text-ink-300 dark:text-ink-600
                    hover:text-ink-400 transition-colors font-body"
                >
                  {isToolsOpen ? (
                    <PiCaretDown size={11} />
                  ) : (
                    <PiCaretRight size={11} />
                  )}
                  <span>More</span>
                </button>
              )}

              {(collapsed || isToolsOpen) && (
                <ul className="space-y-1">
                  {toolsNav.map(item => (
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
                              className={iconClass(item.href)}
                            />
                            {!collapsed && item.name}
                          </Link>
                        )}
                      </TooltipV2>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {isEditor && (
              <div className={`mt-3 ${collapsed ? "flex justify-center" : ""}`}>
                <TooltipV2<HTMLButtonElement>
                  title="New Project"
                  active={collapsed}
                  position="right"
                >
                  {ref => (
                    <button
                      ref={ref}
                      type="button"
                      id="create-workspace-doc"
                      onClick={onCreateDocumentHandler}
                      className={`
                        flex items-center justify-center gap-1.5
                        rounded-xl border border-[#D000FF] dark:border-[#A78BFA]
                        text-primary dark:text-[#A78BFA]
                        hover:bg-primary/5 dark:hover:bg-primary/10
                        transition-colors font-body font-medium text-sm
                        ${collapsed ? "w-9 h-9" : "w-full px-4 py-2"}
                      `}
                    >
                      <PiPlus size={16} />
                      {!collapsed && <span>New Project</span>}
                    </button>
                  )}
                </TooltipV2>
              </div>
            )}

            {!collapsed && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setIsSectionOpen(v => !v)}
                  className="w-full flex items-center gap-1 px-1 py-1 mb-1
                    text-[11px] font-medium text-ink-300 dark:text-ink-600
                    hover:text-ink-400 transition-colors font-body"
                >
                  {isSectionOpen ? (
                    <PiCaretDown size={11} />
                  ) : (
                    <PiCaretRight size={11} />
                  )}
                  <span>Recent Projects</span>
                </button>

                {isSectionOpen &&
                  (documentsState.loading ? (
                    <div
                      className="flex flex-col gap-1 mt-1 px-1"
                      aria-busy="true"
                      aria-label="Loading projects"
                    >
                      {(
                        [
                          "w-28",
                          "w-36",
                          "w-24",
                          "w-32",
                        ] as const
                      ).map(w => (
                        <div
                          key={w}
                          className="flex items-center gap-2 px-2 py-1.5"
                        >
                          <Shimmer className="h-2.5 w-2.5 rounded-sm shrink-0" />
                          <Shimmer className={`h-3 ${w}`} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <DocumentTree
                      workspaceId={workspaceId}
                      current={documentId}
                      documents={documents}
                      onDuplicate={onDuplicateDocument}
                      onDelete={onDeleteDocument}
                      onFavorite={onFavoriteDocument}
                      onUnfavorite={onUnfavoriteDocument}
                      role={userRole}
                      onCreate={onCreateDocument}
                      onUpdateParent={onUpdateDocumentParent}
                      onBeforeNavigate={onBeforeNavigate}
                    />
                  ))}
              </div>
            )}
          </nav>
        </div>

        <div
          className={`
          flex-shrink-0 border-t border-border-secondary dark:border-border-tertiary
          bg-[#FEFFFF] dark:bg-base-500
          ${collapsed ? "flex justify-center py-2 px-2" : "py-1.5 px-1.5"}
        `}
        >
          <AccountDropdown
            collapsed={collapsed}
            onToggleFeedback={() => setIsFeedbackOpen(true)}
          />
        </div>
      </aside>

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </>
  );
};
