"use client";

import { useState } from "react";
import clsx from "clsx";
import type { ParamDefinition } from "@sandworm/editor";

import { FieldLabel, FieldError } from "./AddressField";

// =====================================
// ⬢ Types
// =====================================
export interface DateRange {
  from: string;
  to: string;
}

interface DateRangeFieldProps {
  param: ParamDefinition;
  value: DateRange;
  onChange: (value: DateRange) => void;
  error?: string;
}

// =====================================
// ⬢ Date Range Field
// =====================================
export function DateRangeField({
  param,
  value,
  onChange,
  error,
}: DateRangeFieldProps) {
  const [touched, setTouched] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const inlineError =
    touched && value.from && value.to && value.from > value.to
      ? "Start date must be before end date"
      : touched
        ? error
        : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel param={param} />

      <div className="grid grid-cols-2 gap-2">
        <DateInput
          label="From"
          value={value.from}
          max={value.to || today}
          onChange={from => onChange({ ...value, from })}
          onBlur={() => setTouched(true)}
        />
        <DateInput
          label="To"
          value={value.to}
          min={value.from}
          max={today}
          onChange={to => onChange({ ...value, to })}
          onBlur={() => setTouched(true)}
        />
      </div>

      {inlineError && <FieldError message={inlineError} />}
    </div>
  );
}

// =====================================
// ⬢ Date Field (single date)
// =====================================
interface DateFieldProps {
  param: ParamDefinition;
  value: string;
  onChange: (value: string) => void;
  onBlur: (value: string) => void;
  error?: string;
}

export function DateField({
  param,
  value,
  onChange,
  onBlur,
  error,
}: DateFieldProps) {
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel param={param} />
      <input
        type="date"
        value={value}
        max={today}
        onChange={e => onChange(e.target.value)}
        onBlur={() => onBlur(value)}
        className={clsx(
          "w-full px-3 py-2.5 rounded-lg text-sm",
          "bg-white/[0.04] border border-border-tertiary transition-colors outline-none",
          "text-ink-100 ",
          "focus:border-primary/50 focus:bg-white/[0.05]",
          "[color-scheme:dark]"
        )}
      />
      {error && <FieldError message={error} />}
    </div>
  );
}

// =====================================
// ⬢  Single date input
// =====================================
function DateInput({
  label,
  value,
  min,
  max,
  onChange,
  onBlur,
}: {
  label: string;
  value: string;
  min?: string;
  max?: string;
  onChange: (v: string) => void;
  onBlur: () => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] text-ink-400  uppercase tracking-wider">
        {label}
      </span>
      <input
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        className={clsx(
          "w-full px-3 py-2.5 rounded-lg text-sm",
          "bg-white/[0.04] border border-border-tertiary transition-colors outline-none",
          "text-ink-100 ",
          "focus:border-primary/50 focus:bg-white/[0.05]",
          "[color-scheme:dark]"
        )}
      />
    </div>
  );
}
