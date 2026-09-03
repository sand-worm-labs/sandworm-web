"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useModalStore } from "@/store/auth";

import { useForkDocument } from "../hooks/usePublicDocuments";

export function useForkFlow(
  document: { id: string; title: string } | null,
  isAuthenticated: boolean
) {
  const openSignIn = useModalStore(state => state.openSignIn);
  const { forkDocument } = useForkDocument();
  const router = useRouter();
  const [isForkModalOpen, setIsForkModalOpen] = useState(false);

  const triggerFork = useCallback(() => {
    if (!document) return;
    if (!isAuthenticated) {
      openSignIn();
      return;
    }
    setIsForkModalOpen(true);
  }, [document, isAuthenticated, openSignIn]);

  const handleFork = useCallback(
    async ({
      documentId,
      workspaceId,
    }: {
      documentId: string;
      workspaceId: string;
    }) => {
      const forked = await forkDocument(documentId, workspaceId);
      if (!forked?.id) throw new Error("Fork returned no document.");
    },
    [forkDocument]
  );

  const handleForkSuccess = useCallback(
    (workspaceId: string) => {
      toast.success("Notebook forked!");
      router.push(`/workspace/${workspaceId}`);
    },
    [router]
  );

  return {
    triggerFork,
    isForkModalOpen,
    closeForkModal: () => setIsForkModalOpen(false),
    handleFork,
    handleForkSuccess,
  };
}
