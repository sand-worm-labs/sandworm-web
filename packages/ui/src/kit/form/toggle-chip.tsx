import type { ReactNode } from "react";

type ToggleChipProps = {
  pressed: boolean;
  disabled?: boolean;
  onToggle: () => void;
  children: ReactNode;
};

export function ToggleChip({
  pressed,
  disabled,
  onToggle,
  children,
}: ToggleChipProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onToggle}
      className={`h-9 rounded-full border px-3.5 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        pressed
          ? "border-primary bg-primary-tint-50 dark:bg-primary-910 text-primary-700 dark:text-primary-200"
          : "border-hover-border bg-block-surface text-ink-500"
      }`}
    >
      {children}
    </button>
  );
}
