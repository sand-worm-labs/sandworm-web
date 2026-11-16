import { describe, expect, it } from "vitest";

import { parseKpiNumber, slugifyKey } from "./kpi-form";

describe("slugifyKey", () => {
  it("makes a key from a label", () => {
    expect(slugifyKey("Swap volume")).toBe("swap-volume");
    expect(slugifyKey("  Still trading after 90 days! ")).toBe(
      "still-trading-after-90-days"
    );
    expect(slugifyKey("Volume (USD) / day")).toBe("volume-usd-day");
  });

  it("is empty when there is nothing to make a key from, and never too long", () => {
    expect(slugifyKey("???")).toBe("");
    expect(slugifyKey("a".repeat(100))).toHaveLength(64);
  });
});

describe("parseKpiNumber", () => {
  it("reads plain numbers, with separators and symbols", () => {
    expect(parseKpiNumber("312400")).toBe(312400);
    expect(parseKpiNumber("312,400")).toBe(312400);
    expect(parseKpiNumber("$1,200")).toBe(1200);
    expect(parseKpiNumber("34%")).toBe(34);
    expect(parseKpiNumber(" 0.5 ")).toBe(0.5);
    expect(parseKpiNumber(".5")).toBe(0.5);
    expect(parseKpiNumber("-3")).toBe(-3);
  });

  it("reads K, M, B and T", () => {
    expect(parseKpiNumber("1.84B")).toBe(1_840_000_000);
    expect(parseKpiNumber("21.9k")).toBe(21_900);
    expect(parseKpiNumber("$2M")).toBe(2_000_000);
    expect(parseKpiNumber("-3.5k")).toBe(-3500);
  });

  it("says it is not a number rather than guessing", () => {
    expect(parseKpiNumber("")).toBeNull();
    expect(parseKpiNumber("lots")).toBeNull();
    expect(parseKpiNumber("1.2.3")).toBeNull();
    expect(parseKpiNumber("12abc")).toBeNull();
  });
});
