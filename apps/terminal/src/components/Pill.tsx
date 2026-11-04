import type { ReactNode } from "react";

export function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-[22px] items-center rounded-md bg-primary-tint-75 dark:bg-primary-910 px-2 text-xs font-medium text-primary-700 dark:text-primary-200">
      {children}
    </span>
  );
}
