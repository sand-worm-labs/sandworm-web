import { describe, expect, it } from "vitest";

import type { OverviewBlock } from "@/types";

import { findBlock } from "./blocks";

const kpis: OverviewBlock = {
  id: "kpis",
  title: "KPIs",
  isOptional: false,
  _tag: "kpis",
  items: [],
};

describe("findBlock", () => {
  it("finds a block by its tag", () => {
    expect(findBlock([kpis], "kpis")).toBe(kpis);
  });

  it("returns undefined when the tag is missing", () => {
    expect(findBlock([kpis], "gaps")).toBeUndefined();
  });
});
