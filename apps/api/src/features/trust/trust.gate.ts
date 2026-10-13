// What the bounty code needs from the trust layer, kept free of imports so the bounty
// feature does not pull in the chain and notebook code just to ask one question.

export const TRUST_GATE = Symbol('TRUST_GATE');

export type NotebookRef = { userId: string; workspaceId: string; documentId: string };

export interface TrustGate {
  // Resolves with the attestation that makes the notebook trusted, or throws saying why none does.
  trusted(ref: NotebookRef): Promise<{ id: string }>;
}

// Bounties accept only trusted notebooks. Off only for a local setup with no wallets.
export const bountiesRequireTrust = (): boolean => process.env.BOUNTY_REQUIRE_TRUST !== 'false';
