import { PageTabs, type PageTab } from "@/components/PageTabs";
import { ROUTES, type RouteId } from "@/config/routes";
import { tabCount } from "@/lib/sections/tab-count";
import type { SectionCounts } from "@/types";

type Section = { route: RouteId; countKey?: keyof SectionCounts };

export const SECTIONS: readonly Section[] = [
  { route: "overview" },
  { route: "briefing", countKey: "briefing" },
  { route: "analysis", countKey: "analysis" },
  { route: "signals", countKey: "signals" },
  { route: "requests", countKey: "requests" },
];

type SectionTabsProps = { current: RouteId; counts?: SectionCounts };

export function SectionTabs({ current, counts }: SectionTabsProps) {
  const tabs: PageTab[] = SECTIONS.map(({ route, countKey }) => ({
    id: route,
    route,
    label: ROUTES[route].label,
    count: tabCount(countKey && counts?.[countKey]),
  }));

  return <PageTabs label="Terminal sections" tabs={tabs} currentId={current} />;
}
