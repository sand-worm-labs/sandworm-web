"use client";

import type { ComponentProps } from "react";
import { PiMagnifyingGlass } from "react-icons/pi";
import { Input } from "@sandworm/ui/components/input";
import { cn } from "@sandworm/ui/lib/utils";

import { fieldClassName } from "@sandworm/ui/kit/form/styles";

type SearchFieldProps = Omit<ComponentProps<typeof Input>, "type"> & {
  label: string;
};

export function SearchField({
  label,
  className,
  ...inputProps
}: SearchFieldProps) {
  return (
    <div className={cn("relative flex items-center", className)}>
      <PiMagnifyingGlass
        aria-hidden="true"
        size={14}
        className="pointer-events-none absolute left-3 text-ink-400"
      />
      <Input
        type="search"
        aria-label={label}
        className={cn(
          fieldClassName,
          "pl-8 [&::-webkit-search-cancel-button]:hidden"
        )}
        {...inputProps}
      />
    </div>
  );
}
