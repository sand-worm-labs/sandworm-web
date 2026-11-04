"use client";

import type { ReactNode } from "react";
import { Label } from "@sandworm/ui/components/label";
import { cn } from "@sandworm/ui/lib/utils";

import { Checkbox } from "./Checkbox";

type CheckboxFieldProps = {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: ReactNode;
  description?: string;
};

export function CheckboxField({
  id,
  checked,
  onCheckedChange,
  label,
  description,
}: CheckboxFieldProps) {
  return (
    <div className="flex items-start gap-2.5">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="mt-0.5"
      />
      <Label
        htmlFor={id}
        className="flex-col items-start gap-0.5 text-[13px] font-normal leading-snug"
      >
        <span
          className={cn(
            description ? "font-medium text-ink-100" : "text-ink-500"
          )}
        >
          {label}
        </span>
        {description && (
          <span className="text-xs text-ink-400">{description}</span>
        )}
      </Label>
    </div>
  );
}
