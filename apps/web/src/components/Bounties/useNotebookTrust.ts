"use client";

import { useCallback } from "react";
import { toast } from "sonner";

import {
  useAttestNotebookMutation,
  useGetNotebookTrustQuery,
} from "@/generated/graphql";

// =====================================
// ⬢ useNotebookTrust
// =====================================
// Whether a notebook can be submitted to a bounty, and the means to make it so.
// Attesting re-runs the notebook and writes to the chain, so it takes a while.
export const useNotebookTrust = (
  workspaceId: string,
  documentId: string,
  enabled: boolean
) => {
  const { data, loading, refetch } = useGetNotebookTrustQuery({
    variables: { workspaceId, documentId },
    skip: !enabled || !workspaceId || !documentId,
    fetchPolicy: "network-only",
  });
  const [attestMutation, { loading: isAttesting }] =
    useAttestNotebookMutation();

  const attest = useCallback(async () => {
    try {
      await attestMutation({ variables: { workspaceId, documentId } });
      await refetch();
      toast.success("Notebook verified. Its inputs are committed onchain.");
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error && err.message
          ? err.message
          : "Could not verify the notebook. Please try again."
      );
    }
  }, [attestMutation, refetch, workspaceId, documentId]);

  return {
    trusted: data?.getNotebookTrust.trusted ?? false,
    reason: data?.getNotebookTrust.reason ?? null,
    isChecking: loading,
    isAttesting,
    attest,
  };
};
