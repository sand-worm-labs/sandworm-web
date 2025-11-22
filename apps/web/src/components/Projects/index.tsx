"use client";

import React, { useState } from "react";
import {
  Star,
  MoreVertical,
  User,
  Save,
  FolderOpen,
  ExternalLink,
  Copy,
  Trash2,
} from "lucide-react";

import ProjectControl from "./ProjectControls";

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
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Create Project
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark:bg-black p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-0">
          <span className="bg-[#C7665C20] rounded-full p-2 flex items-center justify-center">
            <FolderOpen className="w-4 h-4 text-[#C7665C] " />
          </span>
          <h2 className="text-xl font-medium ">Projects</h2>
        </div>

        <ProjectControl />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div
              key={project.id}
              className="bg-white dark:bg-black rounded-3xl border border-gray-200 dark:border-[#262A30]  transition-all duration-200 p-4 py-3 relative group"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-[0.9rem] font-medium text-gray-900 dark:text-white flex-1 pr-2">
                  {project.title}
                </h3>
                <div className="flex items-center gap-2">
                  <button
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
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === project.id ? null : project.id
                        )
                      }
                      className="p-1 rounded transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-[#717a94]" />
                    </button>

                    {openMenuId === project.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-black rounded-lg shadow-lg border border-gray-200 dark:border-[#262A30] py-1 z-10">
                        <button
                          onClick={() =>
                            handleMenuAction("duplicate", project.id)
                          }
                          className="w-full px-4 py-2 text-left text-sm flex items-center gap-2"
                        >
                          <Copy className="w-4 h-4" />
                          Duplicate
                        </button>
                        <button
                          onClick={() => handleMenuAction("newTab", project.id)}
                          className="w-full px-4 py-2 text-left text-sm flex items-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Open in new tab
                        </button>
                        <button
                          onClick={() => handleMenuAction("trash", project.id)}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
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
                    onMouseEnter={() => setHoveredUser(project.id)}
                    onMouseLeave={() => setHoveredUser(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <User className="w-4 h-4 text-[#717a94]" />
                  </button>

                  {hoveredUser === project.id && (
                    <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded shadow-lg whitespace-nowrap z-20">
                      Creator: {project.creator}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    onMouseEnter={() => setHoveredSave(project.id)}
                    onMouseLeave={() => setHoveredSave(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Save className="w-4 h-4 text-[#717a94]" />
                  </button>

                  {hoveredSave === project.id && (
                    <div className="absolute bottom-full right-0 mb-2 px-4 py-3 bg-gray-900 text-white text-xs rounded shadow-lg whitespace-nowrap z-20">
                      <div className="space-y-1">
                        <div>
                          <span className="font-semibold">Creator:</span>{" "}
                          {project.creator}
                        </div>
                        <div>
                          <span className="font-semibold">Last edited:</span>{" "}
                          {project.lastEdited}
                        </div>
                        <div>
                          <span className="font-semibold">Created:</span>{" "}
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
