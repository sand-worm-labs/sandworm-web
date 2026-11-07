import {
  getPreviewClientKind,
  getPreviewSignals,
} from "@/features/preview/cookies";
import { signalMockData } from "@/_mockdata/signals";

import type { SignalsFeed } from "./types";

export async function getSignals(): Promise<SignalsFeed> {
  const [clientKind, mode] = await Promise.all([
    getPreviewClientKind(),
    getPreviewSignals(),
  ]);
  const feed = signalMockData[clientKind];

  return mode === "empty" ? { ...feed, items: [] } : feed;
}
