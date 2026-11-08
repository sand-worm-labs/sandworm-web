"use client";

import type { ComponentProps } from "react";
import { PiMagnifyingGlass } from "react-icons/pi";
import { Input } from "@sandworm/ui/components/input";
import { cn } from "@sandworm/ui/lib/utils";

type SearchFieldProps = Omit<ComponentProps<typeof Input>, "type"> & {
  label: string;
};

// The same compact, filled search box as the web app's lists (apps/web
// components/inputs/SearchField): no border in light mode, a tinted fill, a
// primary ring on focus.
export function SearchField({
  label,
  className,
  ...inputProps
}: SearchFieldProps) {
  return (
    <div className={cn("relative flex items-center", className)}>
      <PiMagnifyingGlass
        aria-hidden="true"
        size={16}
        className="pointer-events-none absolute left-3 text-ink-400"
      />
      <Input
        type="search"
        aria-label={label}
        className={cn(
          "h-8 rounded-lg border-transparent bg-base-600 py-1 pl-10 pr-4 text-xs text-ink-100 shadow-none placeholder:text-ink-300 md:text-sm",
          "dark:border-border-tertiary dark:bg-base-400 dark:text-white dark:placeholder:text-placeholder-muted",
          "focus-visible:border-transparent focus-visible:ring-[3px] focus-visible:ring-primary",
          "[&::-webkit-search-cancel-button]:hidden"
        )}
        {...inputProps}
      />
    </div>
  );
}
