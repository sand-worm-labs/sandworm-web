import type { SetupDraft } from "./types";

export const setupDraftFixture: SetupDraft = {
  organisation: {
    type: "exchange",
    name: "Robinhood",
    website: "robinhood.com",
  },
  tracking: {
    addresses:
      "0x3f5c…a91e  Robinhood Wallet swap router\n0x9b1d…07c2  Robinhood Chain bridge",
    autoDiscover: true,
    competitors: ["Coinbase Wallet", "MetaMask", "Phantom", "Uniswap Wallet"],
    regions: ["United States", "Latin America", "Europe"],
    shareInternalData: false,
  },
  goals: { selected: ["markets", "retain", "rivals"] },
  team: {
    invites: [
      { id: "invite-1", email: "diego@robinhood.com", access: "view" },
      { id: "invite-2", email: "", access: "request" },
    ],
  },
};
