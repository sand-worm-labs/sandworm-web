import {
  getPreviewClientKind,
  getPreviewOpportunities,
} from "@/features/preview/cookies";

import { opportunityFixtures } from "./fixtures";
import type { OpportunitiesFeed } from "./types";

export async function getOpportunities(): Promise<OpportunitiesFeed> {
  const [clientKind, mode] = await Promise.all([
    getPreviewClientKind(),
    getPreviewOpportunities(),
  ]);
  const feed = opportunityFixtures[clientKind];

  return mode === "empty" ? { ...feed, items: [] } : feed;
}
