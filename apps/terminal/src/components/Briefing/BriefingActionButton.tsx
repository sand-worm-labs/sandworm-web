import type { ComponentType } from "react";
import clsx from "clsx";

type BriefingActionButtonProps = {
  label: string;
  icon: ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
  onClick: () => void;
  // The label beside the icon, where there is room
  isLabelled?: boolean;
};

// One thing to do with a briefing item. The label is always there for a screen
// reader and for a hover; a phone gets 44px to tap.
export function BriefingActionButton({
  label,
  icon: Icon,
  onClick,
  isLabelled,
}: BriefingActionButtonProps) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className={clsx(
        "inline-flex items-center justify-center gap-1.5 rounded-lg text-xs font-medium text-ink-400 transition-colors hover:bg-hover-bg hover:text-ink-100",
        isLabelled ? "h-11 px-3 lg:h-8 lg:px-2.5" : "size-7"
      )}
    >
      <Icon size={16} aria-hidden />
      <span className={isLabelled ? undefined : "sr-only"}>{label}</span>
    </button>
  );
}
