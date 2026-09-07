"use client";

import { ForkToWorkspaceModal } from "@/components/Explore/ForkToWorkspaceModal";
import { GitFork } from "@/components/Assets/GitFork";
import { cn } from "@/lib/utils";

import { useForkFlow } from "./useForkFlow";

interface ForkButtonProps {
  document: { id: string; title: string } | null;
  isAuthenticated: boolean;
  variant?: "default" | "hero";
}

export default function ForkButton({
  document,
  isAuthenticated,
  variant = "default",
}: ForkButtonProps) {
  const {
    triggerFork,
    isForkModalOpen,
    closeForkModal,
    handleFork,
    handleForkSuccess,
  } = useForkFlow(document, isAuthenticated);

  const isHero = variant === "hero";

  return (
    <>
      <button
        type="button"
        disabled={!document}
        onClick={triggerFork}
        className={cn(
          "flex items-center gap-1.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none transition-colors",
          isHero ? "px-4 py-2 rounded-full" : "px-4 py-1.5 rounded-md"
        )}
      >
        <GitFork size={14} />
        {isHero ? "Fork notebook" : "Fork"}
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
