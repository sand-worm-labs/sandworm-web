import clsx from "clsx";
import type { ReactNode } from "react";

const toneClassNames = {
  brand:
    "bg-primary-tint-75 dark:bg-primary-910 text-primary-700 dark:text-primary-200",
  glass: "bg-white/60 text-neutral-900 backdrop-blur-sm",
} as const;

type PillProps = {
  tone?: keyof typeof toneClassNames;
  children: ReactNode;
};

export function Pill({ tone = "brand", children }: PillProps) {
  return (
    <span
      className={clsx(
        "inline-flex h-[22px] items-center rounded-md px-2 text-xs font-medium",
        toneClassNames[tone]
      )}
    >
      {children}
    </span>
  );
}
