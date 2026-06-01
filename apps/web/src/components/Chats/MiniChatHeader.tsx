"use client";

import React from "react";
import { PiPlus, PiClockCounterClockwise } from "react-icons/pi";

import { CloseIconButton } from "@/components/CloseIconButton";

import { AIChatIcon } from "../Assets/AIChatIcon";

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
  <header className="flex items-center gap-2 px-3 pt-3 pb-2.5 bg-white dark:bg-base-100 border-b border-border-secondary dark:border-border-secondary">
    <div
      className="flex-shrink-0 flex items-center justify-center w-7 h-7
      rounded-lg border border-[#DEE2E6] dark:border-[#3A3A38]
      bg-white dark:bg-[#252523]"
    >
      <AIChatIcon />
    </div>

    <div className="flex-1 min-w-0">
      {activeThreadTitle ? (
        <h3 className="text-[13px] font-medium text-ink-100 dark:text-white truncate leading-tight">
          {activeThreadTitle}
        </h3>
      ) : (
        <>
          <h3 className="text-[13px] font-medium text-ink-100 dark:text-white leading-tight">
            Sandworm agent
          </h3>
          <p className="text-[11px] text-ink-400 dark:text-ink-500 leading-tight mt-0.5">
            Create deep and insightful analysis
          </p>
        </>
      )}
    </div>

    <div className="flex items-center gap-0.5 flex-shrink-0">
      <button
        type="button"
        aria-label="New thread"
        onClick={onNewThread}
        className="flex items-center justify-center w-7 h-7 rounded-lg
          text-ink-400 hover:text-ink-500 hover:bg-[#F1F3F4] dark:hover:bg-[#2A2A28]
          transition-colors"
      >
        <PiPlus size={15} />
      </button>
      <button
        type="button"
        aria-label="Threads"
        onClick={onOpenThreads}
        className="flex items-center justify-center w-7 h-7 rounded-lg
          text-ink-400 hover:text-ink-500 hover:bg-[#F1F3F4] dark:hover:bg-[#2A2A28]
          transition-colors"
      >
        <PiClockCounterClockwise size={15} />
      </button>
      <CloseIconButton onClick={onCancel} size="sm" />
    </div>
  </header>
);
