"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ForkToWorkspaceModal } from "@/components/Explore/ForkToWorkspaceModal";
import { GitFork } from "@/components/Assets/GitFork";
import { useModalStore } from "@/store/auth";

import { useForkDocument } from "../hooks/usePublicDocuments";

interface ForkButtonProps {
  document: { id: string; title: string } | null;
  isAuthenticated: boolean;
}

export default function ForkButton({
  document,
  isAuthenticated,
}: ForkButtonProps) {
  const openSignIn = useModalStore(state => state.openSignIn);
  const { forkDocument } = useForkDocument();
  const router = useRouter();
  const [isForkModalOpen, setIsForkModalOpen] = useState(false);

  const handleClick = useCallback(() => {
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

  return (
    <>
      <button
        type="button"
        disabled={!document}
        onClick={handleClick}
        className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-white text-sm font-medium bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none transition-colors"
      >
        <GitFork size={14} />
        Fork
      </button>

      {document && (
        <ForkToWorkspaceModal
          isOpen={isForkModalOpen}
          onClose={() => setIsForkModalOpen(false)}
          document={document}
          onFork={handleFork}
          onForkSuccess={handleForkSuccess}
        />
      )}
    </>
  );
}
