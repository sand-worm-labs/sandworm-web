"use client";

import React from "react";
import { PiPlus, PiSparkle } from "react-icons/pi";

import { CloseIconButton } from "@/components/CloseIconButton";

// =====================================
// ⬢ MiniChatHeader
// =====================================

interface MiniChatHeaderProps {
  onCancel?: () => void;
  onOpenThreads: () => void;
  onNewThread: () => void;
  activeThreadTitle?: string;
}

export const MiniChatHeader: React.FC<MiniChatHeaderProps> = ({
  onCancel,
  onOpenThreads,
  onNewThread,
  activeThreadTitle,
}) => (
  <header className="flex items-start gap-2 px-3 pt-3 pb-2.5 bg-white dark:bg-base-100 border-b border-border-secondary dark:border-border-secondary">
    <PiSparkle
      size={18}
      className="flex-shrink-0 mt-0.5 text-ink-500 dark:text-ink-300"
    />

    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5 leading-tight">
        <button
          type="button"
          onClick={onOpenThreads}
          className="text-[13px] font-medium text-ink-450 hover:text-ink-500 dark:hover:text-ink-300
            flex-shrink-0 transition-colors"
        >
          History
        </button>
        <span className="flex-shrink-0 w-1 h-1 rounded-full bg-ink-300" />
        <h3 className="text-[13px] font-medium text-ink-100 dark:text-white truncate">
          {activeThreadTitle || "Sandworm agent"}
        </h3>
      </div>
      <p className="text-[11px] text-ink-450 leading-tight mt-0.5 truncate">
        Write queries, generate charts, and get answers in seconds.
      </p>
    </div>

    <div className="flex items-center gap-0.5 flex-shrink-0">
      <button
        type="button"
        aria-label="New thread"
        onClick={onNewThread}
        className="flex items-center justify-center w-7 h-7 rounded-lg
          text-ink-400 hover:text-ink-500 hover:bg-base-300 dark:hover:bg-base-700
          transition-colors"
      >
        <PiPlus size={15} />
      </button>
      <CloseIconButton onClick={onCancel} size="sm" />
    </div>
  </header>
);
