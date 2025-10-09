"use client";

import { ConnectModal } from "@mysten/dapp-kit";

export const ConnectWallet = () => {
  return (
    <ConnectModal
      trigger={
        <button
          type="button"
          disabled
          className="mt-4 flex  items-center justify-center space-x-2 rounded-md border border-white/20 bg-white/10 px-4 py-1.5 text-white hover:bg-white/15 text-sm  "
        >
          <span>Connect Wallet</span>
        </button>
      }
    />
  );
};
