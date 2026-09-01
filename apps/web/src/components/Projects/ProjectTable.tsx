"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  PiStarLight,
  PiStarFill,
  PiDotsThreeLight,
  PiTrashLight,
  PiCopyLight,
  PiArrowSquareOutLight,
  PiFolderLight,
} from "react-icons/pi";
import Link from "next/link";

import { iconButtonSmClassName } from "@/styles/interactive";
import { StyledCheckbox } from "@/components/StyledCheckbox";

interface Project {
  id: string;
  title: string;
  creator: string;
  lastEdited: string;
  created: string;
  isFavorite: boolean;
}

interface ProjectsTableProps {
  projects: Project[];
  workspaceId: string;
  onToggleFavorite: (id: string) => void;
  onMenuAction: (
    action: "duplicate" | "newTab" | "trash",
    projectId: string
  ) => void;
  searchQuery?: string;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
}

export const ProjectsTable: React.FC<ProjectsTableProps> = ({
  projects,
  workspaceId,
  onToggleFavorite,
  onMenuAction,
  searchQuery,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const allSelected =
    projects.length > 0 && selectedIds.size === projects.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  const selectAllRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  return (
    <div className="w-full overflow-x-auto rounded-t-2xl border-b-0">
      <table className="w-full border-collapse">
        <thead className="sticky top-0 z-10 border-b border-border-secondary dark:border-border-tertiary">
          <tr>
            <th className="p-4 w-10">
              {projects.length > 0 && (
                <StyledCheckbox
                  ref={selectAllRef}
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={onToggleSelectAll}
                  aria-label="Select all"
                />
              )}
            </th>
            <th className="p-4 w-10" />
            <th className="text-left p-4 text-xs font-bold text-ink-400 uppercase sticky left-0 bg-base-100 min-w-[250px]">
              Title
            </th>
            <th className="text-left p-4 text-xs font-bold text-ink-400 uppercase min-w-[120px]">
              Creator
            </th>
            <th className="text-left p-4 text-xs font-bold text-ink-400 uppercase min-w-[120px]">
              Last Edited
            </th>
            <th className="text-left p-4 text-xs font-bold text-ink-400 uppercase min-w-[120px]">
              Created
            </th>
            <th className="text-left p-4 text-xs font-bold text-ink-400 uppercase min-w-[140px]">
              Published At
            </th>
            <th className="text-left p-4 text-xs font-bold text-ink-400 uppercase min-w-[120px]">
              Your Access
            </th>
            <th className="text-left p-4 text-xs font-bold text-ink-400 uppercase min-w-[100px]">
              Reviews
            </th>
            <th className="w-24 p-4" />
          </tr>
        </thead>
        <tbody>
          {projects.length === 0 ? (
            <tr>
              <td colSpan={10} className="py-16 text-center">
                <div className="flex flex-col items-center justify-center gap-3">
                  <PiFolderLight
                    size={36}
                    className="text-ink-200 dark:text-ink-600"
                  />
                  <p className="text-sm font-medium text-ink-200 dark:text-ink-400">
                    {searchQuery
                      ? `No projects matching "${searchQuery}"`
                      : "No projects found"}
                  </p>
                  <p className="text-xs text-ink-300 dark:text-ink-500">
                    Try adjusting or clearing your filters to see all Projects.
                  </p>
                </div>
              </td>
            </tr>
          ) : null}
          {projects.map(project => (
            <tr
              key={project.id}
              className="border-b border-border-secondary dark:border-border-tertiary transition-colors"
            >
              <td className="whitespace-nowrap p-4 w-10">
                <StyledCheckbox
                  checked={selectedIds.has(project.id)}
                  onChange={() => onToggleSelect(project.id)}
                  aria-label={`Select ${project.title}`}
                />
              </td>
              <td className="whitespace-nowrap p-4 w-10">
                <button
                  type="button"
                  onClick={() => onToggleFavorite(project.id)}
                  className={iconButtonSmClassName}
                >
                  {project.isFavorite ? (
                    <PiStarFill className="w-4 h-4 text-primary" />
                  ) : (
                    <PiStarLight className="w-4 h-4" />
                  )}
                </button>
              </td>
              <td className="p-4 sticky left-0 bg-white dark:bg-base-100">
                <Link
                  href={`/workspace/${workspaceId}/documents/${project.id}/notebook/edit`}
                  className="text-sm font-medium text-ink-100 dark:text-white hover:underline truncate"
                >
                  {project.title}
                </Link>
              </td>
              <td className="p-4 text-sm text-ink-200 dark:text-ink-300">
                {project.creator}
              </td>
              <td className="p-4 text-sm text-ink-200 dark:text-ink-300">
                {project.lastEdited}
              </td>
              <td className="p-4 text-sm text-ink-200 dark:text-ink-300">
                {project.created}
              </td>
              <td className="p-4 text-sm text-ink-200 dark:text-ink-300">-</td>
              <td className="p-4 text-sm text-ink-200 dark:text-ink-300">
                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium border border-border dark:border-border-tertiary bg-inputBg dark:bg-base-100 text-ink-200 dark:text-ink-300">
                  Owner
                </span>
              </td>
              <td className="p-4 text-sm text-ink-200 dark:text-ink-300">-</td>
              <td className="whitespace-nowrap p-4">
                <div className="flex items-center gap-1 justify-end">
                  <button
                    type="button"
                    onClick={() => onMenuAction("trash", project.id)}
                    className={iconButtonSmClassName}
                  >
                    <PiTrashLight className="w-4 h-4" />
                  </button>

                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === project.id ? null : project.id
                        )
                      }
                      className={iconButtonSmClassName}
                    >
                      <PiDotsThreeLight className="w-4 h-4" />
                    </button>

                    {openMenuId === project.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-base-100 rounded-xl shadow-lg border border-border-tertiary dark:border-border-tertiary pb-1 z-20">
                        <button
                          type="button"
                          onClick={() => {
                            onMenuAction("duplicate", project.id);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-primary/10 text-ink-200 dark:text-white"
                        >
                          <PiCopyLight className="w-3.5 h-3.5" />
                          Duplicate
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onMenuAction("newTab", project.id);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-primary/10 text-ink-200 dark:text-white"
                        >
                          <PiArrowSquareOutLight className="w-3.5 h-3.5" />
                          Open in new tab
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onMenuAction("trash", project.id);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-primary/10 text-ink-200 dark:text-white"
                        >
                          <PiTrashLight className="w-3.5 h-3.5" />
                          Move to trash
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
