import { describe, expect, it } from "vitest";

import { REGION_OPTIONS, toRegionId } from "./regions";

const ids = REGION_OPTIONS.map(option => option.id);

describe("REGION_OPTIONS", () => {
  it("lists continents, then regions, then countries, each with a name", () => {
    expect(REGION_OPTIONS[0]?.label).toBe("Africa");
    expect(REGION_OPTIONS[0]?.group).toBe("Continents");
    expect(REGION_OPTIONS.find(option => option.id === "019")?.label).toBe(
      "Americas"
    );
    expect(REGION_OPTIONS.find(option => option.id === "419")?.group).toBe(
      "Regions"
    );
    expect(REGION_OPTIONS.at(-1)?.group).toBe("Countries");
    expect(REGION_OPTIONS.find(option => option.id === "419")?.label).toBe(
      "Latin America"
    );
    expect(REGION_OPTIONS.find(option => option.id === "NG")?.label).toBe(
      "Nigeria"
    );
  });

  it("leaves out places that are not countries", () => {
    expect(ids).not.toContain("EU");
    expect(ids).not.toContain("UN");
    expect(ids).not.toContain("AQ");
  });
});

describe("toRegionId", () => {
  it("turns a name typed before the list existed into its code", () => {
    expect(toRegionId("Nigeria")).toBe("NG");
    expect(toRegionId(" latin america ")).toBe("419");
    expect(toRegionId("UK")).toBe("GB");
  });

  it("leaves a code, and something it does not know, as it was", () => {
    expect(toRegionId("NG")).toBe("NG");
    expect(toRegionId("United state")).toBe("United state");
  });
});
