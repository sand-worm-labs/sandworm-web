import { getPreviewClientKind, getPreviewSignals } from "@/lib/preview/cookies";
import { signalMockData } from "@/_mockdata/signals/index";

import type { SignalsFeed } from "./types";

export async function getSignals(): Promise<SignalsFeed> {
  const [clientKind, mode] = await Promise.all([
    getPreviewClientKind(),
    getPreviewSignals(),
  ]);
  const feed = signalMockData[clientKind];

  return mode === "empty" ? { ...feed, items: [] } : feed;
}
