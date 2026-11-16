"use client";

import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  PiChartLineUp,
  PiChatCircleText,
  PiLightning,
  PiNewspaper,
  PiSquaresFour,
} from "react-icons/pi";

import { AppLink } from "@/components/AppLink";
import { SECTIONS } from "@/components/Sections/SectionTabs";
import { findRouteByPath, ROUTES, type RouteId } from "@/config/routes";
import { tabCount } from "@/lib/sections/tab-count";
import type { SectionCounts } from "@/types";

const ICONS: Partial<Record<RouteId, typeof PiSquaresFour>> = {
  overview: PiSquaresFour,
  briefing: PiNewspaper,
  analysis: PiChartLineUp,
  signals: PiLightning,
  requests: PiChatCircleText,
};

// The sections as an app's tab bar: under the thumb on a phone, where the page
// tabs are too high to reach. Desktop keeps the page tabs.
export function BottomNav({ counts }: { counts: SectionCounts }) {
  const currentPath = findRouteByPath(usePathname() ?? "/")?.path;

  return (
    <nav
      aria-label="Terminal sections"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border-secondary bg-base-100 pb-[env(safe-area-inset-bottom)] dark:border-border-tertiary dark:bg-header-surface md:hidden"
    >
      <ul className="flex h-14">
        {SECTIONS.map(({ route, countKey }) => {
          const Icon = ICONS[route] ?? PiSquaresFour;
          const isCurrent = ROUTES[route].path === currentPath;
          const count = tabCount(countKey && counts[countKey]);

          return (
            <li key={route} className="flex-1">
              <AppLink
                route={route}
                isCurrent={isCurrent}
                className={clsx(
                  "relative flex h-full select-none flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors active:bg-hover-bg",
                  isCurrent ? "text-primary" : "text-ink-400"
                )}
              >
                <Icon size={22} aria-hidden="true" />
                {ROUTES[route].label}
                {count && (
                  <span className="absolute left-1/2 top-1.5 ml-2 min-w-4 rounded-full bg-primary px-1 text-center text-[10px] leading-4 text-white">
                    {count}
                  </span>
                )}
              </AppLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
