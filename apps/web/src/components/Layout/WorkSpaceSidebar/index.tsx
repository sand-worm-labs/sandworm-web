"use client";

import { Home, Search, Clock, Bot, Terminal } from "lucide-react";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import { usePathname, useRouter } from "next/navigation";
import { LuLayoutGrid } from "react-icons/lu";

import { AccountDropdown } from "@/components/AccountDropdown";
import DocumentTree from "@/components/Visualization/blocks/DocumentsTree";
import { useStringQuery } from "@/components/Visualization/hooks/useQueryArgs";
import { useCallback } from "react";
import { useDataSources } from "@/components/Visualization/hooks/useDataSources";
import { PlusSmallIcon } from "@heroicons/react/24/outline";
import { useFavorites } from "@/components/Visualization/hooks/useFavorites";
import { useDocumentsLocal as useDocuments } from "@/components/Visualization/hooks/useDocumentsLocal";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const mockUser = {
  createdAt: "2025-10-21T14:03:41.471Z",
  email: "dqzxu2gbs@mozmail.com",
  id: "405498a2-f3cb-4307-bd1e-4daf5b3a1dba",
  lastVisitedWorkspaceId: "405498a2-f3cb-4307-bd1e-4daf5b3a1dba",
  name: "Si Cy",
  picture: null,
  roles: {
    "405498a2-f3cb-4307-bd1e-4daf5b3a1dba": "admin",
  },
  updatedAt: "2025-11-07T21:32:32.536Z",
};

export const WorkspaceSidebar = () => {
  const pathname = usePathname();
  const workspaceId = pathname.split("/")[2] ?? "";

  //note: we replace this with useworkspace hook once ready
  /*   const workspaceId = pathname.split("/")[2] ?? "";
   */
  const mainNav: NavItem[] = [
    { name: "Home", href: `/workspace/${workspaceId}`, icon: Home },
    {
      name: "Sessions",
      href: `/workspace/${workspaceId}/session`,
      icon: Clock,
    },
    {
      name: "Explore",
      href: `/workspace/${workspaceId}/explore`,
      icon: Search,
    },
  ];

  const toolsNav: NavItem[] = [
    {
      name: "Ask a question",
      href: `/workspace/${workspaceId}/documents/notebook`,
      icon: Bot,
    },
    {
      name: "Console",
      href: `/workspace/${workspaceId}/console`,
      icon: Terminal,
    },
    {
      name: "All tools",
      href: `/workspace/${workspaceId}/tools`,
      icon: LuLayoutGrid,
    },
  ];

  const linkClasses = (href: string) =>
    `flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors
     ${
       pathname === href
         ? "bg-white dark:bg-[#181C21] shadow-[0_0.5px_4px_#2516660A] text-black dark:text-white "
         : "text-gray-600 dark:text-white hover:bg-[#ffffff] dark:hover:bg-[#181C21] hover:text-black dark:hover:text-white"
     }`;

  const router = useRouter();
  const documentId = useStringQuery("documentId");

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

  const [favorites, { favoriteDocument, unfavoriteDocument }] =
    useFavorites(workspaceId);

  const documents = documentsState.documents.filter(
    doc => doc.deletedAt === null && doc.version > 1
  );

  const onCreateDocument = useCallback(
    async (parentId: string | null) => {
      if (documentsState.loading) {
        console.log("blocked because loading = true");
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
    (documentId: string) => {
      if (documentsState.loading) {
        return;
      }

      favoriteDocument(documentId);
    },
    [documentsState, workspaceId, favoriteDocument]
  );

  const onUnfavoriteDocument = useCallback(
    (documentId: string) => {
      if (documentsState.loading) {
        return;
      }

      unfavoriteDocument(documentId);
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
    <aside className="w-[220px] h-full flex flex-col justify-between dark:bg-[#0C1015] bg-[#F1F3F4] border-r dark:border-[#262A30] border-[#E9ECEF]">
      <div>
        <div className="px-4 py-4" />

        <nav className="flex-1 px-3">
          {/* MAIN NAV */}
          <ul className="space-y-1">
            {mainNav.map(item => (
              <li key={item.name}>
                <Link href={item.href} className={linkClasses(item.href)}>
                  <item.icon
                    strokeWidth={1.8}
                    className={`h-4 w-4 text-[#1C3B5A] dark:text-[#868E96]`}
                  />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

          <hr className="border-t-[1px] border-[#E6E0F1] dark:border-[#262A30] mt-4" />

          {/* TOOLS NAV */}
          <ul className="space-y-1 mt-4">
            {toolsNav.map(item => (
              <li key={item.name}>
                <Link href={item.href} className={linkClasses(item.href)}>
                  <item.icon
                    strokeWidth={1.8}
                    className={`h-4 w-4 text-[#1C3B5A] dark:text-[#868E96]`}
                  />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

          <ul>
            {mockUser.roles[workspaceId] !== "viewer" && (
              <button
                id="create-workspace-doc"
                onClick={onCreateDocumentHandler}
                className="p-1 hover:text-ceramic-500 hover:bg-ceramic-100/70 rounded-md hover:cursor-pointer"
              >
                <PlusSmallIcon className="h-4 w-4 " aria-hidden="true" />
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
              role={mockUser.roles[workspaceId] ?? "viewer"}
              onCreate={onCreateDocument}
              onUpdateParent={onUpdateDocumentParent}
            />
          </ul>
        </nav>
      </div>

      <AccountDropdown />
    </aside>
  );
};
