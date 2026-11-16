import { describe, expect, it } from "vitest";

import { overviewMockData } from "@/_mockdata/overview";
import type { Kpi, OverviewBlock } from "@/types";

import { findBlock, withLive } from "./blocks";

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

describe("withLive", () => {
  const base = overviewMockData.protocol;
  const kpi: Kpi = {
    id: "swap-volume",
    label: "Swap volume",
    value: "$1.82B",
    delta: { text: "▼ 9%", tone: "negative" },
    comparison: "vs last month",
  };
  const live = {
    subtitle: "Paycrest",
    kpis: [kpi],
    briefing: {
      subtitle: "Your first briefing",
      entries: base.blocks.flatMap(block =>
        block._tag === "briefing" ? block.entries.slice(0, 1) : []
      ),
    },
    cells: [{ id: "cell", title: "A cell", outputs: [] }],
    signals: base.blocks.flatMap(block =>
      block._tag === "signals" ? block.items.slice(0, 1) : []
    ),
  };

  it("puts the database's content in its blocks and the client's name in the subtitle", () => {
    const data = withLive(base, live);

    expect(data.subtitle).toBe("Paycrest");
    expect(findBlock(data.blocks, "kpis")?.items).toEqual([kpi]);
    expect(findBlock(data.blocks, "briefing")?.entries).toEqual(
      live.briefing.entries
    );
    expect(findBlock(data.blocks, "signals")?.items).toEqual(live.signals);
    expect(findBlock(data.blocks, "cells")?.items).toEqual(live.cells);
  });

  it("leaves out Gaps, and any block with nothing in the database", () => {
    const { blocks } = withLive(base, {
      ...live,
      briefing: { subtitle: "", entries: [] },
    });

    expect(blocks.map(block => block._tag)).toEqual([
      "kpis",
      "signals",
      "cells",
    ]);
  });

  it("leaves the preview numbers in place while there are none yet", () => {
    expect(
      findBlock(withLive(base, { ...live, kpis: [] }).blocks, "kpis")
    ).toEqual(findBlock(base.blocks, "kpis"));
  });
});
