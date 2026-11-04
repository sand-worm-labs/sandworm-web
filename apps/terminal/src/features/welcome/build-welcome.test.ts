import { describe, expect, it } from "vitest";

import { sessionFixtures } from "@/features/session/fixtures";

import { buildWelcome } from "./build-welcome";
import { welcomeContentFixtures } from "./fixtures";

describe("buildWelcome", () => {
  const welcome = buildWelcome(
    welcomeContentFixtures.exchange,
    sessionFixtures.exchange
  );

  it("offers the briefing, the analysis and the kick-off call, in that order", () => {
    expect(welcome.items.map(item => item.route)).toEqual([
      "briefing",
      "analysis",
      "bookCall",
    ]);
  });

  it("takes the call time and length from the session, not from the copy", () => {
    const call = welcome.items[2];

    expect(call?.title).toBe("Kick-off call, Thu 5 Nov, 15:00 PT");
    expect(call?.detail).toBe(
      "30 minutes with Tobi. Change the time if it doesn't suit."
    );
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
  it.each(Object.entries(welcomeContentFixtures))(
    "%s: has something to show",
    (_kind, content) => {
      expect(content.firstBriefingCount).toBeGreaterThan(0);
      expect(content.briefingHighlight.length).toBeGreaterThan(0);
      expect(content.trackingSummary.length).toBeGreaterThan(0);
    }
  );
});
