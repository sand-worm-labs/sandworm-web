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
export interface EntryNotebook {
  id: string;
  title: string;
}

interface SubmitEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  isSubmitting: boolean;
  // The notebooks that can be submitted: any of the person's own.
  notebooks: EntryNotebook[];
  // The one the bounty was started with, picked first. It does not have to be the one submitted.
  defaultNotebookId?: string;
  // A bounty funded in escrow pays a wallet, so it asks for one.
  needsWallet: boolean;
  onSubmit: (documentId: string, wallet?: string) => void;
}

// =====================================
// ⬢ Submit Entry Modal
// =====================================
// Picks the notebook to submit (it can differ from the one the bounty was started with) and,
// for a bounty funded in escrow, the wallet to be paid.
export const SubmitEntryModal = ({
  isOpen,
  onClose,
  title,
  isSubmitting,
  notebooks,
  defaultNotebookId,
  needsWallet,
  onSubmit,
}: SubmitEntryModalProps) => {
  const { address: connected } = useAccount();
  const [wallet, setWallet] = useState("");
  const [documentId, setDocumentId] = useState("");

  // Start from the notebook the bounty was started with, if it is still there.
  useEffect(() => {
    if (!isOpen) return;
    const known = notebooks.some(notebook => notebook.id === defaultNotebookId);
    setDocumentId(
      known ? (defaultNotebookId as string) : (notebooks[0]?.id ?? "")
    );
    // Only when it opens: the list can refresh while the person is choosing.
  }, [isOpen]);

  // Offer the connected wallet, without overwriting what was typed.
  useEffect(() => {
    if (isOpen && needsWallet && connected) {
      setWallet(current => current || connected);
    }
  }, [isOpen, needsWallet, connected]);

  const valid = isAddress(wallet);

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={isSubmitting ? () => undefined : onClose}
      title="Submit your entry"
      description={`Publishes the notebook you pick so anyone can view it, and enters it for "${title}". It can be a different notebook from the one you started with.`}
      footer={
        <button
          type="button"
          disabled={isSubmitting || !documentId || (needsWallet && !valid)}
          onClick={() => onSubmit(documentId, needsWallet ? wallet : undefined)}
          className={modalPrimaryButtonClassName}
        >
          {isSubmitting ? "Submitting..." : "Publish and submit"}
        </button>
      }
    >
      <label
        htmlFor="bounty-entry-notebook"
        className="block text-xs font-medium text-ink-100 dark:text-white"
      >
        Notebook to submit
      </label>
      <select
        id="bounty-entry-notebook"
        value={documentId}
        onChange={e => setDocumentId(e.target.value)}
        disabled={notebooks.length === 0}
        className={`${modalInputClassName} mt-1.5`}
      >
        {notebooks.length === 0 && <option value="">No notebooks yet</option>}
        {notebooks.map(notebook => (
          <option key={notebook.id} value={notebook.id}>
            {notebook.title || "Untitled"}
          </option>
        ))}
      </select>

      {needsWallet && (
        <>
          <label
            htmlFor="bounty-entry-wallet"
            className="mt-4 block text-xs font-medium text-ink-100 dark:text-white"
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
            If your entry wins, the reward is sent to this address from the
            escrow contract. Only you and the sponsor can see it.
          </p>
          {wallet && !valid && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400">
              This is not a valid wallet address.
            </p>
          )}
        </>
      )}
    </ModalShell>
  );
};
