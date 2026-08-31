"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  PiPlus,
  PiStarLight,
  PiStarFill,
  PiDotsThreeLight,
  PiUserLight,
  PiFloppyDiskLight,
  PiArrowSquareOutLight,
  PiCopyLight,
  PiTrashLight,
  PiFolderLight,
  PiBookmarkSimpleLight,
} from "react-icons/pi";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { iconButtonSmClassName } from "@/styles/interactive";
import { useFavorites } from "@/components/Editor/hooks/useFavorites";
import { useSession } from "@/components/Editor/hooks/useAuth";

import { UploadIcon } from "../Assets/UploadIcon";
import { useDocuments } from "../Editor/hooks/useDocuments";
import { useStringQuery } from "../Editor/hooks/useQueryArgs";

import ProjectControl from "./ProjectControls";
import { ProjectsPageSkeleton } from "./ProjectsSkeleton";
import { ProjectsTable } from "./ProjectTable";
import {
  useProjectFilter,
  type FilterOption,
  type SortOption,
} from "./useProjectFilter";

interface Project {
  id: string;
  title: string;
  creator: string;
  lastEdited: string;
  created: string;
  isFavorite: boolean;
}

type MenuAction = "duplicate" | "newTab" | "trash";

function formatDate(dateString: string | Date): string {
  if (!dateString) return "Unknown";

  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInHours < 24) {
    if (diffInHours < 1) return "Just now";
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  }
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// =====================================
// ⬢ Projects
// =====================================
interface ProjectsProps {
  variant?: "all" | "favorites";
}

