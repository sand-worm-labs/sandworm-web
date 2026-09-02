"use client";

import { ForkToWorkspaceModal } from "@/components/Explore/ForkToWorkspaceModal";
import { GitFork } from "@/components/Assets/GitFork";

import { useForkFlow } from "./useForkFlow";

interface ForkButtonProps {
  document: { id: string; title: string } | null;
  isAuthenticated: boolean;
}

export default function ForkButton({
  document,
  isAuthenticated,
}: ForkButtonProps) {
  const {
    triggerFork,
    isForkModalOpen,
    closeForkModal,
    handleFork,
    handleForkSuccess,
  } = useForkFlow(document, isAuthenticated);

  return (
    <>
      <button
        type="button"
        disabled={!document}
        onClick={triggerFork}
        className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-white text-sm font-medium bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none transition-colors"
      >
        <GitFork size={14} />
        Fork
      </button>

      {document && (
        <ForkToWorkspaceModal
          isOpen={isForkModalOpen}
          onClose={closeForkModal}
          document={document}
          onFork={handleFork}
          onForkSuccess={handleForkSuccess}
        />
      )}
    </>
  );
}
