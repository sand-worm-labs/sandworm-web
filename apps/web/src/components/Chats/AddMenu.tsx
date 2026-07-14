import React, { useState, useEffect, useRef } from "react";
import {
  PiPaperclip,
  PiStackSimple,
  PiPlugsConnected,
  PiCaretRight,
} from "react-icons/pi";

import { ReferencePicker } from "./ReferencePicker";
import type { AttachedReference, ReferenceSource } from "./types";

// =====================================
// ⬢ Types
// =====================================

type AddMenuView = "root" | "blocks" | "connections";

export interface AddMenuProps {
  sources: ReferenceSource[];
  selectedIds: Set<string>;
  hasReferencableItems: boolean;
  onSelectReference: (ref: AttachedReference) => void;
  onAddFiles: () => void;
  onClose: () => void;
}

// =====================================
// ⬢ Menu Row
// =====================================

interface AddMenuRowProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  showChevron?: boolean;
}

function AddMenuRow({
  icon,
  label,
  onClick,
  disabled,
  showChevron,
}: AddMenuRowProps) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors duration-75
        disabled:opacity-40 disabled:cursor-not-allowed
        hover:bg-[#F9F5FF] dark:hover:bg-[#1A0D26]"
    >
      <span
        className="flex-shrink-0 flex items-center justify-center w-[26px] h-[26px]
        rounded-md border border-[#DEE2E6] dark:border-[#3A3A38]
        bg-white dark:bg-[#252523] text-ink-400 dark:text-ink-400"
      >
        {icon}
      </span>
      <span className="flex-1 text-[12.5px] font-medium text-ink-500 dark:text-ink-200">
        {label}
      </span>
      {showChevron && (
        <PiCaretRight
          size={12}
          className="flex-shrink-0 text-ink-300 dark:text-ink-600"
        />
      )}
    </button>
  );
}

// =====================================
// ⬢ Data Connection Panel
// =====================================


function DataConnectionPanel() {
  return (
    <div
      className="absolute bottom-[calc(100%+6px)] left-0 right-0 z-50 flex flex-col
        bg-white dark:bg-[#1C1C1A]
        border border-border-tertiary dark:border-[#2E2E2C]
        rounded-2xl
        shadow-[0_-2px_16px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.10)]
        overflow-hidden"
    >
      <div
        className="flex items-center gap-2 px-3 py-2.5
        border-b border-[#F1F3F4] dark:border-[#2A2A28]"
      >
        <PiPlugsConnected
          size={13}
          className="text-ink-300 dark:text-ink-600 flex-shrink-0"
        />
        <span className="text-[12.5px] font-medium text-ink-500 dark:text-ink-200">
          Data connections
        </span>
      </div>
      <div className="flex flex-col items-center justify-center py-8 gap-2">
        <p className="text-[11.5px] text-ink-300 dark:text-ink-500 text-center px-6">
          Connecting external data sources is coming soon.
        </p>
      </div>
    </div>
  );
}

// =====================================
// ⬢ Add Menu
// =====================================

export function AddMenu({
  sources,
  selectedIds,
  hasReferencableItems,
  onSelectReference,
  onAddFiles,
  onClose,
}: AddMenuProps) {
  const [view, setView] = useState<AddMenuView>("root");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [onClose]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // A single stable wrapper keeps `containerRef` attached across view
  // changes — without it, the outside-click listener would see a null
  // ref while a sub-view is showing and close the menu on the next click.
  return (
    <div ref={containerRef}>
      {view === "root" && (
        <div
          role="menu"
          aria-label="Add to message"
          className="absolute bottom-[calc(100%+6px)] left-0 z-50 w-[280px] flex flex-col
            bg-white dark:bg-[#1C1C1A]
            border border-border-tertiary dark:border-[#2E2E2C]
            rounded-2xl
            shadow-[0_-2px_16px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.10)]
            overflow-hidden py-1.5"
        >
          <AddMenuRow
            icon={<PiPaperclip size={14} />}
            label="Add files or images"
            onClick={onAddFiles}
          />
          <AddMenuRow
            icon={<PiStackSimple size={14} />}
            label="Add blocks, outputs, table etc"
            onClick={() => setView("blocks")}
            disabled={!hasReferencableItems}
            showChevron
          />
          <AddMenuRow
            icon={<PiPlugsConnected size={14} />}
            label="Select data connection"
            onClick={() => setView("connections")}
            showChevron
          />
        </div>
      )}

      {view === "blocks" && (
        <ReferencePicker
          sources={sources}
          selectedIds={selectedIds}
          onSelect={onSelectReference}
          onClose={onClose}
        />
      )}

      {view === "connections" && <DataConnectionPanel />}
    </div>
  );
}
