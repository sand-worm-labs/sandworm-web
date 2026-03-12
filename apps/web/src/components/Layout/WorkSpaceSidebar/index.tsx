"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { PlusSmallIcon } from "@heroicons/react/24/outline";
import type { MouseEventHandler } from "react";

import { AccountDropdown } from "@/components/AccountDropdown";
import DocumentTree from "@/components/Visualization/blocks/DocumentsTree";
import { useStringQuery } from "@/components/Visualization/hooks/useQueryArgs";
import { SandwormLogo } from "@/components/Assets";
import { SidebarIcon } from "@/components/Assets/SidebarIcon";
import { useDocuments } from "@/components/Visualization/hooks/useDocuments";
import { useSession } from "@/components/Visualization/hooks/useAuth";
import { ProjectIcon } from "@/components/Assets/Menu/ProjectIcon";
import { MagnifyingGlass } from "@/components/Assets/Menu/MagnifyingGlass";
import { Star } from "@/components/Assets/Menu/Star";
import { SquaresFour } from "@/components/Assets/Menu/SquaresFour";
import { House } from "@/components/Assets/Menu/House";
import { Terminal } from "@/components/Assets/Menu/Terminal";
import { Trash } from "@/components/Assets/Trash";
import WorkspaceSwitcher from "@/components/WorkspaceSwitcher";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

export const WorkspaceSidebar = () => {
  const pathname = usePathname();
  const workspaceId = useStringQuery("workspace");
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const documentId = useStringQuery("document");
  const favoriteDocument: any = [];
  const unfavoriteDocument: any = [];
  const session = useSession({ redirectToLogin: true });
  const user = session?.user;

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
      icon: MagnifyingGlass,
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
    {
      name: "Trash",
      href: `/workspace/${workspaceId}/trash`,
      icon: Trash,
    },
  ];

  const linkClasses = (href: string) =>
    `flex items-center gap-3 rounded-xl px-2 py-1.5 text-sm font-medium transition-colors
     ${
       pathname === href
         ? "dark:bg-base-600 bg-[#EBEBEB]  text-primary dark:text-ink-100"
         : "text-menu-ink dark:text-white hover:bg-[#EBEBEB] dark:hover:bg-base-600 hover:text-primary   hover:text-black dark:hover:text-white"
     }`;

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
    doc => doc.deletedAt === null && doc.version >= 1
  );

  const onCreateDocument = useCallback(
    async (parentId: string | null) => {
      if (documentsState.loading) return;

      try {
        const doc = await createDocument({ parentId, version: 2 });
        router.push(`/workspace/${workspaceId}/documents/${doc.id}`);
      } catch (err) {
        console.error(err);
      }
    },
    [documentsState, createDocument, router, workspaceId]
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
      if (documentsState.loading) {
        return;
      }

      deleteDocument(id);
    },
    [documentsState, deleteDocument]
  );

  const onDuplicateDocument = useCallback(
    async (id: string) => {
      if (documentsState.loading) {
        return;
      }

      const doc = await duplicateDocument(id);
      router.push(`/workspace/${workspaceId}/documents/${doc.id}`);
    },
    [documentsState, duplicateDocument, router, workspaceId]
  );

  const onFavoriteDocument = useCallback(
    (docId: string) => {
      if (documentsState.loading) {
        return;
      }

      favoriteDocument(docId);
    },
    [documentsState, workspaceId, favoriteDocument]
  );

  const onUnfavoriteDocument = useCallback(
    (docId: string) => {
      if (documentsState.loading) {
        return;
      }

      unfavoriteDocument(docId);
    },
    [workspaceId, unfavoriteDocument]
  );

  const onSetIcon = useCallback(
    (id: string, icon: string) => {
      if (documentsState.loading) {
        return;
      }

      setIcon(id, icon);
    },
    [documentsState, setIcon]
  );

  const onUpdateDocumentParent = useCallback(
    async (id: string, parentId: string | null, orderIndex: number) => {
      if (documentsState.loading) {
        return;
      }

      await updateDocumentParent(id, parentId, orderIndex);
    },
    [documentsState, updateDocumentParent]
  );

  return (
    <aside
      className={`h-full flex flex-col justify-between bg-base-500 border-r  border-[#E9ECEF] dark:border-border-tertiary font-body
      transition-all duration-300 ease-in-out
      ${collapsed ? "w-16" : "w-[18rem]"}
      `}
    >
      <div>
        <div className="flex justify-between py-[0.69rem] px-3   bg-[#F9F9F9] dark:bg-base-500 items-center">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2">
              <SandwormLogo width="30" height="30" />

              <span className=" font-bold text-[1.05rem] uppercase font-tertiary">
                SandWorm
              </span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-[#181C21] flex items-center justify-center text-[#868E96] dark:text-ink-400"
          >
            <SidebarIcon />
          </button>
        </div>

        <WorkspaceSwitcher collapsed={collapsed} />

        <div className="px-4 py-2.5" />

        <nav className="flex-1 px-3">
          <ul className="space-y-1.5">
            {mainNav.map(item => (
              <li key={item.name}>
                <Link href={item.href} className={linkClasses(item.href)}>
                  <item.icon
                    size={18}
                    className={`hover:text-[#A308F0] ${pathname === item.href ? "text-[#A308F0]" : "text-ink-icon"}`}
                  />
                  {!collapsed && item.name}
                </Link>
              </li>
            ))}
          </ul>

          <hr className="border-t-[1px] border-[#E6E0F1] dark:border-border-tertiary mt-4" />

          {/* TOOLS NAV */}
          <ul className="space-y-1.5 mt-4">
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

          {!collapsed && (
            <ul>
              {user?.role?.[0]?.[workspaceId] !== "viewer" && (
                <button
                  type="button"
                  id="create-workspace-doc"
                  onClick={onCreateDocumentHandler}
                  className="p-2 bg-[#F7E8FF] dark:bg-base-500  rounded-xl hover:cursor-pointer text-sm border mt-6 flex px-5 items-center justify-center w-full border-[#D000FF]  text-primary mb-3 font-body font-medium  dark:border-[#A78BFA] dark:text-[#A78BFA] "
                >
                  {" "}
                  <PlusSmallIcon className="h-4 w-4 mr-1 " aria-hidden="true" />
                  <span>New Project</span>
                </button>
              )}
              <DocumentTree
                workspaceId={workspaceId}
                current={documentId}
                documents={documents}
                onDuplicate={onDuplicateDocument}
                onDelete={onDeleteDocument}
                onFavorite={onFavoriteDocument}
                onUnfavorite={onUnfavoriteDocument}
                onSetIcon={onSetIcon}
                role={user?.role?.[0]?.[workspaceId] ?? "viewer"}
                onCreate={onCreateDocument}
                onUpdateParent={onUpdateDocumentParent}
              />
            </ul>
          )}
        </nav>
      </div>

      {!collapsed && (
        <div className="px-4 py-4">
          <AccountDropdown />
        </div>
      )}
    </aside>
  );
};
