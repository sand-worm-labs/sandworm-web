"use client";

import { useEffect, useState } from "react";
import { isAddress } from "viem";

import { ModalShell } from "@/web3/components/ModalShell";
import {
  modalInputClassName,
  modalPrimaryButtonClassName,
  modalSecondaryButtonClassName,
} from "@/web3/components/modalStyles";

import { PayoutWalletPicker } from "./PayoutWalletPicker";
import { TrustFailureDialog } from "./TrustFailureDialog";
import { useNotebookTrust } from "./useNotebookTrust";

// =====================================
// ⬢ Types
// =====================================
export interface EntryNotebook {
  id: string;
  title: string;
}

interface SubmitEntryModalProps {
  workspaceId: string;
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
  workspaceId,
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
  const trust = useNotebookTrust(workspaceId, documentId, isOpen);

  return (
    <>
      <ModalShell
        isOpen={isOpen}
        onClose={isSubmitting ? () => undefined : onClose}
        title="Submit your entry"
        description={`Publishes the notebook you pick so anyone can view it, and enters it for "${title}". Only a verified notebook can be submitted: its inputs are committed onchain, so every entry can be re-run as it was submitted.`}
        footer={
          <button
            type="button"
            disabled={
              isSubmitting ||
              !documentId ||
              !trust.trusted ||
              (needsWallet && !valid)
            }
            onClick={() =>
              onSubmit(documentId, needsWallet ? wallet : undefined)
            }
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

        <div className="mt-3 rounded-2xl bg-base-600 p-4 text-xs text-ink-400">
          {trust.isChecking ? (
            <p>Checking the notebook...</p>
          ) : trust.trusted ? (
            <p className="text-green-700 dark:text-green-400">
              Verified. Its inputs are committed onchain and nothing has changed
              since.
            </p>
          ) : (
            <>
              <p>
                Not verified yet{trust.reason ? `: ${trust.reason}` : "."} Run
                the notebook first, then verify it. This re-runs it and takes up
                to a minute. Its code is pinned publicly for good.
              </p>
              <button
                type="button"
                disabled={trust.isAttesting || !documentId}
                onClick={trust.attest}
                className={`${modalSecondaryButtonClassName} mt-3`}
              >
                {trust.isAttesting ? "Verifying..." : "Verify notebook"}
              </button>
            </>
          )}
        </div>

        {needsWallet && (
          <PayoutWalletPicker value={wallet} onChange={setWallet} />
        )}
      </ModalShell>
      <TrustFailureDialog
        reason={trust.failure}
        onClose={trust.dismissFailure}
      />
    </>
  );
};
