"use client";

import React from "react";
import { BlockType } from "@sandworm/editor";
import { PiOctagon } from "react-icons/pi";

import { BlockKindIcon } from "./icons";
import type { BlockActionPart } from "./parts.types";

// =====================================
// ⬢ Constants
// =====================================

const ACTION_LABEL: Record<string, string> = {
  created: "Created",
  edited: "Edited",
  ran: "Ran",
  deleted: "Deleted",
};

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

function Pill({
  children,
  error,
}: {
  children: React.ReactNode;
  error?: boolean;
}) {
  return (
    <span
      className={`flex-shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-white dark:bg-[#252523] border border-[#DEE2E6] dark:border-[#3A3A38] tabular-nums ${error ? "text-[#D85A30]" : "text-ink-400 dark:text-ink-500"}`}
    >
      {children}
    </span>
  );
}

// =====================================
// ⬢ BlockActionRow
// =====================================

interface BlockActionRowProps {
  part: BlockActionPart;
  onLocate?: (blockId: string) => void;
}

export function BlockActionRow({ part, onLocate }: BlockActionRowProps) {
  const meta = part.blockType ? BLOCK_TYPE_META[part.blockType.toUpperCase().replace(/ /g, "_")] : undefined;
  const isRejected = part.status === "rejected";
  const isClickable = !!onLocate && !isRejected;

  const inner = (
    <>
      <div
        style={{ width: 24, height: 24, minWidth: 24, minHeight: 24 }}
        className="flex items-center justify-center rounded-lg bg-white dark:bg-[#252523] border border-[#B1DDE8] dark:border-[#1A3A52]"
      >
        {meta ? (
          <BlockKindIcon
            kind={meta.kind}
            size={16}
            weight="bold"
            className="text-[#343330] dark:text-ink-200"
            style={{ display: "block", flexShrink: 0 }}
          />
        ) : (
          <span className="text-[#343330] dark:text-ink-200">
            <PiOctagon size={16} />
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0 flex items-baseline gap-1.5">
        <span className="text-[12.5px] font-medium text-ink-300 dark:text-ink-600 flex-shrink-0">
          {isRejected ? "Declined" : (ACTION_LABEL[part.action] ?? part.action)}
        </span>
        <span className="text-[12.5px] font-medium text-ink-500 dark:text-ink-100 truncate">
          {part.blockTitle}
        </span>
      </div>

      <Pill>{meta?.label ?? part.blockType}</Pill>

      {part.previewResult &&
        (part.previewResult.hasError ? (
          <Pill error>{part.previewResult.errorMsg ?? "error"}</Pill>
        ) : (
          <Pill>{part.previewResult.rowCount} rows</Pill>
        ))}

      {isClickable && (
        <span className="flex-shrink-0 text-[10px] text-ink-200 dark:text-ink-700 opacity-0 group-hover:opacity-100 transition-opacity">
          ↗
        </span>
      )}
    </>
  );

  const base = `flex items-center gap-3 px-3 py-1.5 rounded-xl w-full text-left transition-all duration-150 ${isRejected ? "opacity-40" : ""}`;
  const container = `bg-[#F1F3F4] dark:bg-[#1A1A18]`;
  const hover = `hover:bg-[#EAECEE] dark:hover:bg-[#1F1F1D]`;

  if (isClickable) {
    return (
      <button
        type="button"
        onClick={() => onLocate(part.blockId)}
        className={`group ${base} ${container} ${hover}`}
      >
        {inner}
      </button>
    );
  }

  return <div className={`${base} ${container}`}>{inner}</div>;
}
