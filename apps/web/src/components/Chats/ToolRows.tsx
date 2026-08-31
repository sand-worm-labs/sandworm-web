"use client";

import React, { useState } from "react";
import { PiLightning, PiCheck, PiWarning } from "react-icons/pi";

import type { ToolCallPart, ToolResultPart } from "./parts.types";

// =====================================
// ⬢ Shared
// =====================================

function IconBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{ width: 24, height: 24, minWidth: 24, minHeight: 24 }}
      className="flex items-center justify-center rounded-lg bg-white dark:bg-base-720 border border-[#B1DDE8] dark:border-[#1A3A52]"
    >
      {children}
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex-shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-white dark:bg-base-720 border border-border dark:border-base-710 text-ink-400 dark:text-ink-300">
      {children}
    </span>
  );
}

// =====================================
// ⬢ ToolCallRow
// =====================================

interface ToolCallRowProps {
  part: ToolCallPart;
}

export function ToolCallRow({ part }: ToolCallRowProps) {
  const [expanded, setExpanded] = useState(false);
  const params = part.params ? Object.entries(part.params) : [];
  const hasParams = params.length > 0;

  return (
    <div
      role={hasParams ? "button" : undefined}
      tabIndex={hasParams ? 0 : undefined}
      onClick={() => hasParams && setExpanded(v => !v)}
      onKeyDown={e =>
        hasParams &&
        (e.key === "Enter" || e.key === " ") &&
        setExpanded(v => !v)
      }
      className={`px-3 py-1.5 rounded-xl bg-base-300 dark:bg-base-770 w-full transition-all duration-150 ${hasParams ? "cursor-pointer hover:bg-[#EAECEE] dark:hover:bg-[#1F1F1D]" : ""}`}
    >
      {/* ─── Single line ─── */}
      <div className="flex items-center gap-3">
        <IconBox>
          <PiLightning
            size={16}
            className="text-ink-700 dark:text-ink-100"
            style={{ display: "block", flexShrink: 0 }}
          />
        </IconBox>

        <div className="flex-1 min-w-0 flex items-baseline gap-1.5">
          <span className="text-[12.5px] font-medium text-ink-500 dark:text-ink-100 truncate">
            {part.toolName}
          </span>
        </div>

        {part.category && <Pill>{part.category}</Pill>}

        {/* ─── Collapsed param preview ─── */}
        {hasParams && !expanded && (
          <span className="flex-shrink-0 text-[10px] text-ink-300 dark:text-ink-600 font-mono truncate max-w-[100px]">
            {params.map(([k, v]) => `${k} ${v}`).join(" · ")}
          </span>
        )}

        {hasParams && (
          <span
            className="flex-shrink-0 text-[10px] text-ink-300 dark:text-ink-600 transition-transform duration-200"
            style={{ transform: expanded ? "rotate(90deg)" : "rotate(0deg)" }}
          >
            ›
          </span>
        )}
      </div>

      {/* ─── Expanded params ─── */}
      {expanded && hasParams && (
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5 pl-9">
          {params.map(([k, v]) => (
            <span key={k} className="text-[11px] ">
              <span className="text-ink-400 dark:text-ink-600">{k} </span>
              <span className="text-ink-400 dark:text-ink-300 font-medium">
                {v}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// =====================================
// ⬢ ToolResultRow
// =====================================

interface ToolResultRowProps {
  part: ToolResultPart;
}

export function ToolResultRow({ part }: ToolResultRowProps) {
  const isError = part.hasError;

  return (
    <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-base-300 dark:bg-base-770 w-full">
      <IconBox>
        {isError ? (
          <PiWarning
            size={16}
            className="text-warning"
            style={{ display: "block", flexShrink: 0 }}
          />
        ) : (
          <PiCheck
            size={16}
            className="text-ink-700 dark:text-ink-100"
            style={{ display: "block", flexShrink: 0 }}
          />
        )}
      </IconBox>

      <span
        className={`text-[12.5px] font-medium flex-1 min-w-0 truncate ${isError ? "text-warning" : "text-ink-500 dark:text-ink-100"}`}
      >
        {part.summary}
      </span>

      {part.rowCount !== undefined && !isError && (
        <Pill>{part.rowCount} rows</Pill>
      )}
    </div>
  );
}
