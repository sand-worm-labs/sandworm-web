"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  useAttestNotebookMutation,
  useGetNotebookTrustQuery,
} from "@/generated/graphql";

const POLL_MS = 3000;

// =====================================
// ⬢ useNotebookTrust
// =====================================
// Whether a notebook can be submitted to a bounty, and the means to make it so.
// Attesting re-runs the notebook and writes to the chain, so it takes a while: it
// starts at once, and the status is polled until it is done.
export const useNotebookTrust = (
  workspaceId: string,
  documentId: string,
  enabled: boolean
) => {
  const { data, loading, startPolling, stopPolling } = useGetNotebookTrustQuery(
    {
      variables: { workspaceId, documentId },
      skip: !enabled || !workspaceId || !documentId,
      fetchPolicy: "network-only",
    }
  );
  const [attestMutation, { loading: isStarting }] = useAttestNotebookMutation();

  // Why the last attempt could not verify the notebook, for the dialog. Null when nothing is wrong.
  const [failure, setFailure] = useState<string | null>(null);
  const dismissFailure = useCallback(() => setFailure(null), []);

  const trust = data?.getNotebookTrust;
  const pending = trust?.pending ?? false;

  // Poll while it is in flight, and say how it ended.
  const wasPending = useRef(false);
  useEffect(() => {
    if (pending) {
      startPolling(POLL_MS);
    } else {
      stopPolling();
      if (wasPending.current && trust) {
        if (trust.trusted) {
          toast.success("Notebook verified. Its inputs are committed onchain.");
        } else {
          setFailure(trust.reason ?? "The notebook could not be verified.");
        }
      }
    }
    wasPending.current = pending;
  }, [pending, trust, startPolling, stopPolling]);

  const attest = useCallback(async () => {
    setFailure(null);
    try {
      const { data: started } = await attestMutation({
        variables: { workspaceId, documentId },
      });
      // Nothing to wait for when it could not start: the reason is in the answer.
      if (started && !started.attestNotebook.pending) {
        setFailure(
          started.attestNotebook.reason ?? "Could not verify the notebook."
        );
        return;
      }
      startPolling(POLL_MS);
    } catch (err) {
      setFailure(
        err instanceof Error && err.message
          ? err.message
          : "Could not verify the notebook. Please try again."
      );
    }
  }, [attestMutation, startPolling, workspaceId, documentId]);

  return {
    trusted: trust?.trusted ?? false,
    reason: trust?.reason ?? null,
    isChecking: loading,
    isAttesting: isStarting || pending,
    attest,
    failure,
    dismissFailure,
  };
};
