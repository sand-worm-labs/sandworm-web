"use client";

import React, { useState } from "react";
import { Star, MoreHorizontal, ExternalLink, Copy, Trash2 } from "lucide-react";
import Link from "next/link";

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
}

export const ProjectsTable: React.FC<ProjectsTableProps> = ({
  projects,
  workspaceId,
  onToggleFavorite,
  onMenuAction,
}) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  return (
    <div className="w-full overflow-x-auto border border-[#E9ECEF] rounded-t-2xl border-b-0">
      <table className="w-full border-collapse">
        <thead className="bg-[#F1F3F4] dark:bg-[#0D0F12] sticky top-0 z-10">
          <tr className="border-b border-[#CED4DA] dark:border-border-tertiary">
            <th className="text-left p-4 text-xs font-medium text-ink-400 dark:text-ink-300  sticky left-0 bg-[#F1F3F4] dark:bg-[#0D0F12] min-w-[250px]">
              Title
            </th>
            <th className="text-left p-4 text-xs font-medium text-ink-400 dark:text-ink-300  min-w-[120px]">
              Creator
            </th>
            <th className="text-left p-4 text-xs font-medium text-ink-400 dark:text-ink-300  min-w-[120px]">
              Last Edited
            </th>
            <th className="text-left p-4 text-xs font-medium text-ink-400 dark:text-ink-300  min-w-[120px]">
              Created
            </th>
            <th className="text-left p-4 text-xs font-medium text-ink-400 dark:text-ink-300  min-w-[140px]">
              App Published At
            </th>
            <th className="text-left p-4 text-xs font-medium text-ink-400 dark:text-ink-300  min-w-[120px]">
              Your Access
            </th>
            <th className="text-left p-4 text-xs font-medium text-ink-400 dark:text-ink-300  min-w-[100px]">
              Reviews
            </th>
            <th className="w-12 p-4" />
          </tr>
        </thead>
        <tbody>
          {projects.map(project => (
            <tr
              key={project.id}
              onMouseEnter={() => setHoveredRowId(project.id)}
              onMouseLeave={() => setHoveredRowId(null)}
              className="border-b border-[#CED4DA] dark:border-border-tertiary hover:bg-gray-50 dark:hover:bg-[#0D0F12] transition-colors"
            >
              <td className="p-4 sticky left-0 bg-white dark:bg-base-100 group-hover:bg-gray-50 dark:group-hover:bg-[#0D0F12]">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(project.id)}
                    className={`transition-opacity ${
                      hoveredRowId === project.id || project.isFavorite
                        ? "opacity-100"
                        : "opacity-0"
                    }`}
                  >
                    <Star
                      className={`w-4 h-4 ${
                        project.isFavorite
                          ? "fill-[#A308F0] text-primary"
                          : "text-gray-400 hover:text-primary"
                      }`}
                    />
                  </button>
                  <Link
                    href={`/workspace/${workspaceId}/documents/${project.id}/notebook/edit`}
                    className="text-sm font-medium text-ink-100 dark:text-white hover:underline truncate"
                  >
                    {project.title}
                  </Link>
                </div>
              </td>
              <td className="p-4 text-sm text-ink-200 dark:text-ink-300 ">
                {project.creator}
              </td>
              <td className="p-4 text-sm text-ink-200 dark:text-ink-300 ">
                {project.lastEdited}
              </td>
              <td className="p-4 text-sm text-ink-200 dark:text-ink-300 ">
                {project.created}
              </td>
              <td className="p-4 text-sm text-ink-200 dark:text-ink-300 ">-</td>
              <td className="p-4 text-sm text-ink-200 dark:text-ink-300 ">
                Owner
              </td>
              <td className="p-4 text-sm text-ink-200 dark:text-ink-300 ">-</td>
              <td className="p-4">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenMenuId(
                        openMenuId === project.id ? null : project.id
                      )
                    }
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-[#181C21] transition-colors shrink-0 "
                  >
                    <MoreHorizontal className="w-6 h-4 text-ink-200" />
                  </button>

                  {openMenuId === project.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-base-100 rounded-xl shadow-lg border border-[#CED4DA] dark:border-border-tertiary pb-1 z-20">
                      <button
                        type="button"
                        onClick={() => {
                          onMenuAction("duplicate", project.id);
                          setOpenMenuId(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-[#181C21] text-ink-200 dark:text-white"
                      >
                        <Copy className="w-3.5 h-3.5" strokeWidth={1.4} />
                        Duplicate
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onMenuAction("newTab", project.id);
                          setOpenMenuId(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-[#181C21] text-ink-200 dark:text-white"
                      >
                        <ExternalLink
                          className="w-3.5 h-3.5"
                          strokeWidth={1.4}
                        />
                        Open in new tab
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onMenuAction("trash", project.id);
                          setOpenMenuId(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-[#181C21] text-ink-200 dark:text-white"
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.4} />
                        Move to trash
                      </button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
