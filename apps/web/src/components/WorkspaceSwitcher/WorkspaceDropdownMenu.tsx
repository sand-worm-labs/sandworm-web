"use client";

import React from "react";
import clsx from "clsx";
import { PiGear, PiPlus, PiCheck } from "react-icons/pi";

import type { ApiWorkspace } from "@/types";

import {
  iconButtonSmClassName,
  surfaceHoverClassName,
} from "@/styles/interactive";

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
  onWorkspaceSettings?: (id: string) => void;
}

// =====================================
// ⬢ Shared row styles
// =====================================
const ROW_OUTER =
  "flex w-[calc(100%-0.75rem)] mx-1.5 items-center gap-1.5 px-2 py-1.5 rounded-xl";
const ROW_HOVER = surfaceHoverClassName;
const ROW_MAIN =
  "flex flex-1 min-w-0 items-center gap-2.5 text-left disabled:opacity-50 disabled:cursor-not-allowed";

// =====================================
// ⬢ Settings Button
// =====================================
function SettingsButton({
  label,
  onClick,
}: {
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={e => {
        e.stopPropagation();
        onClick?.();
      }}
      aria-label={label}
      title={label}
      className={iconButtonSmClassName}
    >
      <PiGear size={14} />
    </button>
  );
}

// =====================================
// ⬢ Workspace Row
// =====================================
function WorkspaceMenuRow({
  icon,
  name,
  isActive,
  disabled,
  onSelect,
  onSettings,
}: {
  icon?: string;
  name: string;
  isActive?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  onSettings?: () => void;
}) {
  const MainTag = onSelect ? "button" : "div";

  return (
    <div className={clsx(ROW_OUTER, ROW_HOVER)}>
      <MainTag
        type={onSelect ? "button" : undefined}
        onClick={onSelect}
        disabled={disabled}
        className={clsx(ROW_MAIN, onSelect && "cursor-pointer")}
      >
        <div className="flex-shrink-0">
          <WorkspaceIcon icon={icon} size={24} className="rounded-lg" />
        </div>
        <span className="flex-1 min-w-0 text-[13px] font-medium text-ink-100 truncate capitalize">
          {name}
        </span>
      </MainTag>

      {isActive && (
        <span
          className="flex-shrink-0 w-5 h-5 rounded-full border border-[#7F56D9]
            flex items-center justify-center"
          aria-hidden
        >
          <PiCheck size={12} className="text-[#7F56D9]" />
        </span>
      )}

      <SettingsButton label={`${name} settings`} onClick={onSettings} />
    </div>
  );
}

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
  onWorkspaceSettings,
}: WorkspaceDropdownMenuProps) {
  return (
    <div
      className={clsx(
        "z-50 bg-white dark:bg-base-400 min-w-[12rem]",
        "border border-[#E9ECEF] dark:border-border-tertiary",
        "rounded-xl shadow-lg overflow-hidden relative",
        containerClassName
      )}
    >
      <div className="flex flex-col gap-0.5 py-1.5">
        <WorkspaceMenuRow
          icon={current.icon}
          name={current.name}
          isActive
          onSettings={() => onWorkspaceSettings?.(current.id)}
        />

        {others.map(workspace => (
          <WorkspaceMenuRow
            key={workspace.id}
            icon={workspace.icon}
            name={workspace.name}
            disabled={isSwitching}
            onSelect={() => onSwitch(workspace.id)}
            onSettings={() => onWorkspaceSettings?.(workspace.id)}
          />
        ))}
      </div>

      <div className="py-1.5">
        <button
          type="button"
          onClick={onCreateTeam}
          className={clsx(
            ROW_OUTER,
            ROW_HOVER,
            "w-[calc(100%-0.75rem)] cursor-pointer"
          )}
        >
          <span className="flex-1 text-[13px] font-medium text-ink-100 text-left">
            Create new workspace
          </span>
          <span
            className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-md
              text-ink-300"
            aria-hidden
          >
            <PiPlus size={14} />
          </span>
        </button>
      </div>
    </div>
  );
}
