"use client";

import { PiCaretDown } from "react-icons/pi";
import { cn } from "@sandworm/ui/lib/utils";

import { focusRingClassName } from "@sandworm/ui/kit/form/styles";

type SelectOption<Id extends string> = { id: Id; label: string };

const sizeClassNames = { md: "h-[38px]", sm: "h-8" } as const;

type NativeSelectProps<Id extends string> = {
  label: string;
  value: Id;
  options: readonly SelectOption<Id>[];
  onChange: (id: Id) => void;
  // md lines up with a form field, sm with a compact search box
  size?: keyof typeof sizeClassNames;
  // Sizes the whole control (the chevron sits inside it), e.g. w-full
  className?: string;
};

export function NativeSelect<Id extends string>({
  label,
  value,
  options,
  onChange,
  size = "md",
  className,
}: NativeSelectProps<Id>) {
  return (
    <div className={cn("relative inline-flex items-center", className)}>
      <select
        aria-label={label}
        value={value}
        className={cn(
          "w-full cursor-pointer appearance-none rounded-[10px] border border-hover-border bg-block-surface pl-3 pr-9 text-[13px] text-ink-100 outline-none",
          sizeClassNames[size],
          focusRingClassName
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
      <PiCaretDown
        aria-hidden="true"
        size={12}
        className="pointer-events-none absolute right-3.5 text-ink-400"
      />
    </div>
  );
}
