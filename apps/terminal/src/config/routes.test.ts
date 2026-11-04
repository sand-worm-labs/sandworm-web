import { describe, expect, it } from "vitest";

import { findRouteByPath, ROUTES, routePath } from "./routes";

describe("findRouteByPath", () => {
  it("finds a route by its path", () => {
    expect(findRouteByPath("/")?.label).toBe("Overview");
  });

  it("returns nothing for a path that is not registered", () => {
    expect(findRouteByPath("/nowhere")).toBeUndefined();
  });

  it("finds the closest route for a page under it", () => {
    expect(findRouteByPath("/analysis/project/paycrest")?.label).toBe(
      "Project"
    );
    expect(findRouteByPath("/requests/new")?.label).toBe("Commission research");
    expect(findRouteByPath("/analysis/other")?.label).toBe("Analysis");
    expect(findRouteByPath("/analysisx")).toBeUndefined();
  });
});

describe("routePath", () => {
  it("appends a slug to the route's path", () => {
    expect(routePath("project", "paycrest")).toBe("/analysis/project/paycrest");
    expect(routePath("analysis")).toBe("/analysis");
  });
});

describe("ROUTES", () => {
  it("only marks pages that exist as built", () => {
    const built = Object.entries(ROUTES)
      .filter(([, route]) => route.isBuilt)
      .map(([id]) => id);

    expect(built).toEqual([
      "overview",
      "briefing",
      "analysis",
      "project",
      "region",
      "sector",
      "opportunities",
      "requests",
      "commission",
      "setupTracking",
      "setupGoals",
    ]);
  });
});
