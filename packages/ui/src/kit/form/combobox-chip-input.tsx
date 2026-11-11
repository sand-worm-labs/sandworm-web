"use client";

import { useId, useState, type ReactNode } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import clsx from "clsx";
import { PiCheck, PiPlus, PiX } from "react-icons/pi";

export type ChipOption = {
  id: string;
  label: string;
  // Options with the same group sit under one heading, in the order given
  group?: string;
  // Other words that find it: "UK" for the United Kingdom
  keywords?: string;
};

type ComboboxChipInputProps = {
  label: string;
  values: readonly string[];
  options: readonly ChipOption[];
  onChange: (values: string[]) => void;
  hint?: string;
  renderIcon?: (option: ChipOption) => ReactNode;
  // Shown in the list when nothing matches what was typed
  renderEmpty?: (query: string) => ReactNode;
};

const fold = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

// ChipInput for a fixed set of options: a value is picked from a searchable
// list, not typed in. A value that is not in the list stays, shown dashed.
export function ComboboxChipInput({
  label,
  values,
  options,
  onChange,
  hint,
  renderIcon,
  renderEmpty,
}: ComboboxChipInputProps) {
  const labelId = useId();
  const [isAdding, setIsAdding] = useState(false);
  const [query, setQuery] = useState("");

  const byId = new Map(options.map(option => [option.id, option]));
  const needle = fold(query.trim());
  const matches = options.filter(option =>
    fold(`${option.label} ${option.keywords ?? ""}`).includes(needle)
  );
  const startsWithNeedle = (option: ChipOption) =>
    fold(option.label).startsWith(needle) ? 0 : 1;

  const close = () => {
    setQuery("");
    setIsAdding(false);
  };

  return (
    <div role="group" aria-labelledby={labelId} className="flex flex-col gap-2">
      <span id={labelId} className="text-[13px] font-medium text-ink-100">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-1.5">
        {values.map(id => {
          const option = byId.get(id) ?? { id, label: id };
          return (
            <span
              key={id}
              title={byId.has(id) ? undefined : "Not recognised"}
              className={clsx(
                "inline-flex h-7 items-center gap-1.5 rounded-lg pl-2.5 pr-1 text-[13px] font-medium leading-none text-ink-450",
                byId.has(id)
                  ? "bg-primary-tint-75"
                  : "border border-dashed border-hover-border"
              )}
            >
              {renderIcon?.(option)}
              {option.label}
              <button
                type="button"
                aria-label={`Remove ${option.label}`}
                onClick={() => onChange(values.filter(item => item !== id))}
                className="flex size-5 items-center justify-center rounded text-ink-300 transition-colors hover:bg-input hover:text-ink-500 dark:hover:bg-base-710"
              >
                <PiX size={12} aria-hidden="true" />
              </button>
            </span>
          );
        })}
        {isAdding ? (
          <Combobox
            multiple
            immediate
            value={[...values]}
            onChange={next => {
              onChange(next);
              setQuery("");
            }}
            onClose={close}
          >
            <ComboboxInput
              autoFocus
              aria-label={`Add to ${label}`}
              placeholder="Search"
              displayValue={() => ""}
              onChange={event => setQuery(event.target.value)}
              onKeyDown={event => {
                if (event.key === "Backspace" && !query && values.length) {
                  onChange(values.slice(0, -1));
                }
              }}
              className="h-7 w-44 rounded-lg border border-primary bg-block-surface px-3 text-[13px] text-ink-100 outline-none"
            />
            <ComboboxOptions
              anchor="bottom start"
              modal={false}
              className="z-50 w-[var(--input-width)] min-w-64 rounded-xl border border-border-tertiary bg-base-100 font-body shadow-lg [--anchor-gap:6px] [--anchor-padding:16px] dark:bg-dropdown-bg"
            >
              <div className="max-h-60 overflow-y-auto p-1">
                {Array.from(
                  Map.groupBy(matches, option => option.group ?? "")
                ).map(([group, items]) => (
                  <div key={group}>
                    {group && (
                      <div className="px-2 pb-1 pt-2 text-[11px] font-medium uppercase text-ink-400">
                        {group}
                      </div>
                    )}
                    {[...items]
                      .sort((a, b) => startsWithNeedle(a) - startsWithNeedle(b))
                      .map(option => (
                        <ComboboxOption
                          key={option.id}
                          value={option.id}
                          className="flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-black data-[focus]:bg-hover-bg dark:text-white dark:data-[focus]:bg-dropdown-hover"
                        >
                          {renderIcon?.(option)}
                          <span className="flex-1 truncate">
                            {option.label}
                          </span>
                          {values.includes(option.id) && (
                            <PiCheck
                              size={14}
                              aria-hidden="true"
                              className="text-primary"
                            />
                          )}
                        </ComboboxOption>
                      ))}
                  </div>
                ))}
                {matches.length === 0 && (
                  <div className="flex flex-col gap-1 px-2 py-2 text-sm text-ink-400">
                    <span>No match for &quot;{query.trim()}&quot;.</span>
                    {renderEmpty?.(query.trim())}
                  </div>
                )}
              </div>
            </ComboboxOptions>
          </Combobox>
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
