"use client";

import { useState } from "react";
import { PiCaretDown } from "react-icons/pi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@sandworm/ui/components/dropdown-menu";
import { cn } from "@sandworm/ui/lib/utils";
import clsx from "clsx";

type DropdownOption<Id extends string> = {
  id: Id;
  label: string;
  description?: string;
};

type OptionDropdownProps<Id extends string> = {
  label: string;
  value: Id;
  options: readonly DropdownOption<Id>[];
  onChange: (id: Id) => void;
  disabled?: boolean;
  className?: string;
};

export function OptionDropdown<Id extends string>({
  label,
  value,
  options,
  onChange,
  disabled,
  className,
}: OptionDropdownProps<Id>) {
  const [isOpen, setIsOpen] = useState(false);
  const current = options.find(option => option.id === value);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger
        disabled={disabled}
        aria-label={label}
        className={cn(
          "flex min-w-[70px] items-center gap-1.5 rounded-lg border border-border bg-inputBg px-3 py-0.5 text-sm font-medium text-ink-500 transition-colors hover:bg-inputBg disabled:cursor-not-allowed dark:border-border-tertiary dark:bg-block-surface dark:text-white dark:hover:bg-dropdown-hover",
          className
        )}
      >
        <span className="truncate">{current?.label ?? "—"}</span>
        <PiCaretDown
          aria-hidden="true"
          size={14}
          className={clsx(
            "ml-auto shrink-0 text-ink-navy transition-transform dark:text-ink-400",
            isOpen && "rotate-180"
          )}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-36 min-w-0 gap-0 rounded-lg border-border bg-inputBg p-0 dark:border-border-tertiary dark:bg-block-surface"
      >
        {options.map(option => (
          <DropdownMenuItem
            key={option.id}
            onSelect={() => onChange(option.id)}
            className={clsx(
              "flex-col items-start gap-0 rounded-none px-3 py-1.5 font-body focus:bg-option-hover",
              option.id === value && "dark:bg-dropdown-hover"
            )}
          >
            <span className="text-xs font-medium text-ink-500 dark:text-white">
              {option.label}
            </span>
            {option.description && (
              <span className="mt-1.5 text-[11px] text-ink-400">
                {option.description}
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
