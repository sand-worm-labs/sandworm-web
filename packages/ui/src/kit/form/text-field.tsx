"use client";

import type { ComponentProps } from "react";
import { Input } from "@sandworm/ui/components/input";
import { Label } from "@sandworm/ui/components/label";
import { cn } from "@sandworm/ui/lib/utils";

import { fieldClassName, labelClassName } from "@sandworm/ui/kit/form/styles";

type TextFieldProps = Omit<ComponentProps<typeof Input>, "id"> & {
  id: string;
  label: string;
  hideLabel?: boolean;
};

export function TextField({
  id,
  label,
  hideLabel,
  className,
  ...inputProps
}: TextFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label
        htmlFor={id}
        className={cn(labelClassName, hideLabel && "sr-only")}
      >
        {label}
      </Label>
      <Input id={id} className={fieldClassName} {...inputProps} />
    </div>
  );
}
