/* eslint-disable react/no-array-index-key */

"use client";

import React from "react";

import { ThinkingPart } from "./ThinkingPart";
import { BlockActionGroup } from "./BlockActionGroup";
import { ToolCallRow, ToolResultRow } from "./ToolRows";
import type { PartPayload, BlockActionPart } from "./parts.types";

// =====================================
// ⬢ Utils
// =====================================

function groupParts(
  parts: PartPayload[]
): Array<PartPayload | BlockActionPart[]> {
  const result: Array<PartPayload | BlockActionPart[]> = [];
  let i = 0;

  while (i < parts.length) {
    const part = parts[i];

    if (part?.type === "block_action") {
      const group: BlockActionPart[] = [];
      while (i < parts.length) {
        const next = parts[i];
        if (!next || next.type !== "block_action") break;
        group.push(next as BlockActionPart);
        i += 1;
      }
      result.push(group);
    } else {
      result.push(part);
      i += 1;
    }
  }

  return result;
}

// =====================================
// ⬢ MessageParts
// =====================================

interface MessagePartsProps {
  parts: PartPayload[];
  isLoading?: boolean;
}

export function MessageParts({ parts, isLoading = false }: MessagePartsProps) {
  if (!parts || parts.length === 0) return null;

  const renderableParts = parts.filter(
    p => p.type !== "pending_review" && p.type !== "follow_up"
  );

  if (renderableParts.length === 0) return null;

  const lastRenderableIdx = isLoading ? renderableParts.length - 1 : -1;

  const grouped = groupParts(renderableParts);

  let flatCursor = 0;

  return (
    <div
      className="chat-bubble-in flex flex-col gap-1.5 max-w-full rounded-2xl rounded-bl-sm
        dark:border dark:border-border-tertiary
        bg-white dark:bg-chat-assistant-surface px-3 py-2.5"
    >
      {grouped.map((item, idx) => {
        if (Array.isArray(item)) {
          const groupStart = flatCursor;
          flatCursor += item.length;
          return <BlockActionGroup key={`group-${idx}`} parts={item} />;
        }

        const currentFlat = flatCursor;
        flatCursor += 1;

        if (item.type === "thinking") {
          return (
            <ThinkingPart
              key={idx}
              part={item}
              isActive={currentFlat === lastRenderableIdx}
            />
          );
        }

        if (item.type === "tool_call") {
          return <ToolCallRow key={idx} part={item} />;
        }

        if (item.type === "tool_result") {
          return <ToolResultRow key={idx} part={item} />;
        }

        if (item.type === "error") {
          return (
            <div
              key={idx}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg
                border border-error-tint dark:border-[#2A1510]
                bg-white dark:bg-base-730
                text-[11.5px] text-warning"
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
