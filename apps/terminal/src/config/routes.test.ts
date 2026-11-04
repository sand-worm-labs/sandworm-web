import { describe, expect, it } from "vitest";

import { findRouteByPath, ROUTES } from "./routes";

describe("findRouteByPath", () => {
  it("finds a route by its path", () => {
    expect(findRouteByPath("/")?.label).toBe("Overview");
  });

  it("returns nothing for a path that is not registered", () => {
    expect(findRouteByPath("/nowhere")).toBeUndefined();
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
      "opportunities",
      "requests",
      "commission",
      "setupTracking",
      "setupGoals",
    ]);
  });
});
