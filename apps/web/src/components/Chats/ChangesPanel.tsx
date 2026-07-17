"use client";

import { useState } from "react";
import {
  PiCheck,
  PiX,
  PiCaretDown,
  PiPlus,
  PiPencilSimple,
  PiMinus,
} from "react-icons/pi";

// =====================================
// ⬢ Types
// =====================================

export interface Change {
  id: string;
  type: "added" | "modified" | "deleted";
  label: string;
  description: string;
}

interface ChangesPanelCompactProps {
  changes?: Change[];
  onConfirm?: (acceptedIds: string[]) => void;
  onUndo?: () => void;
}

// =====================================
// ⬢ Constants
// =====================================

const TYPE_META = {
  added: {
    icon: <PiPlus size={14} />,
    color: "#1D9E75",
    bg: "#E1F5EE",
    label: "added",
  },
  modified: {
    icon: <PiPencilSimple size={14} />,
    color: "#EF9F27",
    bg: "#FEF5E7",
    label: "modified",
  },
  deleted: {
    icon: <PiMinus size={14} />,
    color: "#D85A30",
    bg: "#FAECE7",
    label: "deleted",
  },
} as const;

const mockChanges: Change[] = [
  {
    id: "change-1",
    type: "added",
    label: "Lazarus laundered funds across E...",
    description: "Lazarus laundered funds a...",
  },
  {
    id: "change-2",
    type: "modified",
    label: "Updated transaction reference",
    description: "Modified reference ID",
  },
];

// =====================================
// ⬢ ChangesPanelCompact
// =====================================

export default function ChangesPanelCompact({
  changes: propChanges,
  onConfirm,
  onUndo,
}: ChangesPanelCompactProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [changes, setChanges] = useState<Change[]>(propChanges ?? mockChanges);
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());
  const [declinedIds, setDeclinedIds] = useState<Set<string>>(new Set());

  const handleAccept = (id: string) => {
    setDeclinedIds(prev => {
      const s = new Set(prev);
      s.delete(id);
      return s;
    });
    setAcceptedIds(prev => new Set([...prev, id]));
  };

  const handleDecline = (id: string) => {
    setAcceptedIds(prev => {
      const s = new Set(prev);
      s.delete(id);
      return s;
    });
    setDeclinedIds(prev => new Set([...prev, id]));
  };

  const handleConfirm = () => {
    const accepted = Array.from(acceptedIds);
    onConfirm?.(accepted);
    setChanges(prev => prev.filter(c => !acceptedIds.has(c.id)));
    setAcceptedIds(new Set());
    setDeclinedIds(new Set());
  };

  const handleUndo = () => {
    onUndo?.();
    setAcceptedIds(new Set());
    setDeclinedIds(new Set());
  };

  return (
    <div className="w-full rounded-t-xl border border-border-secondary dark:border-base-700 overflow-hidden bg-base-300 dark:bg-base-730">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border-secondary dark:border-base-700">
        <button
          type="button"
          onClick={() => setIsExpanded(v => !v)}
          className="flex items-center gap-1.5 cursor-pointer"
        >
          <PiCaretDown
            size={12}
            className={`text-ink-300 dark:text-ink-600 transition-transform duration-200 ${isExpanded ? "rotate-0" : "-rotate-90"}`}
          />
          <span
            className="inline-flex items-center justify-center w-4 h-4 rounded-full
              text-[9px] font-bold text-white"
            style={{ background: "#A308F0" }}
          >
            {changes.length}
          </span>
          <span className="text-[11.5px] font-medium text-ink-400 dark:text-ink-400">
            pending review
          </span>
        </button>

        <div className="flex gap-1">
          <button
            type="button"
            onClick={handleUndo}
            className="px-2 py-1 rounded-lg text-[11px] font-medium
              text-ink-400 dark:text-ink-500
              border border-border-secondary dark:border-base-700
              hover:bg-base-300 dark:hover:bg-base-700
              transition-colors"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={acceptedIds.size === 0}
            className="px-2 py-1 rounded-lg text-[11px] font-medium
              bg-primary hover:bg-primary-710 text-white
              disabled:bg-[#E4C4F9] dark:disabled:bg-[#2A1040]
              disabled:cursor-not-allowed
              transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>

      {/* ─── List ─── */}
      <div
        className={`transition-all duration-300 overflow-hidden ${isExpanded ? "max-h-80" : "max-h-0"}`}
      >
        <div className="p-2 space-y-1">
          {changes.map(change => {
            const isAccepted = acceptedIds.has(change.id);
            const isDeclined = declinedIds.has(change.id);
            const meta = TYPE_META[change.type];

            return (
              <div
                key={change.id}
                className={`group flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all duration-150
                  ${
                    isDeclined
                      ? "bg-error-tint dark:bg-error-shade border-error-tint dark:border-[#2A1510] opacity-60"
                      : isAccepted
                        ? "bg-[#E1F5EE] dark:bg-[#081A12] border-[#E1F5EE] dark:border-[#0D2A1C]"
                        : "bg-white dark:bg-base-730 border-border-secondary dark:border-base-700 hover:border-primary/40"
                  }`}
              >
                {/* Type icon */}
                <span
                  className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-md text-[14px] text-ink-700 border border-[#B1DDE8]"
                  style={{ display: "flex", flexShrink: 0 }}
                >
                  {meta.icon}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-[11.5px] font-medium text-ink-500 dark:text-ink-200 leading-tight truncate">
                    {change.label}
                  </p>
                  <p className="text-[10px] text-ink-300 dark:text-ink-600 truncate">
                    {change.description}
                  </p>
                </div>

                {/* Accept / Decline */}
                <div
                  className={`flex gap-0.5 flex-shrink-0 transition-opacity duration-150
                    ${isAccepted || isDeclined ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                >
                  <button
                    type="button"
                    onClick={() => handleAccept(change.id)}
                    className="p-1 rounded-md hover:bg-[#E1F5EE] dark:hover:bg-[#081A12] transition-colors"
                    title="Accept"
                  >
                    <PiCheck
                      size={13}
                      className={
                        isAccepted
                          ? "text-[#1D9E75]"
                          : "text-ink-300 dark:text-ink-600"
                      }
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDecline(change.id)}
                    className="p-1 rounded-md hover:bg-error-tint dark:hover:bg-error-shade transition-colors"
                    title="Decline"
                  >
                    <PiX
                      size={13}
                      className={
                        isDeclined
                          ? "text-warning"
                          : "text-ink-300 dark:text-ink-600"
                      }
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
