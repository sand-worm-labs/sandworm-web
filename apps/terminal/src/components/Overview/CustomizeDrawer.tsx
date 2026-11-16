"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@sandworm/ui/components/sheet";
import { Switch } from "@sandworm/ui/components/switch";
import { Button } from "@sandworm/ui/kit/button";

import type { LibraryEntry, OverviewBlock } from "@/types";

type CustomizeDrawerProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  blocks: readonly OverviewBlock[];
  hiddenIds: readonly string[];
  onToggle: (id: string) => void;
  onReset: () => void;
  library: readonly LibraryEntry[];
  typeName: string;
};

const sectionLabelClassName = "text-xs font-medium text-ink-400";
const entryClassName =
  "flex items-center gap-2.5 rounded-xl border border-border-secondary bg-block-surface px-2.5";

export function CustomizeDrawer({
  isOpen,
  onOpenChange,
  blocks,
  hiddenIds,
  onToggle,
  onReset,
  library,
  typeName,
}: CustomizeDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 border-hover-border bg-header-surface p-0 font-body text-[13px] text-ink-100 sm:max-w-[400px]">
        <SheetHeader className="gap-1 border-b border-border-secondary px-6 pb-4 pt-5">
          <SheetTitle className="text-base font-medium text-ink-100">
            Customize Overview
          </SheetTitle>
          <SheetDescription className="text-[13px] text-ink-400">
            Show or hide blocks. This only changes your view.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-4">
          <div className="flex flex-col gap-1.5">
            <span className={sectionLabelClassName}>On this page</span>
            {blocks.map(block => (
              <div key={block.id} className={`${entryClassName} h-11`}>
                <span className="flex-1 font-medium">{block.title}</span>
                <Switch
                  checked={!hiddenIds.includes(block.id)}
                  onCheckedChange={() => onToggle(block.id)}
                  aria-label={`Show ${block.title}`}
                />
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1.5">
            <span className={sectionLabelClassName}>Add from the library</span>
            {library.map(entry => (
              <div
                key={entry.id}
                className={`${entryClassName} min-h-12 py-1.5`}
              >
                <span className="flex flex-1 flex-col">
                  <span className="font-medium">{entry.name}</span>
                  <span className="text-xs text-ink-400">
                    {entry.description}
                  </span>
                </span>
                <Button variant="secondary" size="sm" disabled>
                  Add
                </Button>
              </div>
            ))}
          </div>
        </div>
        <SheetFooter className="mt-0 flex-row items-center justify-between gap-3 border-t border-border-secondary px-6 py-3.5">
          <Button variant="link" onClick={onReset} className="font-medium">
            Reset to {typeName} template
          </Button>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
