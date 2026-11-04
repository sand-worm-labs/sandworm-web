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
  requests: { path: "/requests", label: "Requests", isBuilt: false },
  commission: {
    path: "/requests/new",
    label: "Commission research",
    isBuilt: false,
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

export function findRouteByPath(pathname: string) {
  return Object.values(ROUTES).find(route => route.path === pathname);
}
