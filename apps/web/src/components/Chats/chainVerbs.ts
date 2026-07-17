// Whimsical loading labels shown next to the spinner while the AI works,
// in the spirit of Claude Code's spinner verbs but flavored for an
// on-chain analytics platform.
export const CHAIN_VERBS = [
  "Pondering",
  "Contemplating",
  "Cogitating",
  "Ruminating",
  "Percolating",
  "Noodling",
  "Deliberating",
  "Sussing it out",
  "Puzzling",
  "Indexing blocks",
  "Decoding calldata",
  "Tracing transactions",
  "Crunching gas",
  "Parsing ABIs",
  "Resolving addresses",
  "Aggregating swaps",
  "Walking the mempool",
  "Syncing blocks",
  "Hashing logs",
  "Flattening traces",
  "Querying the chain",
  "Untangling calldata",
  "Sniffing out logs",
  "Joining tables",
  "Tailing the chain",
  "Forking state",
  "Warming the cache",
  "Chasing whales",
  "Reconciling balances",
  "Simulating the trade",
  "Rehydrating events",
  "Diffing state",
  "Mining the logs",
  "Spelunking contracts",
];

export function pickNextVerb(current: string): string {
  if (CHAIN_VERBS.length <= 1) return CHAIN_VERBS[0] ?? "";
  let next = current;
  while (next === current) {
    next = CHAIN_VERBS[Math.floor(Math.random() * CHAIN_VERBS.length)] ?? current;
  }
  return next;
}
