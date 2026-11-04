"use client";

import { useId, useState } from "react";
import { PiX } from "react-icons/pi";

type ChipInputProps = {
  label: string;
  values: readonly string[];
  onChange: (values: string[]) => void;
  hint?: string;
};

export function ChipInput({ label, values, onChange, hint }: ChipInputProps) {
  const labelId = useId();
  const [isAdding, setIsAdding] = useState(false);
  const [pending, setPending] = useState("");

  const close = () => {
    setPending("");
    setIsAdding(false);
  };

  const commit = () => {
    const next = pending.trim();
    const isDuplicate = values.some(
      value => value.toLowerCase() === next.toLowerCase()
    );
    if (next && !isDuplicate) onChange([...values, next]);
    close();
  };

  return (
    <div role="group" aria-labelledby={labelId} className="flex flex-col gap-2">
      <span id={labelId} className="text-[13px] font-medium text-ink-100">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {values.map(value => (
          <span
            key={value}
            className="inline-flex h-[30px] items-center gap-1 rounded-full border border-hover-border bg-block-surface pl-3 pr-1.5 font-medium text-ink-100"
          >
            {value}
            <button
              type="button"
              aria-label={`Remove ${value}`}
              onClick={() => onChange(values.filter(item => item !== value))}
              className="flex size-5 items-center justify-center rounded-full text-ink-400 hover:bg-primary-tint-75 dark:hover:bg-primary-910 hover:text-primary-700 dark:hover:text-primary-200"
            >
              <PiX size={12} aria-hidden="true" />
            </button>
          </span>
        ))}
        {isAdding ? (
          <input
            ref={element => element?.focus()}
            aria-label={`Add to ${label}`}
            value={pending}
            onChange={event => setPending(event.target.value)}
            onBlur={commit}
            onKeyDown={event => {
              if (event.key === "Enter") {
                event.preventDefault();
                commit();
              }
              if (event.key === "Escape") close();
            }}
            className="h-[30px] w-40 rounded-full border border-primary bg-block-surface px-3 text-[13px] text-ink-100 outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="h-[30px] rounded-full border border-dashed border-hover-border px-3 text-[13px] font-medium text-primary-700 dark:text-primary-200 hover:bg-primary-tint-50 dark:hover:bg-dropdown-hover"
          >
            Add
          </button>
        )}
      </div>
      {hint && <span className="text-xs text-ink-400">{hint}</span>}
    </div>
  );
}
