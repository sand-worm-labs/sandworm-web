import { findBlock, type OverviewData } from "@/features/overview/types";

import type { OpportunitiesFeed } from "../types";

import { opportunity } from "./builders";

export function opportunitiesFromOverview(
  data: OverviewData
): OpportunitiesFeed {
  const items = findBlock(data.blocks, "opportunities")?.items ?? [];

  return {
    items: items.map(entry => opportunity({ ...entry, when: "—" })),
  };
}
