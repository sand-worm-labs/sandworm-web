"use client";

import React, { useState } from "react";
import {
  Star,
  MoreHorizontal,
  User,
  Save,
  FolderOpen,
  ExternalLink,
  Copy,
  Trash2,
} from "lucide-react";
import { PiPlus } from "react-icons/pi";

import ProjectControl from "./ProjectControls";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Project {
  id: number;
  title: string;
  creator: string;
  lastEdited: string;
  created: string;
  isFavorite: boolean;
}

type MenuAction = "duplicate" | "newTab" | "trash";

export const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      title: "Top Base Tokens Analysis",
      creator: "Sarah Johnson",
      lastEdited: "2 hours ago",
      created: "Nov 15, 2025",
      isFavorite: false,
    },
    {
      id: 2,
      title: "Moutai Stats",
      creator: "Michael Chen",
      lastEdited: "1 day ago",
      created: "Nov 10, 2025",
      isFavorite: true,
    },
    {
      id: 3,
      title: "Farcaster Daily Users",
      creator: "Emily Rodriguez",
      lastEdited: "3 days ago",
      created: "Nov 5, 2025",
      isFavorite: false,
    },
  ]);

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [hoveredUser, setHoveredUser] = useState<number | null>(null);
  const [hoveredSave, setHoveredSave] = useState<number | null>(null);
  const router = useRouter();

  const toggleFavorite = (id: number): void => {
    setProjects(
      projects.map(p => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
    );
  };

  const handleMenuAction = (action: MenuAction, projectId: number): void => {
    console.log(`${action} project ${projectId}`);
    setOpenMenuId(null);

    if (action === "trash") {
      setProjects(projects.filter(p => p.id !== projectId));
    }
  };

  if (projects.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-8">
        <div className="text-center">
          <FolderOpen className="w-24 h-24 text-gray-300 dark:text-white mx-auto mb-6" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            No projects yet
          </h2>
          <p className="text-gray-500 mb-6">
            Create your first project to get started
          </p>
          <button
            type="button"
            onClick={() => router.push("/workspace/notebook")}
            className="px-3  bg-[#C7665C20] hover:bg-[#c7665c30]  border-[#C7665C] border  text-[#C7665C] rounded-lg transition-colors text-sm flex items-center gap-x-2 py-0"
          >
            Create Project
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark:bg-black  p-8">
      <div
        className="flex justify-between
      w-full"
      >
        <div className="flex items-center gap-3 mb-0">
          <span className="bg-[#C7665C20]  rounded-full p-2 flex items-center justify-center">
            <FolderOpen className="w-4 h-4 text-[#C7665C] " />
          </span>
          <h2 className="text-xl font-medium ">Projects</h2>
        </div>
        <button
          type="button"
          className="px-3  bg-[#C7665C20] hover:bg-[#c7665c30]  border-[#C7665C] border  text-[#C7665C] rounded-lg transition-colors text-sm flex items-center gap-x-2 py-0 "
          onClick={() => router.push("/workspace/notebook")}
        >
          <PiPlus size={18} />
          <span className="inline-block"> Create Project</span>
        </button>
      </div>

      <div className=" mx-auto">
        <ProjectControl />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div
              key={project.id}
              className="bg-white dark:bg-black rounded-3xl border border-[#CED4DA] dark:border-[#262A30]  transition-all duration-200 p-4 py-3 relative group"
            >
              <div className="flex items-start justify-between mb-4">
                <Link
                  href={`/workspace/notebook/${project.id}`}
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
                          ? "fill-[#C7665C] text-[#C7665C]"
                          : "text-gray-400 hover:text-[#C7665C]"
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
                      <MoreHorizontal className="w-4 h-4 text-[#717a94]" />
                    </button>

                    {openMenuId === project.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-black rounded-xl shadow-lg border border-[#CED4DA] dark:border-[#262A30] pb-1 z-10 text-[#455768] dark:text-white">
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
                          onClick={() => handleMenuAction("newTab", project.id)}
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
                          onClick={() => handleMenuAction("trash", project.id)}
                          className="w-full px-4 py-2 text-left text-sm  hover:bg-primary/20 flex items-center gap-2"
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
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors  dark:hover:bg-[#181C21]"
                  >
                    <User className="w-4 h-4 text-[#717a94]" />
                  </button>

                  {hoveredUser === project.id && (
                    <div className="absolute bottom-full left-0 mb-2 px-3 py-1 dark:bg-black bg-white text-[#6C757D] border-[#E9ECEF] dark:border-[#262A30] border dark:text-white text-xs rounded shadow-[0_0.5px_4px_#2516660A] whitespace-nowrap z-20">
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
                    <Save className="w-4 h-4 text-[#717a94]" />
                  </button>

                  {hoveredSave === project.id && (
                    <div className="absolute bottom-full right-0 mb-2 px-4 py-1.5 dark:bg-black bg-white text-[#343A40] border-[#E9ECEF] dark:border-[#262A30] border dark:text-white text-xs rounded shadow-[0_0.5px_4px_#2516660A] whitespace-nowrap z-20">
                      <div className="space-y-1">
                        <div>
                          <span className="font-medium text-[#6C757D] dark:text-white">
                            Creator:
                          </span>{" "}
                          {project.creator}
                        </div>
                        <div>
                          <span className="font-medium text-[#6C757D] dark:text-white">
                            Last edited:
                          </span>{" "}
                          {project.lastEdited}
                        </div>
                        <div>
                          <span className="font-medium text-[#6C757D]  dark:text-white ">
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
      </div>
    </div>
  );
};
