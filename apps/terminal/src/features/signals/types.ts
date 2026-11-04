// A signal: something Sandworm saw in the client's onchain data and what it
// could mean for them. It states what was observed and leaves the call to the
// client, who triages it with the statuses below.
export const SIGNAL_STATUSES = [
  "New",
  "Looking into it",
  "Acting on it",
  "Not for us",
] as const;

export type SignalStatus = (typeof SIGNAL_STATUSES)[number];

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
};

export type SignalsFeed = {
  items: readonly Signal[];
};
