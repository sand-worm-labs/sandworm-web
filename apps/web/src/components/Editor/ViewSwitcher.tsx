"use client";

import clsx from "clsx";
import { PiFileText, PiCode, PiCaretDown, PiCheck } from "react-icons/pi";
import type { IconType } from "react-icons";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@sandworm/ui/components/dropdown-menu";

export type NotebookView = "report" | "query";

interface ViewOption {
  id: NotebookView;
  label: string;
  description: string;
  icon: IconType;
}

const VIEWS: ViewOption[] = [
  {
    id: "report",
    label: "Report",
    description: "Rendered output, prose and charts",
    icon: PiFileText,
  },
  {
    id: "query",
    label: "Query",
    description: "SQL, schemas and results per block",
    icon: PiCode,
  },
];

interface ViewSwitcherProps {
  view: NotebookView;
  onChange: (view: NotebookView) => void;
}

export default function ViewSwitcher({ view, onChange }: ViewSwitcherProps) {
  const current = VIEWS.find(v => v.id === view) ?? VIEWS[0]!;
  const CurrentIcon = current.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={clsx(
            "flex items-center gap-2 px-3 py-1.5 rounded-[10px] border text-sm font-medium",
            "border-border-secondary dark:border-border-tertiary",
            "bg-base-100 dark:bg-transparent text-ink-100",
            "hover:bg-hover-bg hover:border-hover-border dark:hover:bg-base-600",
            "transition-colors duration-100"
          )}
        >
          <CurrentIcon size={16} className="text-ink-400" />
          {current.label}
          <PiCaretDown size={14} className="text-ink-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-72 rounded-2xl border border-border-secondary dark:border-border-tertiary dark:bg-dropdown-bg shadow-md p-2"
        align="start"
      >
        {VIEWS.map(v => {
          const Icon = v.icon;
          const isActive = v.id === view;

          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onChange(v.id)}
              className="flex items-start gap-3 w-full px-3 py-2 rounded-[10px] border border-transparent text-left hover:bg-hover-bg hover:border-hover-border dark:hover:bg-dropdown-hover transition-colors"
            >
              <Icon
                size={18}
                className="text-ink-navy dark:text-placeholder-muted mt-0.5 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-ink-100">
                    {v.label}
                  </span>
                  {isActive && <PiCheck size={14} className="text-primary" />}
                </div>
                <p className="text-xs text-ink-400">{v.description}</p>
              </div>
            </button>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
