"use client";

import React, { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import { useRouter } from "next/navigation";

import {
  useCurrentWorkspaceInfo,
  useSwitchWorkspace,
  useWorkspaces,
} from "../Visualization/hooks/useWorkspaces";

function workspaceGradient(id: string) {
  const gradients = [
    "from-violet-500 to-indigo-500",
    "from-fuchsia-500 to-pink-500",
    "from-cyan-500 to-blue-500",
    "from-emerald-500 to-teal-500",
    "from-orange-500 to-rose-500",
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++)
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return gradients[Math.abs(hash) % gradients.length];
}

export default function WorkspaceSwitcher() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { workspaceInfo } = useCurrentWorkspaceInfo();
  const [{ data: allWorkspaces }] = useWorkspaces();
  const { switchWorkspace, loading: isSwitching } = useSwitchWorkspace();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSwitch = async (id: string) => {
    if (id === workspaceInfo?.id || isSwitching) return;
    setOpen(false);
    const success = await switchWorkspace(id);
    if (success) router.push(`/workspace/${id}`);
  };

  if (!workspaceInfo) return null;

  const others = (allWorkspaces ?? []).filter(w => w.id !== workspaceInfo.id);

  return (
    <div ref={ref} className="relative px-2 mt-6 mb-2">
      {/* Section label */}
      <div className="flex items-center gap-1 px-2 mb-2">
        <svg
          className="w-3 h-3 text-gray-400 dark:text-gray-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
        <span className="text-[12px] font-medium text-[#8C98A3]  ">
          Workspaces
        </span>
      </div>

      {/* Trigger pill */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={clsx(
          "w-full flex items-center gap-3 px-3 py-1.5 rounded-xl border transition-all",
          "bg-white dark:bg-[#111418]",
          "border-[#E9ECEF] dark:border-[#1E2328]",
          "hover:border-[#DEE2E6] dark:hover:border-[#2A2F36]",
          "shadow-sm"
        )}
      >
        {/* Avatar */}
        <div
          className={clsx(
            "w-7 h-7 rounded-lg flex-shrink-0 bg-gradient-to-br",
            workspaceGradient(workspaceInfo.id)
          )}
        />

        {/* Name */}
        <span className="flex-1 text-left xl:text-sm text-[13px] font-medium text-ink-100 dark:text-gray-100 truncate">
          {workspaceInfo.name}
        </span>

        {/* Up/down chevrons */}
        <div className="flex flex-col gap-[0px] text-[#1C3B5A]">
          <svg
            className="w-3 h-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 15l7-7 7 7"
            />
          </svg>
          <svg
            className="w-3 h-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className={clsx(
            "absolute left-2 right-2 top-full mt-1.5 z-50",
            "bg-white dark:bg-[#111418]",
            "border border-[#E9ECEF] dark:border-[#1E2328]",
            "rounded-xl shadow-lg overflow-hidden"
          )}
        >
          {/* Current workspace (non-clickable) */}
          <div className="flex items-center gap-3 px-3 py-2.5 bg-[#F8F9FA] dark:bg-[#0C1015]">
            <div
              className={clsx(
                "w-6 h-6 rounded-md bg-gradient-to-br flex-shrink-0",
                workspaceGradient(workspaceInfo.id)
              )}
            />
            <span className="flex-1 text-sm font-medium text-ink-100 dark:text-gray-100 truncate">
              {workspaceInfo.name}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 bg-[#A308F0]/10 text-[#A308F0] rounded-full font-medium">
              Current
            </span>
          </div>

          {others.length > 0 && (
            <>
              <div className="h-px bg-[#E9ECEF] dark:bg-[#1E2328]" />
              {others.map(workspace => (
                <button
                  key={workspace.id}
                  type="button"
                  onClick={() => handleSwitch(workspace.id)}
                  disabled={isSwitching}
                  className={clsx(
                    "w-full flex items-center gap-3 px-3 py-2 text-left transition-colors",
                    "hover:bg-[#F8F9FA] dark:hover:bg-[#181C21]",
                    isSwitching && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div
                    className={clsx(
                      "w-5 h-5 rounded-md bg-gradient-to-br flex-shrink-0",
                      workspaceGradient(workspace.id)
                    )}
                  />
                  <span className="flex-1 xl:text-sm text-[13px] font-medium text-ink-100  truncate">
                    {workspace.name}
                  </span>
                </button>
              ))}
            </>
          )}

          <div className="h-px bg-[#E9ECEF] dark:bg-[#1E2328]" />

          {/* Create new */}
          <button
            type="button"
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[#A308F0] hover:bg-[#A308F0]/5 transition-colors font-semibold"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create new team
          </button>
        </div>
      )}
    </div>
  );
}
