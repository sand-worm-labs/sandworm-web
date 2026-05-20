"use client";

import React from "react";

import { ThinkingPart } from "./ThinkingPart";
import { BlockActionGroup } from "./BlockActionGroup";
import { ToolCallRow, ToolResultRow } from "./ToolRows";
import type { PartPayload, BlockActionPart } from "./parts.types";

// =====================================
// ⬢ Utils
// =====================================

// Groups consecutive block_action parts together so they render
// as a single collapsible group instead of N individual rows.
function groupParts(
  parts: PartPayload[]
): Array<PartPayload | BlockActionPart[]> {
  const result: Array<PartPayload | BlockActionPart[]> = [];
  let i = 0;

  while (i < parts.length) {
    const part = parts[i];
    if (part.type === "block_action") {
      const group: BlockActionPart[] = [];
      while (i < parts.length && parts[i].type === "block_action") {
        group.push(parts[i] as BlockActionPart);
        i++;
      }
      result.push(group);
    } else {
      result.push(part);
      i++;
    }
  }

  return result;
}

// =====================================
// ⬢ MessageParts
// =====================================

interface MessagePartsProps {
  parts: PartPayload[];
  onFollowUpSubmit?: (answers: Record<string, string>) => void;
  onAcceptAll?: () => void;
  onRejectAll?: () => void;
  disabled?: boolean;
}

export function MessageParts({ parts, disabled }: MessagePartsProps) {
  if (!parts || parts.length === 0) return null;

  // Only render non-interactive parts here.
  // pending_review and follow_up are rendered separately
  // below the ChatBubble in MiniChatMessages.
  const renderableParts = parts.filter(
    p => p.type !== "pending_review" && p.type !== "follow_up"
  );

  if (renderableParts.length === 0) return null;

  const grouped = groupParts(renderableParts);

  return (
    <div className="flex flex-col gap-1.5 w-full max-w-[98%]">
      {grouped.map((item, idx) => {
        // ─── Block action group ──────────────────────
        if (Array.isArray(item)) {
          return <BlockActionGroup key={`group-${idx}`} parts={item} />;
        }

        // ─── Thinking ────────────────────────────────
        if (item.type === "thinking") {
          return <ThinkingPart key={idx} part={item} />;
        }

        // ─── Tool call ───────────────────────────────
        if (item.type === "tool_call") {
          return <ToolCallRow key={idx} part={item} />;
        }

        // ─── Tool result ─────────────────────────────
        if (item.type === "tool_result") {
          return <ToolResultRow key={idx} part={item} />;
        }

        // ─── Error ───────────────────────────────────
        if (item.type === "error") {
          return (
            <div
              key={idx}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg
                border border-[#FAECE7] dark:border-[#2A1510]
                bg-white dark:bg-[#1C1C1A]
                text-[11.5px] text-[#D85A30]"
            >
              {item.message}
              {item.retryable && (
                <span className="ml-auto text-[10px] text-ink-300">
                  retryable
                </span>
              )}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
