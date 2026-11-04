"use client";

import { cn } from "@sandworm/ui/lib/utils";

import { focusRingClassName } from "./styles";

type SelectOption<Id extends string> = { id: Id; label: string };

type NativeSelectProps<Id extends string> = {
  label: string;
  value: Id;
  options: readonly SelectOption<Id>[];
  onChange: (id: Id) => void;
  className?: string;
};

export function NativeSelect<Id extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: NativeSelectProps<Id>) {
  return (
    <select
      aria-label={label}
      value={value}
      className={cn(
        "h-[38px] rounded-[10px] border border-hover-border bg-block-surface px-2 text-[13px] text-ink-100 outline-none",
        focusRingClassName,
        className
      )}
      onChange={event => {
        const selected = options.find(
          option => option.id === event.target.value
        );
        if (selected) onChange(selected.id);
      }}
    >
      {options.map(option => (
        <option key={option.id} value={option.id}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
