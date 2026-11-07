import type { OverviewData, SignalsFeed } from "@/types";
import { findBlock } from "@/lib/overview/blocks";

import { signal } from "./builders";

export function signalsFromOverview(data: OverviewData): SignalsFeed {
  const items = findBlock(data.blocks, "signals")?.items ?? [];

  return {
    items: items.map(entry => signal({ ...entry, when: "—" })),
  };
}
