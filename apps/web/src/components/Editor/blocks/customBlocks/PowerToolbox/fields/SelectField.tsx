"use client";

import { Fragment, useCallback } from "react";
import { Listbox, Transition } from "@headlessui/react";
import clsx from "clsx";
import type { ParamDefinition } from "@sandworm/editor";
import { chainIcon } from "@sandworm/editor";

import { FieldLabel, FieldError } from "./AddressField";

export function ChevronDown() {
  return (
    <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
      <path
        d="M3 5l4 4 4-4"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-current"
      />
    </svg>
  );
}

// =====================================
// ⬢ Single Select Field
// =====================================
interface SelectFieldProps {
  param: ParamDefinition;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function SelectField({
  param,
  value,
  onChange,
  error,
}: SelectFieldProps) {
  const options = param.options ?? [];

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel param={param} />

      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className={clsx(
            "w-full appearance-none px-3 py-2.5 pr-8 rounded-lg text-sm",
            "bg-white/[0.04] border transition-colors outline-none",
            "text-ink-100  cursor-pointer",
            "focus:bg-white/[0.05]",
            error
              ? "border-error focus:border-red-500/60"
              : "border-border-tertiary focus:border-primary/50"
          )}
        >
          {!value && (
            <option value="" disabled className="text-ink-400  bg-base-100">
              Select {param.label.toLowerCase()}...
            </option>
          )}
          {options.map(opt => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-base-100 text-ink-100 "
            >
              {opt.label}
            </option>
          ))}
        </select>

        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 ">
          <ChevronDown />
        </span>
      </div>

      {error && <FieldError message={error} />}
    </div>
  );
}

// =====================================
// ⬢ Chain Select Field (with logo icons)
// =====================================
// Native <option> elements can't render an <img>, so the "chain" type gets
// its own Listbox-based dropdown instead of reusing the plain <select> in
// SelectField — every other "select"-typed param keeps the native control.
interface ChainSelectFieldProps {
  param: ParamDefinition;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function ChainSelectField({
  param,
  value,
  onChange,
  error,
}: ChainSelectFieldProps) {
  const options = param.options ?? [];
  const selected = options.find(opt => opt.value === value);

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel param={param} />

      <Listbox value={value} onChange={onChange}>
        {({ open }) => (
          <div className="relative">
            <Listbox.Button
              className={clsx(
                "w-full flex items-center gap-2 px-3 py-2.5 pr-8 rounded-lg text-sm text-left",
                "bg-white/[0.04] border transition-colors outline-none cursor-pointer",
                "text-ink-100 ",
                error
                  ? "border-error focus:border-red-500/60"
                  : "border-border-tertiary focus:border-primary/50"
              )}
            >
              {selected ? (
                <>
                  <img
                    src={selected.icon ?? chainIcon(selected.value)}
                    alt=""
                    width={28}
                    height={28}
                    className="w-3.5 h-3.5 rounded-full shrink-0 object-cover"
                  />
                  <span className="truncate">{selected.label}</span>
                </>
              ) : (
                <span className="text-ink-400 ">
                  Select {param.label.toLowerCase()}...
                </span>
              )}
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 ">
                <ChevronDown />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options
                className={clsx(
                  "absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg py-1",
                  "bg-base-100 border border-border-tertiary shadow-lg outline-none"
                )}
              >
                {options.map(opt => (
                  <Listbox.Option
                    key={opt.value}
                    value={opt.value}
                    className={({ active }) =>
                      clsx(
                        "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer",
                        active ? "bg-white/[0.06]" : "",
                        "text-ink-100 "
                      )
                    }
                  >
                    <img
                      src={opt.icon ?? chainIcon(opt.value)}
                      alt=""
                      width={28}
                      height={28}
                      className="w-3.5 h-3.5 rounded-full shrink-0 object-cover"
                    />
                    <span className="truncate">{opt.label}</span>
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        )}
      </Listbox>

      {error && <FieldError message={error} />}
    </div>
  );
}

// =====================================
// ⬢ Multi Select Field
// =====================================
interface ChainMultiSelectProps {
  param: ParamDefinition;
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
}

export function ChainMultiSelect({
  param,
  value,
  onChange,
  error,
}: ChainMultiSelectProps) {
  const options = param.options ?? [];

  const toggle = useCallback(
    (chainValue: string) => {
      if (value.includes(chainValue)) {
        onChange(value.filter(v => v !== chainValue));
      } else {
        onChange([...value, chainValue]);
      }
    },
    [value, onChange]
  );

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel param={param} />

      <div
        className={clsx(
          "flex flex-wrap gap-1.5 p-2 rounded-lg border",
          "bg-white/[0.03] transition-colors",
          error
            ? "border-error"
            : "border-border-tertiary focus-within:border-primary/40"
        )}
      >
        {options.map(opt => {
          const isSelected = value.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={clsx(
                "px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                isSelected
                  ? "bg-primary/20 border border-primary/40 text-primary"
                  : "bg-white/[0.04] border border-border-tertiary text-white/40 hover:text-white/60 hover:border-white/20"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {value.length > 0 && (
        <p className="text-[11px] text-ink-400   ">
          {value.length} chain{value.length !== 1 ? "s" : ""} selected
        </p>
      )}

      {error && <FieldError message={error} />}
    </div>
  );
}
