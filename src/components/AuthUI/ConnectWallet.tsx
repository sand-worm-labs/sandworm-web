"use client";

import { ConnectModal } from "@mysten/dapp-kit";

export default function ConnectWallet() {
  return (
    <ConnectModal
      trigger={
        <button
          type="button"
          className="mt-4 flex w-full items-center justify-center space-x-2 rounded-md border border-gray-600 bg-gray-700 px-4 py-2 text-white hover:bg-gray-600  "
        >
          <span>Connect Wallet</span>
        </button>
      }
    />
  );
}
