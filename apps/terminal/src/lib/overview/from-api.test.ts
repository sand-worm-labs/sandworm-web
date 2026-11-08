import { describe, expect, it } from "vitest";

import type { Kpi } from "@/types";

import { overviewFromApi, overviewStatusOf } from "./from-api";

const kpis: readonly Kpi[] = [
  {
    id: "swap-volume",
    label: "Swap volume",
    value: "$1.82B",
    delta: { text: "▼ 9%", tone: "negative" },
    comparison: "vs last month",
  },
];

describe("overviewStatusOf", () => {
  it("is setting up until the client is live", () => {
    expect(overviewStatusOf({ clientStatus: "setting_up", kpis })).toBe(
      "settingUp"
    );
    expect(overviewStatusOf({ clientStatus: "invite_sent", kpis: [] })).toBe(
      "settingUp"
    );
  });

  it("is ready once a live client has numbers, and calculating before", () => {
    expect(overviewStatusOf({ clientStatus: "live", kpis })).toBe("ready");
    expect(overviewStatusOf({ clientStatus: "live", kpis: [] })).toBe(
      "calculating"
    );
  });
});

describe("overviewFromApi", () => {
  it("puts the database's key numbers in the key numbers block", () => {
    const { data, status } = overviewFromApi({
      clientType: "exchange",
      clientStatus: "live",
      kpis,
    });

    const block = data.blocks.find(candidate => candidate._tag === "kpis");
    expect(status).toBe("ready");
    expect(block?._tag === "kpis" && block.items).toEqual(kpis);
  });

  it("keeps the rest of the client type's Overview as it was", () => {
    const { data } = overviewFromApi({
      clientType: "protocol",
      clientStatus: "live",
      kpis,
    });

    expect(data.clientKind).toBe("protocol");
    expect(data.blocks.map(block => block._tag).sort()).toEqual([
      "briefing",
      "gaps",
      "kpis",
      "signals",
    ]);
  });

  it("leaves the preview numbers in place while a live client has none yet", () => {
    const { data, status } = overviewFromApi({
      clientType: "exchange",
      clientStatus: "live",
      kpis: [],
    });

    const block = data.blocks.find(candidate => candidate._tag === "kpis");
    expect(status).toBe("calculating");
    expect(block?._tag === "kpis" && block.items.length).toBeGreaterThan(0);
  });
});
