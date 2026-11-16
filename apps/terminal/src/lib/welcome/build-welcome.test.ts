import { describe, expect, it } from "vitest";

import { sessionMockData } from "@/_mockdata/session";
import { welcomeMockData } from "@/_mockdata/welcome";

import { buildWelcome } from "./build-welcome";

describe("buildWelcome", () => {
  const welcome = buildWelcome(
    welcomeMockData.exchange,
    sessionMockData.exchange
  );

  it("offers the briefing, the analysis and a way to get in touch, in that order", () => {
    expect(welcome.items.map(item => item.route)).toEqual([
      "briefing",
      "analysis",
      "contact",
    ]);
  });

  it("names the client and Sandworm from the session and the site, not the copy", () => {
    expect(welcome.items[1]?.detail).toBe(
      "Picked for Acme from our existing research"
    );
    expect(welcome.items[2]?.detail).toContain("Sandworm");
  });

  it("shows the counts as the lead of the first two rows", () => {
    expect(welcome.items[0]?.lead).toEqual({
      _tag: "count",
      value: "6",
      tone: "brand",
    });
    expect(welcome.items[1]?.lead).toEqual({
      _tag: "count",
      value: "4",
      tone: "navy",
    });
  });
});

describe("welcome content fixtures", () => {
  it.each(Object.entries(welcomeMockData))(
    "%s: has something to show",
    (_kind, content) => {
      expect(content.firstBriefingCount).toBeGreaterThan(0);
      expect(content.briefingHighlight.length).toBeGreaterThan(0);
      expect(content.trackingSummary.length).toBeGreaterThan(0);
    }
  );
});
