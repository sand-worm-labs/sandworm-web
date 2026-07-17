"use client";

import { PiCaretUp, PiCaretDown, PiX, PiCheck } from "react-icons/pi";
import clsx from "clsx";

// =====================================
// ⬢ Types
// =====================================

interface AiDiffToolbarProps {
  visible: boolean;
  pendingCount: number;
  totalAi: number;
  accepted: number;
  rejected: number;
  currentIndex?: number;
  currentLabel?: string;
  currentDescription?: string;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onAcceptCurrent?: () => void;
  onRejectCurrent?: () => void;
}

// =====================================
// ⬢ AiDiffToolbar
// =====================================

function AiDiffToolbar({
  visible,
  pendingCount,
  totalAi,
  accepted,
  currentIndex,
  currentLabel,
  currentDescription,
  onAcceptAll,
  onRejectAll,
  onPrev,
  onNext,
  onAcceptCurrent,
  onRejectCurrent,
}: AiDiffToolbarProps) {
  if (!visible) return null;

  const allReviewed = pendingCount === 0;
  const hasCurrent = currentLabel !== undefined;

  return (
    <div className="print:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-stretch w-[500px] max-w-[calc(100vw-48px)]">
      {hasCurrent && (
        <div
          className="flex items-center gap-4 px-5 py-2.5
          bg-white dark:bg-base-730
          border border-b-0 border-border-secondary dark:border-base-700
          rounded-t-2xl"
        >
          {currentIndex !== undefined && (
            <span className="text-[11px] text-ink-300 dark:text-ink-600 tabular-nums flex-shrink-0">
              {currentIndex + 1} / {totalAi}
            </span>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-ink-500 dark:text-ink-200 truncate">
              {currentLabel}
            </p>
            {currentDescription && (
              <p className="text-[10.5px] text-ink-300 dark:text-ink-600 truncate">
                {currentDescription}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={onRejectCurrent}
              className="flex items-center justify-center w-7 h-7 rounded-lg
                border border-border-secondary dark:border-base-700
                text-ink-400 dark:text-ink-500
                hover:border-warning/50 hover:text-warning
                transition-colors"
            >
              <PiX size={13} />
            </button>
            <button
              type="button"
              onClick={onAcceptCurrent}
              className="flex items-center justify-center w-7 h-7 rounded-lg
                bg-primary hover:bg-primary-710 text-white
                transition-colors"
            >
              <PiCheck size={13} />
            </button>
          </div>
        </div>
      )}

      <div
        className={clsx(
          "flex items-center justify-between gap-4 px-5 py-2",
          "bg-white dark:bg-base-730",
          "border border-border-tertiary dark:border-base-700",
          " dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]",
          hasCurrent ? "rounded-b-2xl" : "rounded-2xl"
        )}
      >
        <div className="flex items-center gap-3">
          {allReviewed ? (
            <PiCheck size={14} className="text-primary flex-shrink-0" />
          ) : (
            <span className="w-3.5 h-3.5 rounded-full border-[1.5px] border-base-300 border-t-[#A308F0] animate-spin flex-shrink-0" />
          )}

          <span className="text-[13px] font-medium text-ink-500 dark:text-ink-200">
            {allReviewed
              ? "All reviewed"
              : `${accepted} of ${totalAi} reviewed`}
          </span>

          <div className="w-px h-4 bg-border-secondary dark:bg-base-700" />

          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={onPrev}
              disabled={!onPrev || (currentIndex ?? 0) === 0}
              aria-label="Previous change"
              className="flex items-center justify-center w-7 h-7 rounded-lg
                text-ink-400 dark:text-ink-500
                hover:bg-base-300 dark:hover:bg-base-700
                disabled:opacity-90 disabled:cursor-not-allowed
                transition-colors"
            >
              <PiCaretUp size={13} />
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!onNext || (currentIndex ?? 0) >= totalAi - 1}
              aria-label="Next change"
              className="flex items-center justify-center w-7 h-7 rounded-lg
                text-ink-400 dark:text-ink-500
                hover:bg-base-300 dark:hover:bg-base-700
                disabled:opacity-90 disabled:cursor-not-allowed
                transition-colors"
            >
              <PiCaretDown size={13} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <button
              type="button"
              onClick={onRejectAll}
              className="px-3.5 py-1.5 rounded-lg text-[12px] font-medium
                text-ink-400 dark:text-ink-500
                border border-border-secondary dark:border-base-700
                hover:border-error hover:text-error
                transition-colors"
            >
              Decline all
            </button>
          )}

          {pendingCount > 0 && (
            <button
              type="button"
              onClick={onAcceptAll}
              className="px-3.5 py-1.5 rounded-lg text-[12px] font-medium
                bg-base-400 hover:bg-ink-100 text-white
                transition-colors"
            >
              Accept all
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AiDiffToolbar;
