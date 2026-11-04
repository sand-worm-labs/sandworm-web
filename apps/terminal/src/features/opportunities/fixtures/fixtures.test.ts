import { describe, expect, it } from "vitest";

import { sectionCountsFixtures } from "@/features/sections/fixtures";

import { filterOpportunities } from "../opportunity-state";

import { opportunityFixtures } from ".";

const feeds = Object.entries(opportunityFixtures).map(([clientKind, feed]) => ({
  clientKind,
  feed,
}));

describe("opportunity fixtures", () => {
  it.each(feeds)("$clientKind: has items with unique ids", ({ feed }) => {
    const ids = feed.items.map(item => item.id);

    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("Robinhood's open opportunities match the Opportunities tab count", () => {
    const open = filterOpportunities(
      opportunityFixtures.exchange.items,
      "open"
    );

    expect(String(open.length)).toBe(
      sectionCountsFixtures.exchange.opportunities
    );
  });
});
