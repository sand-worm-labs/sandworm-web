// The look the public sections share (Showcase, Community, Bounties): a
// mono eyebrow over a large headline, split-flap number tiles, and dense
// "board" panels with a mono header row. Everything here uses the app's
// theme colors, so the three sections match each other in light and dark.
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

// =====================================
// ⬢  Class names
// =====================================
export const eyebrowClass =
  "font-body-mono text-[11px] uppercase tracking-[0.22em] text-primary dark:text-primary-tint-75";

export const boardClass =
  "rounded-xl overflow-hidden bg-base-100 border border-border-secondary dark:border-border-tertiary";

export const boardHeadClass =
  "font-body-mono text-[10px] uppercase tracking-[0.18em] text-primary dark:text-primary-tint-75 bg-inputBg dark:bg-header-surface border-b border-border-secondary dark:border-border-tertiary";

// A row lights up with a bar of the accent color on its left edge.
export const boardRowClass =
  "group relative border-b border-border-secondary dark:border-border-tertiary last:border-b-0 hover:bg-inputBg dark:hover:bg-header-surface transition-colors before:absolute before:inset-y-0 before:left-0 before:w-[2px] before:bg-primary before:opacity-0 hover:before:opacity-100";

export const boardLabelClass =
  "font-body-mono text-[10px] uppercase tracking-[0.18em] text-ink-300";

export const toggleClass = (active: boolean) =>
  cn(
    "font-body-mono h-7 shrink-0 rounded-[5px] px-2.5 text-[11px] uppercase tracking-[0.12em] border transition-colors",
    active
      ? "bg-primary border-primary text-white"
      : "bg-base-100 border-border-secondary dark:border-border-tertiary text-ink-400 hover:text-ink-100 dark:hover:text-white hover:border-primary"
  );

// A faint grid behind a section, like the panel a board is mounted on.
export const gridBackdrop = {
  backgroundImage:
    "linear-gradient(rgba(127,127,127,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(127,127,127,0.07) 1px, transparent 1px)",
  backgroundSize: "44px 44px",
};

// Keyframes Tailwind has no utilities for. Rows drop in one after another;
// flaps turn over once. Both stay still for visitors who ask for less motion.
const BOARD_CSS = `
  @keyframes board-row-in {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: none; }
  }
  @keyframes board-flap {
    0%   { transform: rotateX(-90deg); opacity: 0; }
    60%  { transform: rotateX(12deg); opacity: 1; }
    100% { transform: none; opacity: 1; }
  }
  .board-row  { animation: board-row-in 420ms cubic-bezier(.2,.7,.2,1) both; }
  .board-flap { animation: board-flap 520ms cubic-bezier(.2,.7,.2,1) both; backface-visibility: hidden; }
  @media (prefers-reduced-motion: reduce) {
    .board-row, .board-flap { animation: none; }
  }
`;

export function BoardStyles() {
  return <style>{BOARD_CSS}</style>;
}

// =====================================
// ⬢  Flap
// =====================================
// A run of split-flap tiles, one per character.
export function Flap({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  return (
    <span
      aria-label={text}
      className={cn(
        "font-body-mono inline-flex gap-[2px] [perspective:400px]",
        className
      )}
    >
      {text.split("").map((char, index) => (
        <span
          // The same character can appear twice; position tells them apart.
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          aria-hidden="true"
          style={{ animationDelay: `${delay + index * 45}ms` }}
          className="board-flap relative inline-flex h-[1.75em] min-w-[1.2em] items-center justify-center rounded-[3px] px-[0.22em] bg-[#17191E] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] after:absolute after:inset-x-0 after:top-1/2 after:h-px after:bg-black/70"
        >
          {char}
        </span>
      ))}
    </span>
  );
}

// =====================================
// ⬢  Stat
// =====================================
// A labelled flap number, for the right side of a section hero. A count of
// zero says nothing, so it is left out.
export function BoardStat({
  label,
  count,
  delay,
}: {
  label: ReactNode;
  count: number;
  delay?: number;
}) {
  if (count === 0) return null;

  return (
    <div>
      <dt className={boardLabelClass}>{label}</dt>
      <dd className="mt-1.5 text-sm">
        <Flap text={String(count).padStart(2, "0")} delay={delay} />
      </dd>
    </div>
  );
}

// =====================================
// ⬢  Section hero
// =====================================
export function SectionHero({
  eyebrow,
  title,
  description,
  aside,
  compact = false,
}: {
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  // Stats, clocks or actions, shown to the right on wide screens.
  aside?: ReactNode;
  // A smaller headline, for sections shown inside the app.
  compact?: boolean;
}) {
  return (
    <section
      className={cn(
        "flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 lg:gap-10",
        compact ? "pt-6 pb-6" : "pt-10 sm:pt-14 pb-8"
      )}
    >
      <BoardStyles />
      <div className="min-w-0">
        <p className={eyebrowClass}>{eyebrow}</p>
        <h1
          className={cn(
            "mt-3 max-w-3xl font-semibold tracking-[-0.02em] text-ink-100 dark:text-white",
            compact
              ? "text-2xl sm:text-3xl leading-tight"
              : "text-[2rem] sm:text-5xl leading-[1.05]"
          )}
        >
          {title}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-ink-400">
          {description}
        </p>
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </section>
  );
}
