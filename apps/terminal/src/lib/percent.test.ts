import { describe, expect, it } from "vitest";

import { toPercent } from "./percent";

describe("toPercent", () => {
  it("rounds to a whole percent", () => {
    expect(toPercent(1, 3)).toBe(33);
    expect(toPercent(2, 5)).toBe(40);
  });

  it("never goes past 100 or below 0", () => {
    expect(toPercent(9, 4)).toBe(100);
    expect(toPercent(-2, 4)).toBe(0);
  });

  it("treats an empty allowance as zero instead of dividing by zero", () => {
    expect(toPercent(3, 0)).toBe(0);
  });
});
