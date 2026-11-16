import type { EvidenceId, SignalData } from "@sandworm/types/terminal";

import { shortDay } from "@/lib/dates";
import { webAppUrl } from "@/lib/web-app";
import type { Evidence, Signal } from "@/types";

import { SIGNAL_STATUS_LABEL } from "./statuses";

const EVIDENCE: Record<EvidenceId, Evidence> = {
  strong: "Strong",
  some: "Some",
  early: "Early",
};

export function toSignal(data: SignalData): Signal {
  return {
    id: data.id,
    status: SIGNAL_STATUS_LABEL[data.status],
    title: data.title,
    observed: data.observed,
    couldMean: data.couldMean || undefined,
    kind: data.kind,
    size: data.size,
    sizeLabel: data.sizeLabel,
    evidence: EVIDENCE[data.evidence],
    feedback: data.feedback,
    subject: data.subject,
    detail: data.detail ?? undefined,
    dismissReason: data.dismissReason ?? undefined,
    when: shortDay(data.publishedAt),
    reportUrl: data.reportPath ? webAppUrl(data.reportPath) : undefined,
  };
}
