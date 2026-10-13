"use client";

import { PiWarningCircle } from "react-icons/pi";

import { ModalShell } from "@/web3/components/ModalShell";
import { modalPrimaryButtonClassName } from "@/web3/components/modalStyles";

import { explainTrustFailure } from "./trustFailure";

interface TrustFailureDialogProps {
  // The reason the server gave. Null keeps the dialog closed.
  reason: string | null;
  onClose: () => void;
}

// =====================================
// ⬢ Trust Failure Dialog
// =====================================
// Shown when a notebook cannot be verified: why, and what to do next.
export const TrustFailureDialog = ({
  reason,
  onClose,
}: TrustFailureDialogProps) => {
  const failure = explainTrustFailure(reason);

  return (
    <ModalShell
      isOpen={reason !== null}
      onClose={onClose}
      title="Can't verify this notebook"
      footer={
        <button
          type="button"
          onClick={onClose}
          className={modalPrimaryButtonClassName}
        >
          Got it
        </button>
      }
    >
      <div className="flex gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
        <PiWarningCircle size={20} className="mt-0.5 shrink-0" />
        <p className="break-words">{failure.message}</p>
      </div>

      <p className="mt-5 text-xs font-medium text-ink-100 dark:text-white">
        What to do
      </p>
      <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-xs leading-relaxed text-ink-400">
        {failure.steps.map(step => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </ModalShell>
  );
};
