import type {
  EvidenceId,
  SignalData,
  SignalStatusId,
  TerminalSignals,
} from "@sandworm/types/terminal";

import { getPreviewClientKind, getPreviewSignals } from "@/lib/preview/cookies";
import { gql } from "@/lib/api";
import { shortDay } from "@/lib/dates";
import { liveOr } from "@/lib/live";
import { webAppUrl } from "@/lib/web-app";
import { signalMockData } from "@/_mockdata/signals";
import type { Evidence, Signal, SignalStatus, SignalsFeed } from "@/types";

const TERMINAL_SIGNALS = `
  query TerminalSignals {
    terminalSignals {
      items {
        id status title observed couldMean kind size sizeLabel evidence
        subject publishedAt reportPath
      }
    }
  }
`;

const STATUS: Record<SignalStatusId, SignalStatus> = {
  new: "New",
  looking: "Looking into it",
  acting: "Acting on it",
  dismissed: "Not for us",
};

const EVIDENCE: Record<EvidenceId, Evidence> = {
  strong: "Strong",
  some: "Some",
  early: "Early",
};

function toSignal(data: SignalData): Signal {
  return {
    id: data.id,
    status: STATUS[data.status],
    title: data.title,
    observed: data.observed,
    couldMean: data.couldMean || undefined,
    kind: data.kind,
    size: data.size,
    sizeLabel: data.sizeLabel,
    evidence: EVIDENCE[data.evidence],
    when: shortDay(data.publishedAt),
    reportUrl: data.reportPath ? webAppUrl(data.reportPath) : undefined,
  };
}

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
