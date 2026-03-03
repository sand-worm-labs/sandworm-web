"use client";

import React, { useState, useMemo } from "react";
import {
  Star,
  MoreHorizontal,
  User,
  Save,
  Bookmark,
  ExternalLink,
  Copy,
  Trash2,
} from "lucide-react";
import { PiPlus } from "react-icons/pi";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

import { useFavorites } from "@/components/Visualization/hooks/useFavorites";

import { useDocuments } from "../Visualization/hooks/useDocuments";
import { Loader } from "../Loader";
import { UploadIcon } from "../Assets/UploadIcon";

import ProjectControl from "./ProjectControls";
import { ProjectsTable } from "./ProjectTable";

export interface Project {
  id: string;
  title: string;
  creator: string;
  lastEdited: string;
  created: string;
  isFavorite: boolean;
}

type MenuAction = "duplicate" | "newTab" | "trash";

export const SavedProjects: React.FC = () => {
  const pathname = usePathname();
  const workspaceId = pathname.split("/")[2] ?? "";
  const router = useRouter();
  const [activeView, setActiveView] = useState<"grid" | "table">("grid");

  const [documentsState, { duplicateDocument, deleteDocument }] =
    useDocuments(workspaceId);

  const [
    favorites,
    { favoriteDocument, unfavoriteDocument },
    { data, loading },
  ] = useFavorites(workspaceId);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);
  const [hoveredSave, setHoveredSave] = useState<string | null>(null);

  // Helper function to format dates
  const formatDate = (dateString: string | Date): string => {
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
  };

  // Use favorite documents directly from the GraphQL query
  const projects: Project[] = useMemo(() => {
    const favoriteDocuments = data?.getFavoriteDocuments ?? [];

    return favoriteDocuments
      .filter(doc => doc.deletedAt === null)
      .map(doc => ({
        id: doc.id,
        title: doc.title || "Untitled Project",
        creator: doc.authorId || "Unknown",
        lastEdited: formatDate(doc.updatedAt),
        created: formatDate(doc.createdAt),
        isFavorite: true,
      }));
  }, [data]);

  const toggleFavorite = async (id: string): Promise<void> => {
    const isFavorite = favorites.has(id);

    if (isFavorite) {
      await unfavoriteDocument(id);
    } else {
      await favoriteDocument(id);
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

  if (loading || documentsState.loading) {
    return (
      <div className="min-h-screen  dark:bg-base-100 flex items-center justify-center p-8">
        <div className="text-center">
          <Loader />
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="h-full  dark:bg-base-100 flex items-center justify-center p-8 font-body">
        <div className="text-center flex items-center flex-col">
          <UploadIcon />
          <h2 className="text-2xl font-medium font-body  text-ink-100 dark:text-white mb-2 mt-3">
            No Favorites projects yet
          </h2>
          <p className="text-ink-300 dark:text-ink-400 mb-1">
            Star your favorite projects to see them here
          </p>
          <button
            type="button"
            onClick={() => router.push(`/workspace/${workspaceId}/projects`)}
            className="px-4 py-2 bg-[#A308F020] hover:bg-[#A308F030] border-[#A308F0] border text-primary font-body font-medium rounded-lg transition-colors text-sm mt-6"
          >
            Browse All Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark:bg-base-100 p-8">
      <div className="flex justify-between w-full">
        <div className="flex items-center gap-3 mb-0">
          <span className="bg-[#A308F020] rounded-full p-2 flex items-center justify-center">
            <Bookmark className="w-4 h-4 text-primary" />
          </span>
          <h2 className="text-xl font-medium">Saved Projects</h2>
        </div>
        <button
          type="button"
          className="px-3 bg-[#A308F020] hover:bg-[#A308F030] border-[#A308F0] border text-primary rounded-lg transition-colors text-sm flex items-center gap-x-2 py-0"
          onClick={() =>
            router.push(`/workspace/${workspaceId}/documents/notebook`)
          }
        >
          <PiPlus size={18} />
          <span className="inline-block">Create Project</span>
        </button>
      </div>

      <div className="mx-auto">
        <ProjectControl onViewChange={setActiveView} />

        {activeView === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <div
                key={project.id}
                className="bg-white dark:bg-black rounded-3xl border border-[#CED4DA] dark:border-[#262A30] transition-all duration-200 p-4 py-3 relative group"
              >
                <div className="flex items-start justify-between mb-4">
                  <Link
                    href={`/workspace/${workspaceId}/documents/${project.id}`}
                    className="text-[0.9rem] font-medium text-gray-900 dark:text-white flex-1 pr-2 hover:underline"
                  >
                    {project.title}
                  </Link>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleFavorite(project.id)}
                      className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                        project.isFavorite ? "opacity-100" : ""
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
                        <MoreHorizontal className="w-4 h-4 text-ink-200" />
                      </button>

                      {openMenuId === project.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-black rounded-xl shadow-lg border border-[#CED4DA] dark:border-[#262A30] pb-1 z-10 text-ink-200 dark:text-white">
                          <button
                            type="button"
                            onClick={() =>
                              handleMenuAction("duplicate", project.id)
                            }
                            className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-primary/20"
                          >
                            <Copy className="w-3.5 h-.5" strokeWidth={1.4} />
                            Duplicate
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleMenuAction("newTab", project.id)
                            }
                            className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-primary/20"
                          >
                            <ExternalLink
                              className="w-3.5 h-3.5"
                              strokeWidth={1.4}
                            />
                            Open in new tab
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleMenuAction("trash", project.id)
                            }
                            className="w-full px-4 py-2 text-left text-sm hover:bg-primary/20 flex items-center gap-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.4} />
                            Move to trash
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-black rounded-lg h-10 mb-4 flex items-center justify-center" />

                <div className="flex items-center justify-between">
                  <div className="relative">
                    <button
                      type="button"
                      onMouseEnter={() => setHoveredUser(project.id)}
                      onMouseLeave={() => setHoveredUser(null)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors dark:hover:bg-[#181C21]"
                    >
                      <User className="w-4 h-4 text-ink-200" />
                    </button>

                    {hoveredUser === project.id && (
                      <div className="absolute bottom-full left-0 mb-2 px-3 py-1 dark:bg-black bg-white text-ink-400 border-[#E9ECEF] dark:border-[#262A30] border dark:text-white text-xs rounded shadow-[0_0.5px_4px_#2516660A] whitespace-nowrap z-20">
                        Creator: {project.creator}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <button
                      type="button"
                      onMouseEnter={() => setHoveredSave(project.id)}
                      onMouseLeave={() => setHoveredSave(null)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors dark:hover:bg-[#181C21]"
                    >
                      <Save className="w-4 h-4 text-ink-200" />
                    </button>

                    {hoveredSave === project.id && (
                      <div className="absolute bottom-full right-0 mb-2 px-4 py-1.5 dark:bg-black bg-white text-ink-500 border-[#E9ECEF] dark:border-[#262A30] border dark:text-white text-xs rounded shadow-[0_0.5px_4px_#2516660A] whitespace-nowrap z-20">
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
        ) : (
          <ProjectsTable
            projects={projects}
            workspaceId={workspaceId}
            onToggleFavorite={toggleFavorite}
            onMenuAction={handleMenuAction}
          />
        )}
      </div>
    </div>
  );
};
