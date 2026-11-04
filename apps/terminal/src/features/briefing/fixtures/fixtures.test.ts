import { describe, expect, it } from "vitest";

import { briefingFixtures } from ".";

const feeds = Object.entries(briefingFixtures).map(([clientKind, feed]) => ({
  clientKind,
  feed,
}));

describe("briefing fixtures", () => {
  it.each(feeds)("$clientKind: has items with unique ids", ({ feed }) => {
    const ids = feed.items.map(item => item.id);

    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(feeds)(
    "$clientKind: every breakdown bar fits inside its track",
    ({ feed }) => {
      feed.items.forEach(item => {
        item.detail.breakdown?.bars.forEach(bar => {
          expect(bar.share).toBeGreaterThanOrEqual(0);
          expect(bar.share).toBeLessThanOrEqual(100);
        });
      });
    }
  );

  it("Robinhood has the full detail the design shows", () => {
    const withDetail = briefingFixtures.exchange.items.filter(
      item => item.detail.what && item.detail.why && item.detail.headline
    );

    expect(withDetail).toHaveLength(briefingFixtures.exchange.items.length);
  });
});
