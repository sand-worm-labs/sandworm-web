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
  bookCall: { path: "/book-call", label: "Book a call", isBuilt: false },
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
