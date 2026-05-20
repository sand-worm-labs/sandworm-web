"use client";

import React from "react";
import { BlockType } from "@sandworm/editor";

import { BlockKindIcon } from "./icons";
import type { BlockActionPart } from "./parts.types";

// =====================================
// ⬢ Constants
// =====================================

const ACTION_META = {
  created: { label: "created", color: "#7F77DD", bg: "#EEEDFE" },
  edited: { label: "edited", color: "#EF9F27", bg: "#FEF5E7" },
  ran: { label: "ran", color: "#1D9E75", bg: "#E1F5EE" },
  deleted: { label: "deleted", color: "#D85A30", bg: "#FAECE7" },
} as const;

const BLOCK_TYPE_META: Record<string, { label: string; kind: BlockType }> = {
  SQL: { label: "SQL", kind: BlockType.SQL },
  PYTHON: { label: "Python", kind: BlockType.Python },
  MARKDOWN: { label: "Markdown", kind: BlockType.Markdown },
  VISUALIZATION: { label: "Visualization", kind: BlockType.VisualizationV2 },
  VISUALIZATION_V2: { label: "Visualization", kind: BlockType.VisualizationV2 },
  POWER_TOOLBOX: { label: "Power Toolbox", kind: BlockType.PowerToolbox },
  RICH_TEXT: { label: "Rich Text", kind: BlockType.RichText },
  PIVOT_TABLE: { label: "Pivot Table", kind: BlockType.PivotTable },
};

// =====================================
// ⬢ BlockActionRow
// =====================================

interface BlockActionRowProps {
  part: BlockActionPart;
}

export function BlockActionRow({ part }: BlockActionRowProps) {
  const act = ACTION_META[part.action];
  const meta = BLOCK_TYPE_META[part.blockType.toUpperCase().replace(/ /g, "_")];
  const isRejected = part.status === "rejected";

  return (
    <div
      className={`flex items-center gap-2 px-2.5 py-1.5
        rounded-lg border
        bg-white dark:bg-[#1C1C1A]
        transition-opacity
        ${
          isRejected
            ? "border-[#FAECE7] dark:border-[#2A1510] opacity-50"
            : "border-border-secondary dark:border-[#2A2A28]"
        }`}
    >
      {/* ─── Block icon ─── */}
      <div
        className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-md"
        style={{ background: isRejected ? "#F1F3F4" : act.bg }}
      >
        {meta ? (
          <BlockKindIcon
            kind={meta.kind}
            size={11}
            weight="bold"
            style={{ color: isRejected ? "#9CA3AF" : act.color }}
          />
        ) : (
          <span
            style={{ fontSize: 10, color: isRejected ? "#9CA3AF" : act.color }}
          >
            ⬡
          </span>
        )}
      </div>

      {/* ─── Action + title ─── */}
      <div className="flex-1 min-w-0 flex items-center gap-1.5">
        <span
          className="text-[10px] font-medium flex-shrink-0"
          style={{ color: isRejected ? "#9CA3AF" : act.color }}
        >
          {isRejected ? "declined" : act.label}
        </span>
        <span className="text-[11.5px] font-medium text-ink-500 dark:text-ink-200 truncate">
          {part.blockTitle}
        </span>
      </div>

      {/* ─── Block type badge ─── */}
      <span
        className="flex-shrink-0 text-[9.5px] font-medium px-1.5 py-0.5 rounded-md
          bg-[#F1F3F4] dark:bg-[#2A2A28]
          text-ink-300 dark:text-ink-600"
      >
        {meta?.label ?? part.blockType}
      </span>

      {/* ─── Preview result ─── */}
      {part.previewResult && (
        <span
          className={`flex-shrink-0 text-[9.5px] font-medium tabular-nums
            ${
              part.previewResult.hasError ? "text-[#D85A30]" : "text-[#1D9E75]"
            }`}
        >
          {part.previewResult.hasError
            ? (part.previewResult.errorMsg ?? "error")
            : `${part.previewResult.rowCount} rows`}
        </span>
      )}
    </div>
  );
}
