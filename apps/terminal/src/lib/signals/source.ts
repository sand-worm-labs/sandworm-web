import type { TerminalSignals } from "@sandworm/types/terminal";

import { getPreviewClientKind, getPreviewSignals } from "@/lib/preview/cookies";
import { gql } from "@/lib/api";
import { liveOr } from "@/lib/live";
import { signalMockData } from "@/_mockdata/signals";
import type { SignalsFeed } from "@/types";

import { toSignal } from "./to-signal";

const TERMINAL_SIGNALS = `
  query TerminalSignals {
    terminalSignals {
      items {
        id status title observed couldMean kind size sizeLabel evidence feedback
        subject publishedAt reportPath
      }
    }
  }
`;

export async function getSignals(): Promise<SignalsFeed> {
  return liveOr(
    async () => {
      const data = await gql<{ terminalSignals: TerminalSignals }>(
        TERMINAL_SIGNALS
      );
      return { items: data.terminalSignals.items.map(toSignal) };
    },
    async () => {
      const [clientKind, mode] = await Promise.all([
        getPreviewClientKind(),
        getPreviewSignals(),
      ]);
      const feed = signalMockData[clientKind];
      return mode === "empty" ? { ...feed, items: [] } : feed;
    }
  );
}
