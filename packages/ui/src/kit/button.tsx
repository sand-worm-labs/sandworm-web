import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

const baseClassName =
  "transition-colors duration-100 disabled:pointer-events-none disabled:opacity-50";

const solidClassName =
  "inline-flex items-center justify-center rounded-xl border";

const sizeClassNames = {
  md: "px-5 py-1.5 text-sm",
  sm: "px-3 py-0.5 text-xs",
} as const;

const solidVariantClassNames = {
  primary: "border-transparent bg-primary text-white hover:bg-primary-720",
  secondary:
    "border-border bg-inputBg text-ink-400 hover:border-primary hover:bg-hover-bg dark:border-border-tertiary",
} as const;

const linkClassName =
  "text-sm text-primary-700 dark:text-primary-200 hover:text-primary";

export type ButtonVariant = keyof typeof solidVariantClassNames | "link";
export type ButtonSize = keyof typeof sizeClassNames;

type ButtonStyleOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

export function buttonClassName({
  variant = "primary",
  size = "md",
  className,
}: ButtonStyleOptions = {}): string {
  if (variant === "link") return clsx(baseClassName, linkClassName, className);

  return clsx(
    baseClassName,
    solidClassName,
    sizeClassNames[size],
    solidVariantClassNames[variant],
    className
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  Omit<ButtonStyleOptions, "className">;

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={buttonClassName({ variant, size, className })}
      {...props}
    />
  );
}
