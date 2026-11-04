import { describe, expect, it } from "vitest";

import { toSparklinePoints } from "./sparkline";

describe("toSparklinePoints", () => {
  it("draws the lowest value at the bottom and the highest at the top", () => {
    expect(toSparklinePoints([1, 2, 3])).toBe("0.0,25.0 100.0,14.0 200.0,3.0");
  });

  it("spreads points evenly across the full width", () => {
    const xs = toSparklinePoints([5, 1, 4, 2, 3])
      .split(" ")
      .map(point => point.split(",")[0]);

    expect(xs).toEqual(["0.0", "50.0", "100.0", "150.0", "200.0"]);
  });

  it("keeps a flat series on one line instead of producing NaN", () => {
    expect(toSparklinePoints([7, 7, 7])).not.toContain("NaN");
  });

  it("returns nothing when there are fewer than two values", () => {
    expect(toSparklinePoints([])).toBe("");
    expect(toSparklinePoints([4])).toBe("");
  });
});
