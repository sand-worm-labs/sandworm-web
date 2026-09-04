"use client";

import React, {
  Fragment,
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
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
import clsx from "clsx";

import { iconButtonSmClassName } from "@/styles/interactive";
import { useFavorites } from "@/components/Editor/hooks/useFavorites";
import { useSession } from "@/components/Editor/hooks/useAuth";
import { StyledCheckbox } from "@/components/StyledCheckbox";
import { formatDate } from "@/lib/date";

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
  creatorImage: string | null;
  lastEdited: string;
  created: string;
  publishedAt: string | null;
  isFavorite: boolean;
}

type MenuAction = "duplicate" | "newTab" | "trash";

// =====================================
// ⬢ Confirm Dialog
// =====================================
interface ConfirmDialogProps {
  isOpen: boolean;
  isBusy: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  busyLabel: string;
  onClose: () => void;
  onConfirm: () => void;
}

function ConfirmDialog({
  isOpen,
  isBusy,
  title,
  message,
  confirmLabel,
  busyLabel,
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 flex items-center justify-center text-ink-100"
        onClose={onClose}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="absolute inset-0 bg-black/30" />
        </TransitionChild>

        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0 scale-95 translate-y-1"
          enterTo="opacity-100 scale-100 translate-y-0"
          leave="ease-in duration-150"
          leaveFrom="opacity-100 scale-100 translate-y-0"
          leaveTo="opacity-0 scale-95 translate-y-1"
        >
          <DialogPanel
            className="relative bg-white dark:bg-dropdown-bg dark:border
            dark:border-border-tertiary rounded-2xl shadow-xl w-full max-w-sm
            mx-4 p-6 font-body"
          >
            <DialogTitle className="text-base font-medium text-ink-100 dark:text-white">
              {title}
            </DialogTitle>
            <p className="text-sm text-ink-300 dark:text-placeholder-muted mt-2">
              {message}
            </p>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={isBusy}
                className="flex-1 py-2.5 rounded-xl border border-border
                  dark:border-border-tertiary text-ink-400 dark:text-ink-400
                  text-sm font-medium hover:bg-inputBg dark:hover:bg-dropdown-hover
                  transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isBusy}
                className="flex-1 py-2.5 rounded-xl text-white text-sm
                  font-medium hover:bg-opacity-90 transition-colors
                  disabled:opacity-50 bg-error"
              >
                {isBusy ? busyLabel : confirmLabel}
              </button>
            </div>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
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

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeletingSelected, setIsDeletingSelected] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const selectAllRef = useRef<HTMLInputElement>(null);

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
        creator: doc.author?.username || "Unknown",
        creatorImage: doc.author?.avater ?? null,
        lastEdited: formatDate(doc.updatedAt),
        created: formatDate(doc.createdAt),
        publishedAt: doc.publishedAt ? formatDate(doc.publishedAt) : null,
        isFavorite: favorites.has(doc.id),
      })),
    [docs, favorites]
  );

  // Drop selected ids that fell out of the list (deleted/filtered elsewhere).
  useEffect(() => {
    const visibleIds = new Set(projects.map(p => p.id));
    setSelectedIds(prev => {
      const next = new Set(Array.from(prev).filter(id => visibleIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [projects]);

  const allSelected =
    projects.length > 0 && selectedIds.size === projects.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const onToggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const onToggleSelectAll = useCallback(() => {
    setSelectedIds(allSelected ? new Set() : new Set(projects.map(p => p.id)));
  }, [allSelected, projects]);

  const onConfirmDeleteSelected = useCallback(async () => {
    setIsDeletingSelected(true);
    try {
      await Promise.allSettled(
        Array.from(selectedIds).map(id => deleteDocument(id))
      );
      setSelectedIds(new Set());
      setConfirmingDelete(false);
    } finally {
      setIsDeletingSelected(false);
    }
  }, [selectedIds, deleteDocument]);

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
            className="py-2 px-6 bg-primary-tint-75 dark:bg-base-700 hover:bg-primary/5 dark:hover:bg-base-600 rounded-xl hover:cursor-pointer text-sm border mt-6 flex  items-center justify-center w-full border-accent-fuchsia dark:border-white/15 text-accent-fuchsia dark:text-white mb-3 font-body font-medium gap-2 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.04),0px_4px_4px_-2px_rgba(0,0,0,0.02)] dark:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.12)]"
          >
            <PiPlus className="mr-2 h-4 w-4" />
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
              className="py-2 px-6 bg-primary-tint-75 dark:bg-base-700 hover:bg-primary/5 dark:hover:bg-base-600 rounded-xl hover:cursor-pointer text-sm border mt-6 flex  items-center w-full border-accent-fuchsia dark:border-white/15 text-accent-fuchsia dark:text-white mb-3 font-body font-medium gap-2 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.04),0px_4px_4px_-2px_rgba(0,0,0,0.02)] dark:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.12)]"
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

        {projects.length > 0 && (
          <div className="flex items-center justify-between gap-3 mb-4">
            <div
              className="flex items-center gap-2 text-sm text-ink-300
              dark:text-placeholder-muted select-none"
            >
              <StyledCheckbox
                ref={selectAllRef}
                checked={allSelected}
                indeterminate={someSelected}
                onChange={onToggleSelectAll}
                aria-label="Select all"
              />
              {selectedIds.size > 0
                ? `${selectedIds.size} selected`
                : "Select all"}
            </div>
          </div>
        )}

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
                  className={`bg-page-surface rounded-3xl border transition-all duration-200 p-4 py-3 relative group flex flex-col hover:shadow-[0_1px_3px_rgba(208,0,255,0.08)] ${
                    selectedIds.has(project.id)
                      ? "border-primary ring-1 ring-primary bg-primary/[0.03] dark:bg-primary/[0.06]"
                      : "border-border-tertiary"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <div
                        className={`relative z-[1] shrink-0 overflow-hidden transition-all duration-150 ${
                          selectedIds.size > 0 || selectedIds.has(project.id)
                            ? "w-4 opacity-100"
                            : "w-0 opacity-0 group-hover:w-4 group-hover:opacity-100 group-focus-within:w-4 group-focus-within:opacity-100"
                        }`}
                      >
                        <StyledCheckbox
                          checked={selectedIds.has(project.id)}
                          onChange={() => onToggleSelect(project.id)}
                          aria-label={`Select ${project.title}`}
                        />
                      </div>

                      <Link
                        href={`/workspace/${workspaceId}/documents/${project.id}`}
                        className="text-[0.9rem] font-medium text-ink-100 dark:text-white flex-1 min-w-0 pr-2 truncate after:absolute after:inset-0 after:rounded-3xl focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-primary"
                      >
                        {project.title}
                      </Link>
                    </div>

                    <div className="flex items-center gap-2 relative z-[2]">
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
            selectedIds={selectedIds}
            onToggleSelect={onToggleSelect}
            onToggleSelectAll={onToggleSelectAll}
          />
        )}
      </div>

      {/* ── Floating selection pill ── */}
      <div
        className={clsx(
          "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
          "flex items-center gap-4 px-3 py-3",
          "bg-base-400 dark:bg-dropdown-bg border border-border-secondary dark:border-border-tertiary",
          "rounded-[14px]",
          "shadow-lg",
          "transition-all duration-200 ease-out",
          selectedIds.size > 0
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        <span className="text-[13px] text-white/70 whitespace-nowrap">
          <span className="text-white font-medium">{selectedIds.size}</span>{" "}
          {selectedIds.size === 1 ? "project" : "projects"} selected
        </span>

        <button
          type="button"
          onClick={() => setConfirmingDelete(true)}
          className="flex items-center gap-1.5 text-xs font-medium transition-colors text-red-400 hover:text-red-300 rounded-lg px-2 py-1.5"
        >
          Delete selected
        </button>
      </div>

      <ConfirmDialog
        isOpen={confirmingDelete}
        isBusy={isDeletingSelected}
        title="Delete selected?"
        message={`This will move ${selectedIds.size} selected project${selectedIds.size === 1 ? "" : "s"} to trash.`}
        confirmLabel="Delete selected"
        busyLabel="Deleting…"
        onClose={() => setConfirmingDelete(false)}
        onConfirm={onConfirmDeleteSelected}
      />
    </div>
  );
};
