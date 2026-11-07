import { PageTabs, type PageTab } from "@/components/PageTabs";
import { ROUTES, type RouteId } from "@/config/routes";
import type { SectionCounts } from "@/features/sections/types";

type Section = { route: RouteId; countKey?: keyof SectionCounts };

const SECTIONS: readonly Section[] = [
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
    count: counts && countKey ? counts[countKey] : undefined,
  }));

  return <PageTabs label="Terminal sections" tabs={tabs} currentId={current} />;
}
