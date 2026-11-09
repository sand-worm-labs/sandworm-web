import { describe, expect, it } from "vitest";

import { feedGroup } from "./dates";

const now = new Date("2026-11-09T12:00:00");
const daysBefore = (days: number) =>
  new Date(now.getTime() - days * 86_400_000).toISOString();

describe("feedGroup", () => {
  it("names the days of a feed the way a person would", () => {
    expect(feedGroup(daysBefore(0), now)).toBe("Today");
    expect(feedGroup(daysBefore(1), now)).toBe("Yesterday");
    expect(feedGroup(daysBefore(2), now)).toBe("Earlier this week");
    expect(feedGroup(daysBefore(6), now)).toBe("Earlier this week");
    expect(feedGroup(daysBefore(7), now)).toBe("Last week");
    expect(feedGroup(daysBefore(13), now)).toBe("Last week");
    expect(feedGroup(daysBefore(14), now)).toBe("Earlier");
  });
});
