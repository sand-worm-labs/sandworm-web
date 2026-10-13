import { tintPillDarkClassName } from "@/styles/interactive";

const primaryButtonBase = `bg-primary hover:bg-primary-720 disabled:bg-disabled dark:disabled:bg-[#4a4a48] text-border-secondary font-medium rounded-xl transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm border border-transparent ${tintPillDarkClassName}`;

export const modalPrimaryButtonClassName = `w-full py-3.5 px-4 ${primaryButtonBase}`;

export const modalInlinePrimaryButtonClassName = `py-2.5 px-6 ${primaryButtonBase}`;

export const modalSecondaryButtonClassName =
  "py-2.5 px-5 rounded-xl text-sm font-medium text-ink-100 dark:text-white border border-border dark:border-border-tertiary hover:bg-hover-bg dark:hover:bg-base-600 transition-colors";

export const modalLabelClassName =
  "block text-sm font-medium text-ink-100 dark:text-gray-300 mb-2";

export const modalInputClassName =
  "w-full px-3 py-2.5 rounded-xl bg-inputBg dark:bg-dropdown-bg border border-border dark:border-border-tertiary text-ink-100 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm font-medium";

export const modalSelectTriggerClassName =
  "w-full px-3 py-2.5 rounded-xl border border-border dark:border-border-tertiary dark:bg-dropdown-bg text-sm font-medium bg-inputBg text-ink-100 dark:text-white focus:border-primary outline-none transition-colors font-body h-auto";

export const modalSelectContentClassName =
  "z-[70] w-[var(--radix-select-trigger-width)] max-h-72 bg-white dark:bg-dropdown-bg border-border-tertiary font-body text-ink-200 dark:text-ink-300 dark:border-border-tertiary rounded-xl";

export const modalSelectItemClassName =
  "hover:bg-primary/20 dark:hover:bg-dropdown-hover dark:hover:text-white";
