"use client";

import React, { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { Transition } from "@headlessui/react";
import { toast } from "sonner";

import {
  useCurrentWorkspaceInfo,
  useSwitchWorkspace,
  useWorkspaces,
} from "../Editor/hooks/useWorkspaces";
import CreateTeamModal from "../Settings/CreateTeam";
import { WorkspaceIcon } from "../Settings/WorkspaceIcon";

export default function WorkspaceSwitcher({
  collapsed,
}: {
  collapsed: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [treeOpen, setTreeOpen] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  const { workspaceInfo } = useCurrentWorkspaceInfo();
  const [{ data: allWorkspaces }] = useWorkspaces();
  const { switchWorkspace, loading: isSwitching } = useSwitchWorkspace();
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);

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

  console.log(workspaceInfo, "info")

  const renderIcon = (iconName: string, size: number) => (
    <div className="flex-shrink-0">
      <WorkspaceIcon icon={iconName} size={size} className="rounded-lg" />
    </div>
  );

  if (collapsed) {
    return (
      <div ref={ref} className="relative flex justify-center px-2 mt-6 mb-2">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="w-7 h-7 rounded-lg flex-shrink-0 bg-gradient-to-br focus:outline-none focus:ring-2 focus:ring-primary/40 transition-transform hover:scale-105"
          style={{ backgroundImage: undefined }}
        >
          {renderIcon(workspaceInfo.icon, 28)}
        </button>

        <Transition
          show={open}
          enter="transition ease-out duration-150"
          enterFrom="opacity-0 scale-95 -translate-x-1"
          enterTo="opacity-100 scale-100 translate-x-0"
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100 scale-100 translate-x-0"
          leaveTo="opacity-0 scale-95 -translate-x-1"
        >
          <div
            className={clsx(
              "absolute left-full ml-2 top-0 z-50 min-w-[12rem]",
              "bg-white dark:bg-base-400",
              "border border-[#E9ECEF] dark:border-border-tertiary",
              "rounded-xl shadow-lg overflow-hidden"
            )}
          >
            <div className="flex items-center gap-3 px-3 py-2.5 bg-[#F8F9FA] dark:bg-base-400">
            {renderIcon(workspaceInfo.icon, 28)}

              <span className="flex-1 text-sm font-medium text-ink-100 truncate">
                {workspaceInfo.name}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 bg-[#A308F0]/10 text-primary rounded-full font-medium">
                Current
              </span>
            </div>

            {others.length > 0 && (
              <>
                <div className="h-px bg-[#E9ECEF] dark:bg-border-tertiary" />
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
                   {renderIcon(workspaceInfo.icon, 28)}
                    <span className="flex-1 text-[13px] font-medium text-ink-100 truncate">
                      {workspace.name}
                    </span>
                  </button>
                ))}
              </>
            )}

            <div className="h-px bg-[#E9ECEF] dark:bg-border-tertiary" />

            <button
              type="button"
              onClick={() => setIsCreateTeamOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-primary hover:bg-[#A308F0]/5 transition-colors font-semibold"
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
        </Transition>
        <CreateTeamModal
          isOpen={isCreateTeamOpen}
          onClose={() => setIsCreateTeamOpen(false)}
          onSuccess={() => {
            setIsCreateTeamOpen(false);
          }}
        />
      </div>
    );
  }

  return (
    <div ref={ref} className="relative px-2 mt-6 mb-2">
      <button
        type="button"
        onClick={() => setTreeOpen(o => !o)}
        className="flex items-center gap-1 px-2 mb-2 w-full group"
      >
        <svg
          className={clsx(
            "w-3 h-3 text-ink-300 dark:text-ink-400 transition-transform duration-200",
            treeOpen ? "rotate-90" : "rotate-0"
          )}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-[12px] font-medium text-ink-600">Workspaces</span>
      </button>

      <Transition
        show={treeOpen}
        enter="transition ease-out duration-150"
        enterFrom="opacity-0 -translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 -translate-y-1"
      >
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className={clsx(
            "w-full flex items-center gap-3 px-3 py-1.5 rounded-xl border transition-all",
            "dark:bg-base-100",
            "border-none dark:border-border-tertiary",
            "hover:border-[#DEE2E6] dark:hover:border-border-tertiary",
            "shadow-none"
          )}
        >
         {renderIcon(workspaceInfo.icon, 28)}

          <span className="flex-1 text-left xl:text-sm text-[13px] font-medium text-ink-100 truncate">
            {workspaceInfo.name}
          </span>

          <div className="flex flex-col gap-[0px] text-[#1C3B5A] dark:text-ink-400">
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
      </Transition>

      <Transition
        show={open && treeOpen}
        enter="transition ease-out duration-150"
        enterFrom="opacity-0 scale-95 -translate-y-1"
        enterTo="opacity-100 scale-100 translate-y-0"
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100 scale-100 translate-y-0"
        leaveTo="opacity-0 scale-95 -translate-y-1"
      >
        <div
          className={clsx(
            "absolute left-2 right-2 top-full mt-1.5 z-50",
            "bg-white dark:bg-base-400",
            "border border-[#E9ECEF] dark:border-border-tertiary",
            "rounded-xl shadow-lg overflow-hidden"
          )}
        >
          <div className="flex items-center gap-3 px-3 py-2.5 bg-[#F8F9FA] dark:bg-base-400 min-w-[12rem]">
          {renderIcon(workspaceInfo.icon, 28)}
            <span className="flex-1 text-sm font-medium text-ink-100 dark:text-ink-100 truncate">
              {workspaceInfo.name}
            </span>
            <span className="w-5 h-5 rounded-full border border-[#7F56D9] flex items-center justify-center">
              <svg
                className="w-3 h-3 text-[#7F56D9]"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="2,6 5,9 10,3" />
              </svg>
            </span>
          </div>

          {others.length > 0 && (
            <>
              <div className="h-px bg-[#E9ECEF] dark:bg-border-tertiary" />
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
                 {renderIcon(workspaceInfo.icon, 28)}
                  <span className="flex-1 xl:text-sm text-[13px] font-medium text-ink-100 truncate">
                    {workspace.name}
                  </span>
                </button>
              ))}
            </>
          )}

          <div className="h-px bg-[#E9ECEF] dark:bg-border-tertiary" />

          <button
            type="button"
            onClick={() => setIsCreateTeamOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-ink-100 hover:bg-[#A308F0]/5 transition-colors font-medium"
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
      </Transition>

      <CreateTeamModal
        isOpen={isCreateTeamOpen}
        onClose={() => setIsCreateTeamOpen(false)}
        onSuccess={() => {
          toast.success("Workspace created successful");
          setIsCreateTeamOpen(false);
        }}
      />
    </div>
  );
}
