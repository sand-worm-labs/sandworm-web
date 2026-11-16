"use client";

import { useId, useState } from "react";
import { PiPlus, PiX } from "react-icons/pi";

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
            className="inline-flex h-7 items-center gap-1 rounded-lg bg-primary-tint-75 pl-2.5 pr-1 text-[13px] font-medium leading-none text-ink-450"
          >
            {value}
            <button
              type="button"
              aria-label={`Remove ${value}`}
              onClick={() => onChange(values.filter(item => item !== value))}
              className="flex size-5 items-center justify-center rounded text-ink-300 transition-colors hover:bg-input hover:text-ink-500 dark:hover:bg-base-710"
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
            className="h-7 w-40 rounded-lg border border-primary bg-block-surface px-3 text-[13px] text-ink-100 outline-none"
          />
        ) : (
          <button
            type="button"
            aria-label={`Add to ${label}`}
            onClick={() => setIsAdding(true)}
            className="flex size-7 items-center justify-center rounded-full border border-primary-300 bg-primary-tint-75 text-primary-700 transition-colors hover:bg-primary-tint-50 dark:border-primary-700 dark:bg-primary-920 dark:text-primary-300"
          >
            <PiPlus size={13} aria-hidden="true" />
          </button>
        )}
      </div>
      {hint && <span className="text-xs text-ink-400">{hint}</span>}
    </div>
  );
}
