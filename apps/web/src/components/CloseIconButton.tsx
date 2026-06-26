"use client";

import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";
import { PiX } from "react-icons/pi";

import {
  iconButtonClassName,
  iconButtonMdClassName,
  iconButtonSmClassName,
} from "@/styles/interactive";

const ICON_SIZE = { sm: 13, md: 18 } as const;

export type CloseIconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "type"
> & {
  size?: keyof typeof ICON_SIZE;
  round?: boolean;
  iconSize?: number;
};

export function CloseIconButton({
  size = "md",
  round = false,
  iconSize,
  className,
  "aria-label": ariaLabel = "Close",
  ...props
}: CloseIconButtonProps) {
  const sizeClasses = round
    ? clsx(
        iconButtonClassName,
        size === "sm" ? "h-6 w-6" : "h-8 w-8",
        "rounded-full"
      )
    : size === "sm"
      ? iconButtonSmClassName
      : iconButtonMdClassName;

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={clsx(sizeClasses, className)}
      {...props}
    >
      <PiX size={iconSize ?? ICON_SIZE[size]} />
    </button>
  );
}
