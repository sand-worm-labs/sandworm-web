export const iconButtonClassName =
  "flex-shrink-0 flex items-center justify-center rounded-md text-ink-300 hover:text-ink-500 dark:hover:text-ink-200 hover:bg-base-350 dark:hover:bg-base-700 transition-all duration-100";

export const iconButtonSmClassName = `${iconButtonClassName} w-6 h-6`;
export const iconButtonMdClassName = `${iconButtonClassName} w-8 h-8`;

export const surfaceHoverClassName =
  "transition-colors duration-100 hover:bg-primary-tint-50 dark:hover:bg-primary-900";

// Dark-mode-only "tinted pill" treatment shared by primary action buttons
// (Create Project, Restore, Run All) — keeps their dark styling in sync.
export const tintPillDarkClassName =
  "dark:bg-create-project-tint/[0.16] dark:border-border-tertiary dark:text-white dark:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.12)]";
