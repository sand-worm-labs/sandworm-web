import {
  getPreviewBriefing,
  getPreviewClientKind,
} from "@/lib/preview/cookies";
import { briefingMockData } from "@/_mockdata/briefing/index";

import type { BriefingFeed } from "./types";

export async function getBriefing(): Promise<BriefingFeed> {
  const [clientKind, mode] = await Promise.all([
    getPreviewClientKind(),
    getPreviewBriefing(),
  ]);
  const feed = briefingMockData[clientKind];

  return mode === "empty" ? { ...feed, items: [] } : feed;
}
