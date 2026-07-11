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
import { CaretUpDown } from "../Assets/CaretUpDown";

import { WorkspaceDropdownMenu } from "./WorkspaceDropdownMenu";

// =====================================
// ⬢ Types
// =====================================
interface WorkspaceSwitcherProps {
  collapsed: boolean;
}

// =====================================
// ⬢ Constants
// =====================================
const TRANSITION_DROPDOWN = {
  enter: "transition ease-out duration-150",
  enterFrom: "scale-95 -translate-y-1",
  enterTo: "scale-100 translate-y-0",
  leave: "transition ease-in duration-100",
  leaveFrom: "scale-100 translate-y-0",
  leaveTo: "scale-95 -translate-y-1",
} as const;

const TRANSITION_COLLAPSE = {
  enter: "transition ease-out duration-150",
  enterFrom: "scale-y-95 -translate-y-0.5 origin-top",
  enterTo: "scale-y-100 translate-y-0",
  leave: "transition ease-in duration-100",
  leaveFrom: "scale-y-100 translate-y-0",
  leaveTo: "scale-y-95 -translate-y-0.5 origin-top",
} as const;

// =====================================
// ⬢ Use Workspace Switcher Hook
// =====================================
function useWorkspaceSwitcher() {
  const router = useRouter();
  const {
    workspaceInfo,
    refetch: refetchCurrent,
    isLoading: isLoadingCurrent,
  } = useCurrentWorkspaceInfo();
  const [
    { data: allWorkspaces, isLoading: isLoadingAll },
    { refetch: refetchAll },
  ] = useWorkspaces();
  const { switchWorkspace, loading: isSwitching } = useSwitchWorkspace();

  const refetchBoth = () => {
    refetchAll();
    refetchCurrent();
  };

  const handleSwitch = async (id: string) => {
    if (id === workspaceInfo?.id || isSwitching) return;
    const success = await switchWorkspace(id);
    if (success) router.push(`/workspace/${id}`);
  };

  const others = (allWorkspaces ?? []).filter(w => w.id !== workspaceInfo?.id);

  return {
    workspaceInfo,
    others,
    isSwitching,
    isLoading: isLoadingCurrent || isLoadingAll,
    refetchBoth,
    handleSwitch,
  };
}

// =====================================
// ⬢ Loading Skeleton
// =====================================
function WorkspaceSwitcherSkeleton({ collapsed }: { collapsed: boolean }) {
  const pulse = "bg-[#F1F3F4] dark:bg-[#2A2A28] animate-pulse";

  if (collapsed) {
    return (
      <div className="flex justify-center px-2 mt-6 mb-2" aria-hidden>
        <div className={`w-7 h-7 rounded-lg ${pulse}`} />
      </div>
    );
  }

  return (
    <div className="px-2 mt-2 mb-2" aria-hidden>
      <div className="flex items-center gap-1 px-2 mb-2">
        <div className={`w-3 h-3 rounded-sm ${pulse}`} />
        <div className={`h-3 w-[4.5rem] rounded-md ${pulse}`} />
      </div>
      <div
        className={`flex items-center gap-3 px-3 py-2 rounded-xl border border-transparent ${pulse}`}
      >
        <div className="w-[22px] h-[22px] rounded-lg bg-[#E4E6E8] dark:bg-[#353533] flex-shrink-0" />
        <div className="flex-1 h-3.5 rounded-md bg-[#E4E6E8] dark:bg-[#353533]" />
        <div className="w-3.5 h-3.5 rounded bg-[#E4E6E8] dark:bg-[#353533] flex-shrink-0" />
      </div>
    </div>
  );
}

// =====================================
// ⬢ use Outside Click Hook
// =====================================
function useOutsideClick(
  ref: React.RefObject<HTMLElement>,
  handler: () => void
) {
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) handler();
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}

