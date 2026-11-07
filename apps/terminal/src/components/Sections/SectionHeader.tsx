import type { ReactNode } from "react";

import type { RouteId } from "@/config/routes";
import type { SectionCounts } from "@/features/sections/types";

import { SectionTabs } from "./SectionTabs";

type SectionHeaderProps = {
  current: RouteId;
  title: string;
  subtitle: string;
  counts?: SectionCounts;
  actions?: ReactNode;
};

export function SectionHeader({
  current,
  title,
  subtitle,
  counts,
  actions,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-medium leading-tight text-ink-100">
            {title}
          </h1>
          <p className="mt-1.5 text-sm text-ink-400">{subtitle}</p>
        </div>
        {actions}
      </div>
      <SectionTabs current={current} counts={counts} />
    </div>
  );
}
