"use client";

import type { ComponentProps } from "react";
import { Label } from "@sandworm/ui/components/label";
import { Textarea } from "@sandworm/ui/components/textarea";
import { cn } from "@sandworm/ui/lib/utils";

import { baseFont } from "@/config/fonts";

import { focusRingClassName, labelClassName } from "./styles";

type TextAreaFieldProps = Omit<ComponentProps<typeof Textarea>, "id"> & {
  id: string;
  label: string;
  monospaced?: boolean;
};

export function TextAreaField({
  id,
  label,
  monospaced,
  className,
  ...textareaProps
}: TextAreaFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className={labelClassName}>
        {label}
      </Label>
      <Textarea
        id={id}
        className={cn(
          "rounded-[10px] border-hover-border bg-block-surface px-3 py-2.5 text-sm text-ink-100 dark:bg-block-surface",
          focusRingClassName,
          monospaced && `${baseFont.className} text-xs leading-[1.7]`,
          className
        )}
        {...textareaProps}
      />
    </div>
  );
}
