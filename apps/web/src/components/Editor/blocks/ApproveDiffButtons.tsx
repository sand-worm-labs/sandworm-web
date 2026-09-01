import clsx from "clsx";
import {
  PiCheck,
  PiX,
  PiArrowCounterClockwise,
  PiArrowBendDownLeft,
} from "react-icons/pi";

import type { AiBlockStatus } from "../hooks/useAiDiff";

// =====================================
// ⬢ Types
// =====================================

interface Props {
  visible: boolean;
  status?: AiBlockStatus;
  onAccept: () => void;
  onReject: () => void;
  onUndo?: () => void;
  canTry: boolean;
  onTry: () => void;
  currentIndex?: number;
  totalAi?: number;
}

// =====================================
// ⬢ ApproveDiffButtons
// =====================================

function ApproveDiffButtons({
  visible,
  status,
  onAccept,
  onReject,
  onUndo,
  canTry,
  onTry,
  currentIndex,
  totalAi,
}: Props) {
  if (!visible) return null;

  // ── Post-action state ──
  if (status === "accepted" || status === "rejected") {
    const isAccepted = status === "accepted";

    return (
      <div
        className="print:hidden mx-auto mb-3 px-3 py-2 flex w-[96%] justify-start items-center gap-x-2.5
        rounded-xl border border-border-secondary dark:border-base-700
        bg-white dark:bg-base-730"
      >
        <span
          className={clsx(
            "inline-flex items-center gap-x-1 px-2 py-0.5 rounded-md text-[12px] font-medium",
            isAccepted
              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
              : "bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400"
          )}
        >
          {isAccepted ? <PiCheck size={12} /> : <PiX size={12} />}
          {isAccepted ? "Accepted" : "Rejected"}
        </span>

        <button
          type="button"
          onClick={onUndo}
          className="flex items-center gap-x-1 px-2 py-0.5 rounded-md
            text-[12px] text-ink-300 dark:text-ink-600
            hover:text-ink-500 dark:hover:text-ink-400
            transition-colors"
        >
          <PiArrowCounterClockwise size={12} /> Undo
        </button>
      </div>
    );
  }

  return (
    <div
      className="print:hidden mx-auto mb-3 px-3 py-2 flex w-[96%] justify-between items-center
      rounded-xl border border-border-secondary dark:border-base-700
      bg-white dark:bg-base-730"
    >
      <span
        className="inline-flex items-center gap-x-1.5 px-2.5 py-1 rounded-md
        bg-[#ECEAF8] dark:bg-[#2A2440]
        text-[#6B5ED6] dark:text-[#9D8FF0]
        text-[12px] font-medium select-none"
      >
        {currentIndex !== undefined && totalAi !== undefined
          ? `${currentIndex + 1}/${totalAi} pending`
          : "pending"}
      </span>

      <div className="flex items-center gap-x-2">
        <button
          type="button"
          onClick={onTry}
          disabled={!canTry}
          className="flex items-center gap-x-1.5 px-3 py-1 rounded-lg
            border-none dark:border-base-700
            bg-transparent dark:bg-base-730
            text-ink-400 dark:text-ink-500
            hover:border-ink-300 hover:text-ink-500
            disabled:opacity-40 disabled:cursor-not-allowed
            text-[12px] transition-colors"
        >
          Try
        </button>

        <button
          type="button"
          onClick={onReject}
          className="flex items-center gap-x-1.5 px-3 py-1 rounded-lg
            border border-hover-border dark:border-base-700
            bg-white dark:bg-base-730
            text-ink-400 dark:text-ink-500
            hover:border-red-400/50 hover:text-red-500
            text-[12px] transition-colors"
        >
          Reject
        </button>

        <button
          type="button"
          onClick={onAccept}
          className="flex items-center gap-x-1.5 px-3 py-1 rounded-lg
            bg-primary hover:bg-ink-100
            dark:bg-white dark:hover:bg-gray-100
            text-white dark:text-base-400
            text-[12px] transition-colors"
        >
          Accept <PiArrowBendDownLeft size={12} />
        </button>
      </div>
    </div>
  );
}

export default ApproveDiffButtons;
