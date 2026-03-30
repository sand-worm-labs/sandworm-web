"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import type * as Y from "yjs";
import clsx from "clsx";
import  {
  PowerToolboxBlock,
  getToolById,
  renderToolById,
  type ToolDefinition,
  type ParamDefinition,
  type ResolvedParams,
} from "@sandworm/editor";

import { ParamField, type FieldValue } from "./ParamsField";
import { BoltIcon } from "@/components/Assets/BoltIcon";


interface AnalyticsParamFormProps {
  /** The Yjs block element — used to read/write toolId, inputs, generatedSource */
  block: Y.XmlElement<PowerToolboxBlock>;

  /**
   * Called after the form commits to Yjs and the generated source is ready.
   * The parent block component should trigger execution here.
   */
  onRun: (source: string) => void;

  /** Called when the user explicitly cancels / discards the form. */
  onCancel?: () => void;

  /** If true, the form renders in edit mode over an already-executed block. */
  isEditing?: boolean;
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateField(
  param: ParamDefinition,
  value: FieldValue
): string | undefined {
  if (!param.required) return undefined;

  if (value === undefined || value === null) return "Required";
  if (typeof value === "string" && value.trim() === "") return "Required";
  if (Array.isArray(value) && value.length === 0)
    return "At least one entry required";

  if (
    (param.type === "address" || param.type === "token_address") &&
    !/^0x[0-9a-fA-F]{40}$/.test(value as string)
  ) {
    return "Must be a valid EVM address";
  }

  if (
    param.type === "schema_uid" &&
    !/^0x[0-9a-fA-F]{64}$/.test(value as string)
  ) {
    return "Must be a valid schema UID (0x + 64 hex chars)";
  }

  return undefined;
}

function validateAll(
  params: ParamDefinition[],
  values: Record<string, FieldValue>
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const param of params) {
    const err = validateField(param, values[param.key]);
    if (err) errors[param.key] = err;
  }
  return errors;
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
  const values: Record<string, FieldValue> = {};
  for (const param of params) {
    values[param.key] =
      (existingInputs[param.key] as FieldValue) ?? getDefaultValue(param);
  }
  return values;
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

// ─── Icons ────────────────────────────────────────────────────────────────────


function RunIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3">
      <path
        d="M3 2l9 5-9 5V2z"
        strokeWidth="1.3"
        strokeLinejoin="round"
        className="stroke-current fill-current"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="w-3 h-3 animate-spin" viewBox="0 0 14 14" fill="none">
      <circle
        cx="7"
        cy="7"
        r="5"
        strokeWidth="1.5"
        className="stroke-white/20"
      />
      <path
        d="M7 2a5 5 0 0 1 5 5"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="stroke-current"
      />
    </svg>
  );
}



export function AnalyticsParamForm({
  block,
  onRun,
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [renderError, setRenderError] = useState<string | undefined>();

  // Re-initialise if the tool changes (e.g. block reuse — edge case)
  useEffect(() => {
    if (tool) {
      setValues(buildInitialValues(tool.params, existingInputs));
      setErrors({});
      setSubmitAttempted(false);
      setRenderError(undefined);
    }
  }, [toolId]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleSubmit = useCallback(() => {
    if (!tool) return;

    setSubmitAttempted(true);
    setRenderError(undefined);

    const validationErrors = validateAll(tool.params, values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Coerce FieldValue → ResolvedParams (string | number | boolean | string[])
      const resolved: ResolvedParams = {};
      for (const param of tool.params) {
        const v = values[param.key];
        if (
          param.type === "date_range" &&
          typeof v === "object" &&
          !Array.isArray(v)
        ) {
          // Flatten date range into two separate keys: key_from, key_to
          resolved[`${param.key}_from`] = (v as { from: string }).from;
          resolved[`${param.key}_to`] = (v as { to: string }).to;
        } else {
          resolved[param.key] = v as string | number | boolean | string[];
        }
      }

      // Render the SQL template into Python source
      const { source } = renderToolById(tool.id, resolved);

      // Commit to Yjs in a single transaction
      if (block.doc) {
        block.doc.transact(() => {
          block.setAttribute("inputs", resolved);
          block.setAttribute("generatedSource", source);
          block.setAttribute("toolLabel", tool.name);
          block.setAttribute("toolCategory", tool.categoryId);
        });
      } else {
        block.setAttribute("inputs", resolved);
        block.setAttribute("generatedSource", source);
        block.setAttribute("toolLabel", tool.name);
        block.setAttribute("toolCategory", tool.categoryId);
      }

      onRun(source);
    } catch (err) {
      setRenderError(
        err instanceof Error ? err.message : "Failed to generate source"
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [tool, values, block, onRun]);


  if (!tool) {
    return (
      <div className="px-4 py-6 text-sm text-ink-300 text-center">
        Tool not found.
      </div>
    );
  }


  return (
    <div
      className={clsx("rounded-lg ", "bg-base-100")}
    >
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
              value={values[param.key]}
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
              <ParamPill key={p.key} label={p.label} value={values[p.key]} />
            ))}
        </div>

     {/*    <div className="flex items-center gap-2 shrink-0">
          {onCancel && !isEditing && (
            <button
            type="button"
              onClick={onCancel}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-xs font-medium",
                "text-ink-400  hover:text-ink-400 hover:bg-white/[0.04]",
                "border border-white/[0.06] transition-colors"
              )}
            >
              Cancel
            </button>
          )}

          <button
                      type="button"

            onClick={handleSubmit}
            disabled={isSubmitting}
            className={clsx(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg",
              "text-xs font-semibold transition-all",
              isSubmitting
                ? "bg-[#A308F0]/30 text-ink-400  cursor-not-allowed"
                : "bg-[#A308F0] hover:bg-[#b30aff] text-white shadow-lg shadow-[#A308F0]/20"
            )}
          >
            {isSubmitting ? (
              <>
                <Spinner />
                Generating...
              </>
            ) : (
              <>
                <RunIcon />
                {isEditing ? "Re-run" : "Run"}
              </>
            )}
          </button>
        </div> */}
      </div>
    </div>
  );
}
