import {
  getPreviewBriefing,
  getPreviewClientKind,
} from "@/features/preview/cookies";

import { briefingFixtures } from "./fixtures";
import type { BriefingFeed } from "./types";

export async function getBriefing(): Promise<BriefingFeed> {
  const [clientKind, mode] = await Promise.all([
    getPreviewClientKind(),
    getPreviewBriefing(),
  ]);
  const feed = briefingFixtures[clientKind];

  return mode === "empty" ? { ...feed, items: [] } : feed;
}
