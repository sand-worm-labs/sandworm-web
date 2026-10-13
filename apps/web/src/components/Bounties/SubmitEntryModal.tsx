"use client";

import { useEffect, useState } from "react";
import { isAddress } from "viem";

import { ModalShell } from "@/web3/components/ModalShell";
import {
  modalInputClassName,
  modalPrimaryButtonClassName,
} from "@/web3/components/modalStyles";

import { PayoutWalletPicker } from "./PayoutWalletPicker";

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
  notebooks: EntryNotebook[];
  defaultNotebookId?: string;
  needsWallet: boolean;
  onSubmit: (documentId: string, wallet?: string) => void;
}

// =====================================
// ⬢ Submit Entry Modal
// =====================================
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
  const [wallet, setWallet] = useState("");
  const [documentId, setDocumentId] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const known = notebooks.some(notebook => notebook.id === defaultNotebookId);
    setDocumentId(
      known ? (defaultNotebookId as string) : (notebooks[0]?.id ?? "")
    );
    // Only on open: the list can refresh while the person is choosing.
  }, [isOpen]);

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
        <PayoutWalletPicker value={wallet} onChange={setWallet} />
      )}
    </ModalShell>
  );
};
