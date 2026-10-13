"use client";

import { useEffect, useState } from "react";
import { isAddress } from "viem";
import { useAccount } from "wagmi";

import {
  ModalShell,
  modalInputClassName,
  modalPrimaryButtonClassName,
} from "@/web3/components/ModalShell";

// =====================================
// ⬢ Types
// =====================================
interface SubmitEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  isSubmitting: boolean;
  onSubmit: (wallet: string) => void;
}

// =====================================
// ⬢ Submit Entry Modal
// =====================================
// A bounty funded in escrow pays a wallet, so submitting to one asks which.
export const SubmitEntryModal = ({
  isOpen,
  onClose,
  title,
  isSubmitting,
  onSubmit,
}: SubmitEntryModalProps) => {
  const { address: connected } = useAccount();
  const [wallet, setWallet] = useState("");

  // Offer the connected wallet, without overwriting what was typed.
  useEffect(() => {
    if (isOpen && connected) setWallet(current => current || connected);
  }, [isOpen, connected]);

  const valid = isAddress(wallet);

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={isSubmitting ? () => undefined : onClose}
      title="Submit your entry"
      description={`Publishes your notebook for "${title}" so anyone can view it, and enters it for the reward.`}
      footer={
        <button
          type="button"
          disabled={isSubmitting || !valid}
          onClick={() => onSubmit(wallet)}
          className={modalPrimaryButtonClassName}
        >
          {isSubmitting ? "Submitting..." : "Publish and submit"}
        </button>
      }
    >
      <label
        htmlFor="bounty-entry-wallet"
        className="block text-xs font-medium text-ink-100 dark:text-white"
      >
        Wallet to be paid
      </label>
      <input
        id="bounty-entry-wallet"
        value={wallet}
        onChange={e => setWallet(e.target.value.trim())}
        placeholder="0x... wallet address"
        className={`${modalInputClassName} mt-1.5`}
      />
      <p className="mt-2 text-xs leading-relaxed text-ink-400">
        If your entry wins, the reward is sent to this address from the escrow
        contract. Only you and the sponsor can see it.
      </p>
      {wallet && !valid && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">
          This is not a valid wallet address.
        </p>
      )}
    </ModalShell>
  );
};
