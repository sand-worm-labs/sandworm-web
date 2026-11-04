import { describe, expect, it } from "vitest";

import { formatShortDate, pluralise } from "./format";

describe("pluralise", () => {
  it("uses the singular for one and the plural otherwise", () => {
    expect(pluralise(1, "report")).toBe("1 report");
    expect(pluralise(0, "report")).toBe("0 reports");
    expect(pluralise(3, "report")).toBe("3 reports");
  });
});

describe("formatShortDate", () => {
  it("prints the day and month in UTC", () => {
    expect(formatShortDate("2026-11-02T10:00:00.000Z")).toBe("2 Nov");
    expect(formatShortDate("2026-11-02T23:59:59.000Z")).toBe("2 Nov");
  });
});
