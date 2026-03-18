"use client";

import { useState } from "react";
import clsx from "clsx";
import type { ParamDefinition } from "@sandworm/editor";

import { FieldLabel, FieldError } from "./AddressField";

interface TextFieldProps {
  param: ParamDefinition;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function TextField({ param, value, onChange, error }: TextFieldProps) {
  const [touched, setTouched] = useState(false);
  const inlineError = touched ? error : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel param={param} />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
        placeholder={param.placeholder}
        autoComplete="off"
        className={clsx(
          "w-full px-3 py-2.5 rounded-lg text-sm",
          "bg-white/[0.04] border transition-colors outline-none",
          "text-ink-100  placeholder:text-white/20",
          "focus:bg-white/[0.05]",
          inlineError
            ? "border-error focus:border-error"
            : "border-border-tertiary focus:border-[#A308F0]/50"
        )}
      />
      {inlineError && <FieldError message={inlineError} />}
    </div>
  );
}

// ─── Number field ─────────────────────────────────────────────────────────────

interface NumberFieldProps {
  param: ParamDefinition;
  value: number | string;
  onChange: (value: number) => void;
  error?: string;
}

export function NumberField({
  param,
  value,
  onChange,
  error,
}: NumberFieldProps) {
  const [touched, setTouched] = useState(false);
  const [raw, setRaw] = useState(String(value ?? ""));

  const inlineError = touched ? error : undefined;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const str = e.target.value;
    setRaw(str);
    const parsed = parseFloat(str);
    if (!isNaN(parsed)) {
      onChange(parsed);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel param={param} />
      <div className="relative">
        <input
          type="number"
          value={raw}
          onChange={handleChange}
          onBlur={() => setTouched(true)}
          placeholder={param.placeholder}
          min={param.min}
          max={param.max}
          className={clsx(
            "w-full px-3 py-2.5 rounded-lg text-sm",
            "bg-white/[0.04] border transition-colors outline-none",
            "text-ink-100  placeholder:text-white/20",
            "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            "focus:bg-white/[0.05]",
            inlineError
              ? "border-error focus:border-red-500/60"
              : "border-border-tertiary focus:border-[#A308F0]/50"
          )}
        />

        {/* Stepper buttons */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
          <button
            type="button"
            onClick={() => {
              const n = (parseFloat(raw) || 0) + 1;
              if (param.max === undefined || n <= param.max) {
                setRaw(String(n));
                onChange(n);
              }
            }}
            className="text-white/20 hover:text-white/50 transition-colors leading-none"
          >
            <ChevronUp />
          </button>
          <button
            type="button"
            onClick={() => {
              const n = (parseFloat(raw) || 0) - 1;
              if (param.min === undefined || n >= param.min) {
                setRaw(String(n));
                onChange(n);
              }
            }}
            className="text-white/20 hover:text-white/50 transition-colors leading-none"
          >
            <ChevronDown />
          </button>
        </div>
      </div>

      {param.min !== undefined && param.max !== undefined && (
        <p className="text-[11px] text-ink-400   ">
          Range: {param.min} – {param.max}
        </p>
      )}

      {inlineError && <FieldError message={inlineError} />}
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ChevronUp() {
  return (
    <svg viewBox="0 0 12 12" fill="none" className="w-2.5 h-2.5">
      <path
        d="M2 8l4-4 4 4"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-current"
      />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg viewBox="0 0 12 12" fill="none" className="w-2.5 h-2.5">
      <path
        d="M2 4l4 4 4-4"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-current"
      />
    </svg>
  );
}
