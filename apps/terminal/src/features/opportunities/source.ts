import {
  getPreviewClientKind,
  getPreviewOpportunities,
} from "@/features/preview/cookies";
import { opportunityMockData } from "@/_mockdata/opportunities";

import type { OpportunitiesFeed } from "./types";

export async function getOpportunities(): Promise<OpportunitiesFeed> {
  const [clientKind, mode] = await Promise.all([
    getPreviewClientKind(),
    getPreviewOpportunities(),
  ]);
  const feed = opportunityMockData[clientKind];

  return mode === "empty" ? { ...feed, items: [] } : feed;
}
