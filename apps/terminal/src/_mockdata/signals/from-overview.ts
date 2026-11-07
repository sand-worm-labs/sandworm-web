import { findBlock, type OverviewData } from "@/lib/overview/types";
import type { SignalsFeed } from "@/lib/signals/types";

import { signal } from "./builders";

export function signalsFromOverview(data: OverviewData): SignalsFeed {
  const items = findBlock(data.blocks, "signals")?.items ?? [];

  return {
    items: items.map(entry => signal({ ...entry, when: "—" })),
  };
}
