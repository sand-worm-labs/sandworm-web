import { describe, expect, it } from "vitest";

import { overviewMockData } from "@/_mockdata/overview";
import type { Kpi, OverviewBlock } from "@/types";

import { findBlock, withKpis } from "./blocks";

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

describe("withKpis", () => {
  const live: readonly Kpi[] = [
    {
      id: "swap-volume",
      label: "Swap volume",
      value: "$1.82B",
      delta: { text: "▼ 9%", tone: "negative" },
      comparison: "vs last month",
    },
  ];
  const base = overviewMockData.protocol;

  it("puts the database's key numbers in the key numbers block", () => {
    expect(findBlock(withKpis(base, live).blocks, "kpis")?.items).toEqual(live);
  });

  it("keeps the rest of the Overview as it was", () => {
    const { blocks } = withKpis(base, live);
    expect(blocks.map(block => block._tag)).toEqual(
      base.blocks.map(block => block._tag)
    );
  });

  it("leaves the preview numbers in place while there are none yet", () => {
    expect(withKpis(base, []).blocks).toEqual(base.blocks);
  });
});
