import { ClientStatusId } from "@sandworm/types/terminal";
import { describe, expect, it } from "vitest";

import type { Kpi } from "@/types";

import { OverviewStatus, isOverviewStatus, overviewStatusOf } from "./status";

const kpis: readonly Kpi[] = [
  {
    id: "swap-volume",
    label: "Swap volume",
    value: "$1.82B",
    delta: { text: "▼ 9%", tone: "negative" },
    comparison: "vs last month",
  },
];

describe("isOverviewStatus", () => {
  it.each(Object.values(OverviewStatus))("accepts %s", status => {
    expect(isOverviewStatus(status)).toBe(true);
  });

  it("rejects anything else", () => {
    expect(isOverviewStatus("loading")).toBe(false);
  });
});

describe("overviewStatusOf", () => {
  it("is setting up until the client is live", () => {
    expect(overviewStatusOf(ClientStatusId.SETTING_UP, kpis)).toBe(
      OverviewStatus.SETTING_UP
    );
    expect(overviewStatusOf(ClientStatusId.INVITE_SENT, [])).toBe(
      OverviewStatus.SETTING_UP
    );
  });

  it("is ready once a live client has numbers, and calculating before", () => {
    expect(overviewStatusOf(ClientStatusId.LIVE, kpis)).toBe(
      OverviewStatus.READY
    );
    expect(overviewStatusOf(ClientStatusId.LIVE, [])).toBe(
      OverviewStatus.CALCULATING
    );
  });
});
