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
  project: { path: "/analysis/project", label: "Project", isBuilt: true },
  region: { path: "/analysis/region", label: "Region", isBuilt: true },
  sector: { path: "/analysis/sector", label: "Sector", isBuilt: true },
  signals: {
    path: "/signals",
    label: "Signals",
    isBuilt: true,
  },
  signal: {
    path: "/signals/signal",
    label: "Signal",
    isBuilt: false,
  },
  requests: { path: "/requests", label: "Requests", isBuilt: true },
  newRequest: {
    path: "/requests/new",
    label: "Submit a request",
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

export function routePath(route: RouteId, slug?: string): string {
  const { path } = ROUTES[route];
  return slug ? `${path}/${slug}` : path;
}

export function findRouteByPath(pathname: string) {
  const routes = Object.values<RouteDefinition>(ROUTES);

  return (
    routes.find(route => route.path === pathname) ??
    routes
      .filter(
        route => route.path !== "/" && pathname.startsWith(`${route.path}/`)
      )
      .sort((a, b) => b.path.length - a.path.length)[0]
  );
}

// Where a page that isn't built yet sends people instead: the section it
// belongs to, so every link still goes somewhere useful.
const FALLBACK_ROUTES: Partial<Record<RouteId, RouteId>> = {
  briefingArchive: "briefing",
  report: "analysis",
  project: "analysis",
  region: "analysis",
  sector: "analysis",
  signal: "signals",
};

// The address a link to `route` goes to, or null when there is nowhere to go.
// A slug (an entity page) only applies when the route itself is built; the
// fallback section has no page for it.
export function routeHref(
  route: RouteId,
  query?: Record<string, string>,
  slug?: string
): string | null {
  const { isBuilt } = ROUTES[route];
  const target = isBuilt ? route : FALLBACK_ROUTES[route];
  if (!target) return null;

  const path = isBuilt ? routePath(route, slug) : ROUTES[target].path;
  const search = query ? `?${new URLSearchParams(query)}` : "";
  return `${path}${search}`;
}
