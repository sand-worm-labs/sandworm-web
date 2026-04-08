"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import type * as Y from "yjs";
import clsx from "clsx";
import {
  type PowerToolboxBlock,
  getToolById,
  type ToolDefinition,
  type ParamDefinition,
  type ResolvedParams,
} from "@sandworm/editor";

import { BoltIcon } from "@/components/Assets/BoltIcon";

import { ParamField, type FieldValue } from "./ParamsField";

interface AnalyticsParamFormProps {
  /** The Yjs block element — used to read/write toolId, inputs, generatedSource */
  block: Y.XmlElement<PowerToolboxBlock>;

  /** Called when the user explicitly cancels / discards the form. */
  onCancel?: () => void;

  /** If true, the form renders in edit mode over an already-executed block. */
  isEditing?: boolean;
}

// ─── Default values ───────────────────────────────────────────────────────────

function getDefaultValue(param: ParamDefinition): FieldValue {
  if (param.default !== undefined) return param.default as FieldValue;
  switch (param.type) {
    case "address[]":
    case "chain[]":
      return [];
    case "number":
      return param.min ?? 0;
    case "date_range":
      return { from: "", to: "" };
    default:
      return "";
  }
}

function buildInitialValues(
  params: ParamDefinition[],
  existingInputs: ResolvedParams
): Record<string, FieldValue> {
  return params.reduce<Record<string, FieldValue>>((acc, param) => {
    acc[param.key] =
      (existingInputs[param.key] as FieldValue) ?? getDefaultValue(param);
    return acc;
  }, {});
}

// ─── Param pill ───────────────────────────────────────────────────────────────

function ParamPill({ label, value }: { label: string; value: FieldValue }) {
  const display = Array.isArray(value)
    ? `${value.length} ${label.toLowerCase()}`
    : typeof value === "object" && value !== null
      ? `${(value as { from: string }).from} → ${(value as { to: string }).to}`
      : String(value).length > 14
        ? `${String(value).slice(0, 6)}…${String(value).slice(-4)}`
        : String(value);

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded",
        "bg-white/[0.04] border border-white/[0.07]",
        "text-[10px] text-ink-400  max-w-[120px] truncate"
      )}
      title={`${label}: ${String(value)}`}
    >
      <span className="text-ink-400  shrink-0">{label}:</span>
      <span className="truncate">{display}</span>
    </span>
  );
}

export function AnalyticsParamForm({
  block,
  onCancel,
  isEditing = false,
}: AnalyticsParamFormProps) {
  const toolId = block.getAttribute("toolId") as string | null;
  const existingInputs =
    (block.getAttribute("inputs") as ResolvedParams | null) ?? {};

  const tool = useMemo<ToolDefinition | undefined>(
    () => (toolId ? getToolById(toolId) : undefined),
    [toolId]
  );

  const [values, setValues] = useState<Record<string, FieldValue>>(() =>
    tool ? buildInitialValues(tool.params, existingInputs) : {}
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [renderError, setRenderError] = useState<string | undefined>();

  // Re-initialise if the tool changes (e.g. block reuse — edge case)
  useEffect(() => {
    if (tool) {
      setValues(buildInitialValues(tool.params, existingInputs));
      setErrors({});
      setSubmitAttempted(false);
      setRenderError(undefined);
    }
  }, [toolId]);

  const handleChange = useCallback(
    (key: string, value: FieldValue) => {
      setValues(prev => ({ ...prev, [key]: value }));
      // Clear the field error on change if submit was already attempted
      if (submitAttempted) {
        setErrors(prev => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      }
    },
    [submitAttempted]
  );

  if (!tool) {
    return (
      <div className="px-4 py-6 text-sm text-ink-300 text-center">
        Tool not found.
      </div>
    );
  }

  return (
    <div className={clsx("rounded-lg ", "bg-base-100")}>
      <div
        className={clsx(
          "flex items-center justify-between px-4 py-3",
          "border-b border-white/[0.05]"
        )}
      >
        <div className="flex items-center gap-2.5">
          <BoltIcon />
          <div>
            <p className="text-sm font-medium text-ink-100  leading-tight">
              {tool.name}
            </p>
            <p className="text-[11px] text-ink-400  leading-tight mt-0.5">
              {tool.categoryId}
            </p>
          </div>
        </div>

        {isEditing && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-ink-400  hover:text-ink-400 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">
        {tool.params.length === 0 ? (
          <p className="text-sm text-ink-400  italic">
            No configuration required for this tool.
          </p>
        ) : (
          tool.params.map(param => (
            <ParamField
              key={param.key}
              param={param}
              value={values[param.key] ?? getDefaultValue(param)}
              onChange={val => handleChange(param.key, val)}
              error={submitAttempted ? errors[param.key] : undefined}
            />
          ))
        )}
      </div>

      {renderError && (
        <div className="mx-4 mb-3 px-3 py-2.5 rounded-lg">
          <p className="text-xs text-error font-mono">{renderError}</p>
        </div>
      )}

      {/* ── Actions ────────────────────────────────────────────────── */}
      <div
        className={clsx(
          "flex items-center justify-between gap-3 px-4 py-3",
          "border-t border-white/[0.05]"
        )}
      >
        {/* Tag summary of non-default values */}
        <div className="flex flex-wrap gap-1 flex-1 min-w-0">
          {tool.params
            .filter(p => {
              const v = values[p.key];
              const def = getDefaultValue(p);
              return JSON.stringify(v) !== JSON.stringify(def);
            })
            .slice(0, 3)
            .map(p => (
              <ParamPill
                key={p.key}
                label={p.label}
                value={values[p.key] ?? getDefaultValue(p)}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
