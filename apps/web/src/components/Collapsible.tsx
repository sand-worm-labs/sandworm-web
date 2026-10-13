"use client";

import { useId, useState } from "react";
import { PiCaretDown } from "react-icons/pi";

import { cn } from "@/lib/utils";

interface CollapsibleProps {
  // The always-visible heading.
  title: React.ReactNode;
  // A line under the title that stays visible while it is closed.
  summary?: React.ReactNode;
  // Sits beside the chevron, such as a status tag.
  trailing?: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  children: React.ReactNode;
}

// =====================================
// ⬢ Collapsible
// =====================================
// A bordered section that opens and closes with a smooth height animation. The height
// animates through the grid-rows trick, so it needs no measuring, and what is hidden
// leaves the tab order once it has finished closing.
export const Collapsible = ({
  title,
  summary,
  trailing,
  defaultOpen = false,
  className,
  children,
}: CollapsibleProps) => {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div
      className={cn(
        "rounded-2xl border border-border-secondary dark:border-white/10 dark:bg-white/[0.03]",
        className
      )}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(value => !value)}
        className="flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3.5 text-left"
      >
        <span className="min-w-0">
          {title}
          {summary && (
            <span className="mt-1 block text-xs text-ink-400 dark:text-white/70">
              {summary}
            </span>
          )}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {trailing}
          <PiCaretDown
            aria-hidden="true"
            className={cn(
              "h-4 w-4 text-ink-400 transition-transform duration-300 dark:text-white/70 motion-reduce:transition-none",
              open && "rotate-180"
            )}
          />
        </span>
      </button>

      <div
        id={panelId}
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div
            aria-hidden={!open}
            className={cn(
              "px-4 pb-4 transition-[visibility] duration-0",
              open ? "visible delay-0" : "invisible delay-300"
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
