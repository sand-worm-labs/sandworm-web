import type { Output } from "@sandworm/types";
import type {
  SignalDetail,
  SignalDismissReasonId,
} from "@sandworm/types/terminal";

import type { SignalStatus } from "@/lib/signals/statuses";

export type { SignalStatus };

// A signal: something Sandworm saw in the client's onchain data and what it
// could mean for them. It states what was observed and leaves the call to the
// client, who triages it with the statuses in SIGNAL_STATUSES.

// How strong the evidence behind it is
export type Evidence = "Strong" | "Some" | "Early";

export type Signal = {
  id: string;
  status: SignalStatus;
  // What was seen, as a fact
  title: string;
  // The evidence in one line
  observed: string;
  // A hedged reading of what it could mean
  couldMean?: string;
  kind: string;
  // The size of what was seen, and what it measures
  size: string;
  sizeLabel: string;
  evidence: Evidence;
  when: string;
  // The report it came from, in the web app; fixtures have none
  reportUrl?: string;
  // What it is about ("Argentina", "Paycrest")
  subject?: string;
  // The facts, entities and next steps behind it, when the API sends them
  detail?: SignalDetail;
  // Why the client set it aside
  dismissReason?: SignalDismissReasonId;
  // The client's open feedback: how it applies to them, in their words
  feedback?: string;
  // A snapshot of the source cell's outputs, when the API sends one
  outputs?: readonly Output[];
};

export type SignalsFeed = {
  items: readonly Signal[];
};
