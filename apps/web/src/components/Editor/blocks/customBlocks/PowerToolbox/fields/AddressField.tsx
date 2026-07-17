"use client";

import { useState, useCallback } from "react";
import clsx from "clsx";
import type { ParamDefinition } from "@sandworm/editor";

function isValidAddress(value: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(value);
}

function isSchemaUid(value: string): boolean {
  return /^0x[0-9a-fA-F]{64}$/.test(value);
}

export function FieldLabel({ param }: { param: ParamDefinition }) {
  return (
    <label className="flex items-center gap-1.5 text-xs font-medium text-ink-400 ">
      {param.label}
      {param.required && <span className="text-primary/70 text-[10px]">*</span>}
      {param.description && (
        <span className="ml-auto text-[10px] text-ink-400   font-normal">
          {param.description}
        </span>
      )}
    </label>
  );
}

export function FieldError({ message }: { message: string }) {
  return (
    <p className="text-[11px] text-error flex items-center gap-1">
      <span>⚠</span>
      {message}
    </p>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
      <path
        d="M2.5 7l3 3 6-6"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-current"
      />
    </svg>
  );
}

interface AddressFieldProps {
  param: ParamDefinition;
  value: string;
  onChange: (value: string) => void;
  onBlur?: (value: string) => void;
  error?: string;
}

// =====================================
// ⬢ Address Field Component
// =====================================
export function AddressField({
  param,
  value,
  onChange,
  error,
  onBlur,
}: AddressFieldProps) {
  const [touched, setTouched] = useState(false);

  const isUid = param.type === "schema_uid";
  const isToken = param.type === "token_address";

  const validate = useCallback(
    (v: string): string | undefined => {
      if (!v && !param.required) return undefined;
      if (!v && param.required) return "Required";
      if (isUid && !isSchemaUid(v))
        return "Must be a 66-char hex string (0x + 64 chars)";
      if (!isUid && !isValidAddress(v))
        return "Must be a valid EVM address (0x + 40 chars)";
      return undefined;
    },
    [param.required, isUid]
  );

  const inlineError = touched ? (error ?? validate(value)) : undefined;
  const isValid = value && !validate(value);

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel param={param} />

      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={() => {
            setTouched(true);
            onBlur?.(value);
          }}
          placeholder={param.placeholder ?? (isUid ? "0x..." : "0x...")}
          spellCheck={false}
          autoComplete="off"
          className={clsx(
            "w-full px-3 py-2.5 rounded-lg text-sm",
            "font-body tracking-tight",
            " border border-border-tertiary transition-colors outline-none",
            "placeholder:text-ink-400   text-ink-100  ",
            "focus:bg-white/[0.05]",
            inlineError
              ? "border-error focus:border-error"
              : isValid
                ? "border-border-tertiary focus:border-tertiary"
                : "border-border-tertiary focus:border-primary/50"
          )}
        />

        {isValid && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400/70">
            <CheckIcon />
          </span>
        )}
      </div>

      {inlineError && <FieldError message={inlineError} />}

      {isToken && value && isValidAddress(value) && (
        <p className="text-[11px] text-ink-100">
          Token metadata will be resolved at execution time.
        </p>
      )}
    </div>
  );
}
