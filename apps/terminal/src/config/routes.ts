type RouteDefinition = { path: string; label: string; isBuilt: boolean };

export const ROUTES = {
  overview: { path: "/", label: "Overview", isBuilt: true },
  briefing: { path: "/briefing", label: "Briefing", isBuilt: true },
  briefingArchive: {
    path: "/briefing/archive",
    label: "Briefing archive",
    isBuilt: false,
  },
  analysis: { path: "/analysis", label: "Analysis", isBuilt: true },
  report: { path: "/analysis/report", label: "Report", isBuilt: false },
  project: { path: "/analysis/project", label: "Project", isBuilt: false },
  region: { path: "/analysis/region", label: "Region", isBuilt: false },
  sector: { path: "/analysis/sector", label: "Sector", isBuilt: false },
  opportunities: {
    path: "/opportunities",
    label: "Opportunities",
    isBuilt: true,
  },
  opportunity: {
    path: "/opportunities/opportunity",
    label: "Opportunity",
    isBuilt: false,
  },
  requests: { path: "/requests", label: "Requests", isBuilt: true },
  commission: {
    path: "/requests/new",
    label: "Commission research",
    isBuilt: true,
  },
  contact: { path: "/contact", label: "Contact us", isBuilt: false },
  setupTracking: {
    path: "/setup/tracking",
    label: "What to track",
    isBuilt: true,
  },
  setupGoals: { path: "/setup/goals", label: "Goals and team", isBuilt: true },
} as const satisfies Record<string, RouteDefinition>;

export type RouteId = keyof typeof ROUTES;

export function findRouteByPath(pathname: string) {
  return Object.values(ROUTES).find(route => route.path === pathname);
}

// Where a page that isn't built yet sends people instead: the section it
// belongs to, so every link still goes somewhere useful.
const FALLBACK_ROUTES: Partial<Record<RouteId, RouteId>> = {
  briefingArchive: "briefing",
  report: "analysis",
  project: "analysis",
  region: "analysis",
  sector: "analysis",
  opportunity: "opportunities",
};

// The address a link to `route` goes to, or null when there is nowhere to go.
export function routeHref(
  route: RouteId,
  query?: Record<string, string>
): string | null {
  const target = ROUTES[route].isBuilt ? route : FALLBACK_ROUTES[route];
  if (!target) return null;

  const search = query ? `?${new URLSearchParams(query)}` : "";
  return `${ROUTES[target].path}${search}`;
}
