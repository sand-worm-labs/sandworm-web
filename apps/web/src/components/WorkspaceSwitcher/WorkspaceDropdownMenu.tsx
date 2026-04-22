"use client";

import React from "react";
import clsx from "clsx";

import type { ApiWorkspace } from "@/types";

import { WorkspaceIcon } from "../Settings/WorkspaceIcon";

// =====================================
// ⬢ Types
// =====================================
interface WorkspaceDropdownMenuProps {
  current: { id: string; name: string; icon: string };
  others: ApiWorkspace[];
  isSwitching: boolean;
  containerClassName?: string;
  onSwitch: (id: string) => void;
  onCreateTeam: () => void;
}

// =====================================
// ⬢ Workspace Row
// =====================================
const WorkspaceRow = ({
  icon,
  name,
  disabled,
  onClick,
  badge,
}: {
  icon?: string;
  name: string;
  disabled?: boolean;
  onClick?: () => void;
  badge?: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={clsx(
      "w-full flex items-center gap-3 px-3 py-2 text-left transition-colors",
      "hover:bg-[#F8F9FA] dark:hover:bg-[#181C21]",
      disabled && "opacity-50 cursor-not-allowed"
    )}
  >
    <div className="flex-shrink-0">
      <WorkspaceIcon icon={icon} size={28} className="rounded-lg" />
    </div>
    <span className="flex-1 xl:text-sm text-[13px] font-medium text-ink-100 truncate">
      {name}
    </span>
    {badge}
  </button>
);

const Divider = () => (
  <div className="h-px bg-[#E9ECEF] dark:bg-border-tertiary" />
);

// =====================================
// ⬢ Main Component
// =====================================
export function WorkspaceDropdownMenu({
  current,
  others,
  isSwitching,
  containerClassName,
  onSwitch,
  onCreateTeam,
}: WorkspaceDropdownMenuProps) {
  return (
    <div
      className={clsx(
        "z-50 bg-white dark:bg-base-400 min-w-[12rem]",
        "border border-[#E9ECEF] dark:border-border-tertiary",
        "rounded-xl shadow-lg overflow-hidden",
        containerClassName
      )}
    >
      {/* ✦ Current Workspace Header ✦ */}
      <div className="flex items-center gap-3 px-3 py-2.5 bg-[#F8F9FA] dark:bg-base-400">
        <div className="flex-shrink-0">
          <WorkspaceIcon icon={current.icon} size={28} className="rounded-lg" />
        </div>
        <span className="flex-1 text-sm font-medium text-ink-100 truncate">
          {current.name}
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

      {/* ✦ Other Workspaces ✦ */}
      {others.length > 0 && (
        <>
          <Divider />
          {others.map(workspace => (
            <WorkspaceRow
              key={workspace.id}
              icon={workspace.icon}
              name={workspace.name}
              disabled={isSwitching}
              onClick={() => onSwitch(workspace.id)}
            />
          ))}
        </>
      )}

      <Divider />

      {/* ✦ Create Team ✦ */}
      <button
        type="button"
        onClick={onCreateTeam}
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
  );
}
