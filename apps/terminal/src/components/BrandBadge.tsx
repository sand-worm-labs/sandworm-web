import type { ReactNode } from "react";

export function BrandBadge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-lg border border-[var(--beta-badge-border)] bg-[var(--beta-badge-bg)] px-2 py-0.5 font-tertiary text-[0.6rem] text-[var(--beta-badge-text)] lg:text-xs">
      {children}
    </span>
  );
}