// =====================================
// ⬢  Collapsed Switcher
// =====================================
function CollapsedSwitcher({
  workspaceInfo,
  others,
  isSwitching,
  refetchBoth,
  handleSwitch,
}: ReturnType<typeof useWorkspaceSwitcher>) {
  const [open, setOpen] = useState(false);
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useOutsideClick(ref, () => setOpen(false));

  if (!workspaceInfo) return null;

  return (
    <div
      ref={ref}
      className="relative z-10 flex justify-center px-2 mt-6 mb-2 isolate"
    >
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={clsx(
          "w-8 h-8 rounded-lg flex-shrink-0 self-center flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary/40",
          "transition-colors duration-100 shadow-[0px_1px_12px_1px_#A9A9D44D]",
          open ? "bg-[#F9F5FF] dark:bg-[#1A0D26]" : " dark:hover:bg-[#1A0D26]"
        )}
      >
        <WorkspaceIcon
          icon={workspaceInfo.icon}
          size={20}
          className="rounded-lg h-auto "
        />
      </button>

      <Transition
        show={open}
        enter="transition ease-out duration-150"
        enterFrom="scale-95 -translate-x-1"
        enterTo="scale-100 translate-x-0"
        leave="transition ease-in duration-100"
        leaveFrom="scale-100 translate-x-0"
        leaveTo="scale-95 -translate-x-1"
      >
        <div className="absolute left-full ml-2 top-0 z-50">
          <WorkspaceDropdownMenu
            current={workspaceInfo}
            others={others}
            isSwitching={isSwitching}
            onSwitch={id => {
              setOpen(false);
              handleSwitch(id);
            }}
            onCreateTeam={() => setIsCreateTeamOpen(true)}
          />
        </div>
      </Transition>

      <CreateTeamModal
        isOpen={isCreateTeamOpen}
        onClose={() => setIsCreateTeamOpen(false)}
        onSuccess={() => {
          refetchBoth();
          setIsCreateTeamOpen(false);
        }}
      />
    </div>
  );
}

// =====================================
// ⬢  Expander Switcher
// =====================================
function ExpandedSwitcher({
  workspaceInfo,
  others,
  isSwitching,
  refetchBoth,
  handleSwitch,
}: ReturnType<typeof useWorkspaceSwitcher>) {
  const [open, setOpen] = useState(false);
  const [treeOpen, setTreeOpen] = useState(true);
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useOutsideClick(ref, () => setOpen(false));

  if (!workspaceInfo) return null;

  return (
    <div ref={ref} className="relative z-10 px-2 mt-2 mb-2 isolate">
      {/* ✦ Tree toggle ✦ */}
      <button
        type="button"
        onClick={() => setTreeOpen(o => !o)}
        className="flex items-center gap-1 px-2 mb-2 w-full rounded-lg
           transition-colors duration-100"
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

      {/* ✦ Current Workspace Switcher ✦ */}
      <Transition show={treeOpen} {...TRANSITION_COLLAPSE}>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className={clsx(
            "w-full flex items-center gap-3 px-3 py-2 rounded-xl border-none transition-all",
            "bg-[#FFFFFF] dark:bg-base-100 dark:border-border-tertiary",
            "hover:border-[#DEE2E6] dark:hover:border-border-tertiary",
            "shadow-[0_1px_5.5px_6px_#A9A9D41A]"
          )}
        >
          <div className="flex-shrink-0">
            <WorkspaceIcon
              icon={workspaceInfo.icon}
              size={22}
              className="rounded-lg"
            />
          </div>
          <span className="flex-1 text-left xl:text-sm text-[13px] font-medium text-ink-100 truncate capitalize">
            {workspaceInfo.name}
          </span>

          {/* ✦ Chevron Up Down ✦ */}
          <CaretUpDown />
        </button>
      </Transition>

      {/* ✦ Dropdown ✦ */}
      <Transition show={open && treeOpen} {...TRANSITION_DROPDOWN}>
        <div className="absolute left-2 right-2 top-full mt-1.5 z-50">
          <WorkspaceDropdownMenu
            current={workspaceInfo}
            others={others}
            isSwitching={isSwitching}
            onSwitch={id => {
              setOpen(false);
              handleSwitch(id);
            }}
            onCreateTeam={() => setIsCreateTeamOpen(true)}
          />
        </div>
      </Transition>

      <CreateTeamModal
        isOpen={isCreateTeamOpen}
        onClose={() => setIsCreateTeamOpen(false)}
        onSuccess={() => {
          refetchBoth();
          toast.success("Workspace created successfully");
          setIsCreateTeamOpen(false);
        }}
      />
    </div>
  );
}

// =====================================
// ⬢  Workspace Switcher
// =====================================
export default function WorkspaceSwitcher({
  collapsed,
}: WorkspaceSwitcherProps) {
  const switcherState = useWorkspaceSwitcher();

  if (switcherState.isLoading && !switcherState.workspaceInfo) {
    return <WorkspaceSwitcherSkeleton collapsed={collapsed} />;
  }

  if (!switcherState.workspaceInfo) return null;

  return collapsed ? (
    <CollapsedSwitcher {...switcherState} />
  ) : (
    <ExpandedSwitcher {...switcherState} />
  );
}
