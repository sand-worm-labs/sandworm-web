"use client";

import React from "react";
import { PiLightning, PiCheck, PiWarning } from "react-icons/pi";

import type { ToolCallPart, ToolResultPart } from "./parts.types";

// =====================================
// ⬢ ToolCallRow
// =====================================

interface ToolCallRowProps {
  part: ToolCallPart;
}

export function ToolCallRow({ part }: ToolCallRowProps) {
  const params = part.params ? Object.entries(part.params) : [];

  return (
    <div
      className="flex items-start gap-2 px-2.5 py-1.5
        rounded-lg border border-border-secondary dark:border-[#2A2A28]
        bg-white dark:bg-[#1C1C1A]"
    >
      <div
        className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-md mt-0.5"
        style={{ background: "#EEEDFE" }}
      >
        <PiLightning size={11} style={{ color: "#7F77DD" }} weight="bold" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11.5px] font-medium text-ink-500 dark:text-ink-200">
            {part.toolName}
          </span>
          {part.category && (
            <span
              className="text-[9.5px] font-medium px-1.5 py-0.5 rounded-md
              bg-[#EEEDFE] dark:bg-[#1F0A2E] text-[#7F77DD] dark:text-[#C97FF5]"
            >
              {part.category}
            </span>
          )}
        </div>

        {params.length > 0 && (
          <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
            {params.map(([k, v]) => (
              <span key={k} className="text-[10px] font-mono">
                <span className="text-ink-300 dark:text-ink-600">{k} </span>
                <span className="text-ink-400 dark:text-ink-400">{v}</span>
              </span>
            ))}
          </div>
        )}
      </div>
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
    <div
      className="flex items-center gap-2 px-2.5 py-1.5
        rounded-lg border bg-white dark:bg-[#1C1C1A]"
      style={{
        borderColor: isError ? "#FAECE7" : "#E1F5EE",
      }}
    >
      <div
        className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-md"
        style={{ background: isError ? "#FAECE7" : "#E1F5EE" }}
      >
        {isError ? (
          <PiWarning size={11} style={{ color: "#D85A30" }} weight="bold" />
        ) : (
          <PiCheck size={11} style={{ color: "#1D9E75" }} weight="bold" />
        )}
      </div>

      <span
        className="text-[11.5px] font-medium"
        style={{ color: isError ? "#D85A30" : "#1D9E75" }}
      >
        {part.summary}
      </span>

      {part.rowCount !== undefined && !isError && (
        <span className="ml-auto text-[9.5px] text-ink-300 dark:text-ink-600 tabular-nums flex-shrink-0">
          {part.rowCount} rows
        </span>
      )}
    </div>
  );
}
