import clsx from "clsx";

import type { RouteId } from "@/config/routes";

import { AppLink } from "./AppLink";

export type PageTab = {
  id: string;
  label: string;
  route: RouteId;
  count?: string;
};

type PageTabsProps = {
  label: string;
  tabs: readonly PageTab[];
  currentId: string;
};

export function PageTabs({ label, tabs, currentId }: PageTabsProps) {
  return (
    <nav
      aria-label={label}
      className="border-b border-border-secondary dark:border-border-tertiary"
    >
      <div role="tablist" className="flex gap-1 overflow-x-auto">
        {tabs.map(tab => {
          const isSelected = tab.id === currentId;
          return (
            <AppLink
              key={tab.id}
              role="tab"
              route={tab.route}
              isCurrent={isSelected}
              isSelected={isSelected}
              className={clsx(
                "relative inline-flex h-11 shrink-0 items-center px-3 text-sm font-medium transition-colors",
                isSelected
                  ? "text-ink-100 dark:text-white"
                  : "text-ink-400 hover:text-ink-100 dark:hover:text-white"
              )}
            >
              {tab.label}
              {tab.count && (
                <span className="ml-1 text-xs font-normal text-ink-400">
                  {tab.count}
                </span>
              )}
              {isSelected && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary"
                />
              )}
            </AppLink>
          );
        })}
      </div>
    </nav>
  );
}
