import type { ReactNode } from "react";

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-[22px] items-center whitespace-nowrap rounded-md bg-hover-bg px-2 text-xs text-ink-400">
      {children}
    </span>
  );
}
