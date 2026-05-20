"use client";

import React, { useState } from "react";
import { PiBrain, PiCaretRight } from "react-icons/pi";
import clsx from "clsx";
import { BlockType } from "@sandworm/editor";

import { BlockKindIcon } from "./icons";
import type { ThinkingPart as ThinkingPartType } from "./parts.types";

// =====================================
// ⬢ Constants
// =====================================

const BLOCK_TYPE_TO_KIND: Record<string, BlockType> = {
  SQL: BlockType.SQL,
  PYTHON: BlockType.Python,
  MARKDOWN: BlockType.Markdown,
  VISUALIZATION: BlockType.VisualizationV2,
  VISUALIZATION_V2: BlockType.VisualizationV2,
  POWER_TOOLBOX: BlockType.PowerToolbox,
  RICH_TEXT: BlockType.RichText,
  PIVOT_TABLE: BlockType.PivotTable,
};

// =====================================
// ⬢ ThinkingPart
// =====================================

interface ThinkingPartProps {
  part: ThinkingPartType;
}

export function ThinkingPart({ part }: ThinkingPartProps) {
  const [open, setOpen] = useState(false);
  const seconds = Math.round(part.duration_ms / 1000);
  const label = seconds >= 1 ? `Thought for ${seconds}s` : "Thought";

  return (
    <div
      className="rounded-lg border border-border-secondary dark:border-[#2A2A28]
        bg-white dark:bg-[#1C1C1A] overflow-hidden"
    >
      {/* ─── Header ─── */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2 px-2.5 py-1.5
          text-left transition-colors
          hover:bg-[#F9F9F9] dark:hover:bg-[#222220]"
      >
        <PiBrain size={13} className="flex-shrink-0 text-[#7F77DD]" />
        <span className="text-[12.5px] text-ink-400 dark:text-ink-500 flex-1 font-semibold">
          {label}
        </span>
        <PiCaretRight
          size={10}
          className={clsx(
            "flex-shrink-0 text-ink-300 dark:text-ink-600 transition-transform duration-200",
            open && "rotate-90"
          )}
        />
      </button>

      {open && (
        <div className="border-t border-border-secondary dark:border-[#2A2A28] px-2.5 py-2 space-y-2">
          {part.contextUsed && part.contextUsed.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {part.contextUsed.map(ctx => {
                const kind =
                  BLOCK_TYPE_TO_KIND[
                    ctx.blockType.toUpperCase().replace(/ /g, "_")
                  ];
                return (
                  <span
                    key={ctx.blockId}
                    className="inline-flex items-center gap-1 text-[10.5px] font-medium
                      px-1.5 py-[2px] rounded-md
                      bg-[#F1F3F4] dark:bg-[#2A2A28]
                      border border-[#DEE2E6] dark:border-[#3A3A38]
                      text-ink-400 dark:text-ink-500"
                  >
                    {kind && (
                      <BlockKindIcon
                        kind={kind}
                        size={10}
                        weight="bold"
                        className="opacity-60"
                      />
                    )}
                    {ctx.blockTitle}
                  </span>
                );
              })}
            </div>
          )}

          <p className="text-[12.5px] text-ink-400 dark:text-ink-500 leading-relaxed">
            {part.thinking}
          </p>
        </div>
      )}
    </div>
  );
}
