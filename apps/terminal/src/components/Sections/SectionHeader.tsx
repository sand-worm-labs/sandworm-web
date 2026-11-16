import type { ReactNode } from "react";

import type { RouteId } from "@/config/routes";
import type { SectionCounts } from "@/types";

import { SectionTabs } from "./SectionTabs";

type SectionHeaderProps = {
  current: RouteId;
  title: string;
  subtitle: string;
  counts?: SectionCounts;
  actions?: ReactNode;
  // Beside the title, e.g. the client's logo
  leading?: ReactNode;
};

export function SectionHeader({
  current,
  title,
  subtitle,
  counts,
  actions,
  leading,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          {leading}
          <div>
            <h1 className="text-[22px] font-medium md:text-[26px] leading-tight text-ink-100">
              {title}
            </h1>
            <p className="mt-1.5 text-sm text-ink-400">{subtitle}</p>
          </div>
        </div>
        {actions}
      </div>
      <div className="hidden md:block">
        <SectionTabs current={current} counts={counts} />
      </div>
    </div>
  );
}