export const Projects: React.FC<ProjectsProps> = ({ variant = "all" }) => {
  const isFavorites = variant === "favorites";
  const workspaceId = useStringQuery("workspace");
  const router = useRouter();
  const { user } = useSession({});

  const [activeView, setActiveView] = useState<"grid" | "table">(() => {
    if (typeof window === "undefined") return "grid";
    const saved = localStorage.getItem("sandworm:projects:view");
    return saved === "table" ? "table" : "grid";
  });

  const [
    documentsState,
    { createDocument, duplicateDocument, deleteDocument },
  ] = useDocuments(workspaceId);

  const [favorites, { favoriteDocument, unfavoriteDocument }] =
    useFavorites(workspaceId);

  const [searchValue, setSearchValue] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterOption>(
    isFavorites ? "Favorites" : "All"
  );
  const [activeSort, setActiveSort] = useState<SortOption>("Last Modified");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);
  const [hoveredSave, setHoveredSave] = useState<string | null>(null);

  // ⬢ Create Document
  // =====================================
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

  const onCreateDocumentHandler: React.MouseEventHandler<HTMLButtonElement> =
    useCallback(
      e => {
        e.preventDefault();
        onCreateDocument(null);
      },
      [onCreateDocument]
    );

  // ⬢ Filter + Sort + Search
  // =====================================
  const { docs, allCount } = useProjectFilter({
    documents: documentsState.documents,
    favorites,
    currentUserId: user?.id,
    activeFilter,
    activeSort,
    searchValue,
  });

  // ⬢ Normalise to Project[]
  // =====================================
  const projects: Project[] = useMemo(
    () =>
      docs.map(doc => ({
        id: doc.id,
        title: doc.title || "Untitled Project",
        creator: doc.createdBy || "Unknown",
        lastEdited: formatDate(doc.updatedAt),
        created: formatDate(doc.createdAt),
        isFavorite: favorites.has(doc.id),
      })),
    [docs, favorites]
  );

  const toggleFavorite = (id: string): void => {
    if (favorites.has(id)) {
      unfavoriteDocument(id);
    } else {
      favoriteDocument(id);
    }
  };

  const handleMenuAction = (action: MenuAction, projectId: string): void => {
    setOpenMenuId(null);

    if (action === "trash") {
      deleteDocument(projectId);
    } else if (action === "duplicate") {
      duplicateDocument(projectId);
    } else if (action === "newTab") {
      window.open(`/workspace/${workspaceId}/documents/${projectId}`, "_blank");
    }
  };

  if (documentsState.loading) {
    return <ProjectsPageSkeleton />;
  }

  // ⬢ Empty Project State
  // =====================================
  if (allCount === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-page-surface p-8">
        <div className="text-center flex items-center flex-col">
          <UploadIcon />
          <h2 className="text-2xl font-medium text-ink-100 font-body mb-2 mt-3">
            No projects yet
          </h2>
          <p className="text-ink-300 dark:text-ink-400 mb-1 font-body">
            Create your first project to get started
          </p>
          <button
            type="button"
            onClick={onCreateDocumentHandler}
            className="py-2 px-6 bg-base-200 dark:bg-create-project-tint/[0.16] rounded-xl hover:cursor-pointer text-sm border mt-6 flex  items-center w-full border-[#D000FF] dark:border-border-tertiary text-primary dark:text-white mb-3 font-body font-medium gap-2 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.04),0px_4px_4px_-2px_rgba(0,0,0,0.02)] dark:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.12)]"
          >
            <PiPlus className="mr-3 h-4 w-4" />
            <span>Create Project</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-surface p-8">
      <div className="flex justify-between w-full container mx-auto">
        <div className="flex items-center gap-3 mb-0">
          <span className="rounded-full flex items-center justify-center">
            {isFavorites ? (
              <PiBookmarkSimpleLight className="w-6 h-6 text-primary" />
            ) : (
              <UploadIcon />
            )}
          </span>
          <h2 className="text-xl font-medium">
            {isFavorites ? "Saved Projects" : "Projects"}
          </h2>
        </div>
        {!isFavorites && (
          <div>
            <button
              type="button"
              className="py-2 px-6 bg-primary/5 dark:bg-create-project-tint/[0.16] rounded-xl hover:cursor-pointer text-sm border mt-6 flex  items-center w-full border-[#D000FF] dark:border-border-tertiary text-primary dark:text-white mb-3 font-body font-medium gap-2 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.04),0px_4px_4px_-2px_rgba(0,0,0,0.02)] dark:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.12)]"
              onClick={onCreateDocumentHandler}
            >
              <PiPlus className=" h-4 w-4" />
              <span className="inline-block"> Create Project</span>
            </button>
          </div>
        )}
      </div>

      <div className="mx-auto container">
        <ProjectControl
          onViewChange={view => {
            setActiveView(view);
            localStorage.setItem("sandworm:projects:view", view);
          }}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          hideFilter={isFavorites}
        />

        {activeView === "grid" ? (
          projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <PiFolderLight
                size={36}
                className="text-ink-200 dark:text-ink-600"
              />
              <p className="text-sm font-medium text-ink-200 dark:text-ink-400">
                {searchValue
                  ? `No projects matching "${searchValue}"`
                  : isFavorites
                    ? "No favorite projects yet"
                    : `No ${activeFilter === "All" ? "" : `${activeFilter.toLowerCase()} `}projects found`}
              </p>
              <p className="text-xs text-ink-300 dark:text-ink-500">
                {isFavorites && !searchValue
                  ? "Star a project to see it here."
                  : "Try adjusting or clearing your filters to see all Projects."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(project => (
                <div
                  key={project.id}
                  className="bg-page-surface rounded-3xl border border-border-tertiary transition-all duration-200 p-4 py-3 relative group flex flex-col hover:shadow-[0_1px_3px_rgba(208,0,255,0.08)]"
                >
                  <div className="flex items-start justify-between mb-4">
                    <Link
                      href={`/workspace/${workspaceId}/documents/${project.id}`}
                      className="text-[0.9rem] font-medium text-ink-100 dark:text-white flex-1 pr-2 after:absolute after:inset-0 after:rounded-3xl focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-primary"
                    >
                      {project.title}
                    </Link>

                    <div className="flex items-center gap-2 relative z-[1]">
                      <button
                        type="button"
                        onClick={() => toggleFavorite(project.id)}
                        className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                          project.isFavorite ? "opacity-100" : ""
                        }`}
                      >
                        {project.isFavorite ? (
                          <PiStarFill className="w-4 h-4 text-primary" />
                        ) : (
                          <PiStarLight className="w-4 h-4 text-ink-400 dark:text-placeholder-muted hover:text-primary" />
                        )}
                      </button>

                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId === project.id ? null : project.id
                            )
                          }
                          className="p-1 rounded transition-colors"
                        >
                          <PiDotsThreeLight className="w-4 h-4 text-ink-200 dark:text-placeholder-muted" />
                        </button>

                        {openMenuId === project.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dropdown-bg rounded-xl shadow-lg border border-border-tertiary dark:border-border-tertiary pb-1  text-ink-200 dark:text-white z-[99]">
                            <button
                              type="button"
                              onClick={() =>
                                handleMenuAction("duplicate", project.id)
                              }
                              className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-primary/20 dark:hover:bg-dropdown-hover"
                            >
                              <PiCopyLight className="w-3.5 h-3.5 dark:text-placeholder-muted" />
                              Duplicate
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleMenuAction("newTab", project.id)
                              }
                              className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-primary/20 dark:hover:bg-dropdown-hover"
                            >
                              <PiArrowSquareOutLight className="w-3.5 h-3.5 dark:text-placeholder-muted" />
                              Open in new tab
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleMenuAction("trash", project.id)
                              }
                              className="w-full px-4 py-2 text-left text-sm hover:bg-primary/20 dark:hover:bg-dropdown-hover flex items-center gap-2"
                            >
                              <PiTrashLight className="w-3.5 h-3.5 dark:text-placeholder-muted" />
                              Move to trash
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-page-surface rounded-lg h-10 mb-4 flex items-center justify-center" />

                  <div className="flex items-center justify-between mt-auto relative z-[1]">
                    <div className="relative">
                      <button
                        type="button"
                        onMouseEnter={() => setHoveredUser(project.id)}
                        onMouseLeave={() => setHoveredUser(null)}
                        className={iconButtonSmClassName}
                      >
                        <PiUserLight className="w-4 h-4 dark:text-placeholder-muted" />
                      </button>

                      {hoveredUser === project.id && (
                        <div className="absolute bottom-full left-0 mb-2 px-3 py-1 dark:bg-base-100 bg-white text-ink-400 border-border-secondary dark:border-border-tertiary border dark:text-white text-xs rounded shadow-[0_0.5px_4px_#2516660A] whitespace-nowrap z-20">
                          Creator: {project.creator}
                        </div>
                      )}
                    </div>

                    <div>
                      <button
                        type="button"
                        onMouseEnter={() => setHoveredSave(project.id)}
                        onMouseLeave={() => setHoveredSave(null)}
                        className={iconButtonSmClassName}
                      >
                        <PiFloppyDiskLight className="w-4 h-4 dark:text-placeholder-muted" />
                      </button>

                      {hoveredSave === project.id && (
                        <div className="absolute bottom-full right-0 mb-2 px-4 py-1.5 dark:bg-base-100 bg-white text-ink-500 border-border-secondary dark:border-border-tertiary border dark:text-white text-xs rounded shadow-[0_0.5px_4px_#2516660A] whitespace-nowrap z-20">
                          <div className="space-y-1">
                            <div>
                              <span className="font-medium text-ink-400 dark:text-white">
                                Creator:
                              </span>{" "}
                              {project.creator}
                            </div>
                            <div>
                              <span className="font-medium text-ink-400 dark:text-white">
                                Last edited:
                              </span>{" "}
                              {project.lastEdited}
                            </div>
                            <div>
                              <span className="font-medium text-ink-400 dark:text-white">
                                Created:
                              </span>{" "}
                              {project.created}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <ProjectsTable
            projects={projects}
            workspaceId={workspaceId}
            onToggleFavorite={toggleFavorite}
            onMenuAction={handleMenuAction}
            searchQuery={searchValue}
          />
        )}
      </div>
    </div>
  );
};
