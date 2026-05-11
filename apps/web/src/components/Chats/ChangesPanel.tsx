"use client";

import { useState } from "react";
import { Check, X, ChevronDown } from "lucide-react";

// ===================================
// ⬢ MOCK DATA
// ===================================

const mockChanges = [
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

const typeIcons: Record<string, string> = {
  added: "⊕",
  modified: "✎",
  deleted: "−",
};

// ===================================
// ⬢ COMPONENT
// ===================================

export default function ChangesPanelCompact() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [changes, setChanges] = useState(mockChanges);
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());
  const [declinedIds, setDeclinedIds] = useState<Set<string>>(new Set());

  const handleAccept = (id: string) => {
    const newDeclined = new Set(declinedIds);
    newDeclined.delete(id);
    setDeclinedIds(newDeclined);
    setAcceptedIds(new Set([...acceptedIds, id]));
  };

  const handleDecline = (id: string) => {
    const newAccepted = new Set(acceptedIds);
    newAccepted.delete(id);
    setAcceptedIds(newAccepted);
    setDeclinedIds(new Set([...declinedIds, id]));
  };

  const handleConfirm = () => {
    console.log("Confirmed changes:", Array.from(acceptedIds));
    setChanges(changes.filter(c => !acceptedIds.has(c.id)));
    setAcceptedIds(new Set());
    setDeclinedIds(new Set());
  };

  const handleUndo = () => {
    setAcceptedIds(new Set());
    setDeclinedIds(new Set());
  };

  const pendingCount = changes.length;

  return (
    <div className="w-full">
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between bg-white px-3 py-2 rounded-t-xl border border-border-tertiary">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 text-accent font-semibold text-xs cursor-pointer"
        >
          <ChevronDown
            size={16}
            className={`transition-transform duration-300 ${
              isExpanded ? "rotate-0" : "-rotate-90"
            }`}
          />
          <span className="inline-block px-2 py-0.5 bg-primary rounded-full text-accent font-bold">
            {pendingCount}
          </span>
          pending
        </button>

        <div className="flex gap-1">
          <button
            type="button"
            onClick={handleUndo}
            className="px-2 py-1 rounded-lg bg-white hover:bg-primary/50 text-accent text-xs font-medium transition-colors duration-200 border border-border-secondary"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={acceptedIds.size === 0}
            className="px-2 py-1 rounded-lg bg-primary hover:bg-primary disabled:bg-[#868E96] text-white text-xs font-medium transition-colors duration-200"
          >
            Confirm
          </button>
        </div>
      </div>

      {/* ===== CHANGES LIST ===== */}
      <div
        className={`overflow-hidden bg-white border border-t-0 border-secondary rounded-b-xl transition-all duration-300 ${
          isExpanded ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="p-2 space-y-1.5">
          {changes.map(change => {
            const isAccepted = acceptedIds.has(change.id);
            const isDeclined = declinedIds.has(change.id);

            return (
              <div
                key={change.id}
                className={`group relative flex items-start gap-2 p-2 rounded-lg border transition-all duration-200 ${
                  isDeclined
                    ? "bg-red-100 border-red-300 opacity-60"
                    : isAccepted
                      ? "bg-green-100 border-green-300"
                      : "bg-white border-primary hover:border-primary/80"
                }`}
              >
                {/* Icon */}
                <span className="text-xs mt-0 flex-shrink-0">
                  {typeIcons[change.type]}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 leading-tight">
                    {change.label}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {change.description}
                  </p>
                </div>

                {/* Action Icons */}
                <div
                  className={`flex gap-0.5 flex-shrink-0 transition-opacity duration-200 ${
                    isAccepted || isDeclined
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleAccept(change.id)}
                    className="p-1 rounded-md hover:bg-green-200 transition-colors duration-150"
                    title="Accept"
                  >
                    <Check
                      size={14}
                      className={
                        isAccepted ? "text-green-600" : "text-gray-400"
                      }
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDecline(change.id)}
                    className="p-1 rounded-md hover:bg-red-200 transition-colors duration-150"
                    title="Decline"
                  >
                    <X
                      size={14}
                      className={isDeclined ? "text-red-600" : "text-gray-400"}
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
