export type Tone = "positive" | "negative" | "neutral";

export const TONE_TEXT_CLASSNAME: Record<Tone, string> = {
  positive: "text-emerald-700 dark:text-emerald-400",
  negative: "text-red-700 dark:text-red-400",
  neutral: "text-ink-500",
};

export const TONE_BADGE_CLASSNAME: Record<Tone, string> = {
  positive:
    "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  negative: "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300",
  neutral: "bg-block-surface text-ink-500 ring-1 ring-inset ring-hover-border",
};
