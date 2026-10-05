"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { PiWarningCircle, PiWallet } from "react-icons/pi";

const buttonClassName =
  "py-2 px-5 rounded-xl text-sm border flex items-center shrink-0 gap-2 font-body font-medium transition-colors border-border dark:border-white/15 text-ink-100 dark:text-white bg-base-100 hover:bg-hover-bg dark:hover:bg-base-600";

// =====================================
// ⬢ Connect Wallet Button
// =====================================
export const ConnectWalletButton = ({
  className = "",
}: {
  className?: string;
}) => (
  <ConnectButton.Custom>
    {({
      account,
      chain,
      mounted,
      openAccountModal,
      openChainModal,
      openConnectModal,
    }) => {
      if (!mounted)
        return (
          <div className={`h-[38px] w-36 ${className}`} aria-hidden="true" />
        );

      if (!account || !chain) {
        return (
          <button
            type="button"
            onClick={openConnectModal}
            className={`${buttonClassName} ${className}`}
          >
            <PiWallet className="h-4 w-4" />
            Connect wallet
          </button>
        );
      }

      if (chain.unsupported) {
        return (
          <button
            type="button"
            onClick={openChainModal}
            className={`${buttonClassName} ${className} text-red-600 dark:text-red-400`}
          >
            <PiWarningCircle className="h-4 w-4" />
            Wrong network
          </button>
        );
      }

      return (
        <div className={`flex items-center gap-2 ${className}`}>
          <button
            type="button"
            onClick={openChainModal}
            className={buttonClassName}
          >
            {chain.name}
          </button>
          <button
            type="button"
            onClick={openAccountModal}
            className={buttonClassName}
          >
            <PiWallet className="h-4 w-4" />
            {account.displayName}
          </button>
        </div>
      );
    }}
  </ConnectButton.Custom>
);
