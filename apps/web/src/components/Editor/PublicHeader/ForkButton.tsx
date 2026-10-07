"use client";

import { ForkToWorkspaceModal } from "@/components/Explore/ForkToWorkspaceModal";
import { GitFork } from "@/components/Assets/GitFork";
import { cn } from "@/lib/utils";
import { headerIconButtonClassName } from "@/styles/interactive";

import { TooltipV2 } from "../blocks/ToolTips";

import { useForkFlow } from "./useForkFlow";

interface ForkButtonProps {
  document: { id: string; title: string } | null;
  isAuthenticated: boolean;
  variant?: "default" | "icon";
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

  const isIcon = variant === "icon";

  return (
    <>
      {isIcon ? (
        <TooltipV2<HTMLButtonElement>
          title="Fork notebook"
          active
          position="bottom"
        >
          {ref => (
            <button
              ref={ref}
              type="button"
              disabled={!document}
              onClick={triggerFork}
              aria-label="Fork notebook"
              className={cn(
                headerIconButtonClassName,
                "h-8 w-8 disabled:opacity-50 disabled:pointer-events-none"
              )}
            >
              <GitFork size={20} />
            </button>
          )}
        </TooltipV2>
      ) : (
        <button
          type="button"
          disabled={!document}
          onClick={triggerFork}
          className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none transition-colors px-4 py-1.5 rounded-md"
        >
          <GitFork size={14} />
          Fork
        </button>
      )}

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
