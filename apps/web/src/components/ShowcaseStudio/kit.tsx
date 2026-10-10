"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

// =====================================
// ⬢  Class names
// =====================================
export const inputClass =
  "w-full h-9 rounded-lg px-3 text-sm bg-inputBg dark:bg-header-surface border border-hover-border dark:border-border-dark text-ink-100 dark:text-white placeholder:text-ink-300 outline-none focus:border-primary disabled:opacity-60";

export const textareaClass = cn(inputClass, "h-auto py-2 leading-relaxed");

export const primaryButton =
  "inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50";

export const quietButton =
  "inline-flex h-9 items-center justify-center rounded-lg border border-border-secondary dark:border-border-tertiary bg-base-100 px-3 text-sm text-ink-400 transition-colors hover:text-ink-100 dark:hover:text-white disabled:opacity-50";

export const dangerButton =
  "inline-flex h-9 items-center justify-center rounded-lg border border-red-300 dark:border-red-900 px-3 text-sm text-red-600 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-50";

// =====================================
// ⬢  Field
// =====================================
export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-[13px] font-medium text-ink-100 dark:text-white">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-300">{hint}</span>}
    </label>
  );
}

// =====================================
// ⬢  Notice
// =====================================
// The result of the last save: what happened, or what the server refused.
export function Notice({
  notice,
}: {
  notice: { kind: "ok" | "error"; text: string } | null;
}) {
  if (!notice) return null;
  return (
    <p
      role={notice.kind === "error" ? "alert" : "status"}
      className={cn(
        "text-sm",
        notice.kind === "error"
          ? "text-red-600 dark:text-red-400"
          : "text-emerald-600 dark:text-emerald-400"
      )}
    >
      {notice.text}
    </p>
  );
}

// Runs a save and turns its outcome into a notice.
export type NoticeState = { kind: "ok" | "error"; text: string } | null;

export async function attempt(
  run: () => Promise<unknown>,
  done: string
): Promise<NoticeState> {
  try {
    await run();
    return { kind: "ok", text: done };
  } catch (err) {
    return {
      kind: "error",
      text: err instanceof Error ? err.message : "Something went wrong",
    };
  }
}
