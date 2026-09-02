"use client";

import { ForkToWorkspaceModal } from "@/components/Explore/ForkToWorkspaceModal";

import type { NotebookView } from "../ViewSwitcher";

import { useForkFlow } from "./useForkFlow";

interface ReadOnlyBannerProps {
  document: { id: string; title: string } | null;
  isAuthenticated: boolean;
  onChangeView: (view: NotebookView) => void;
}

const LINK_CLASS =
  "font-medium text-primary underline underline-offset-2 decoration-primary/40 hover:decoration-primary transition-colors disabled:opacity-50 disabled:pointer-events-none";

export default function ReadOnlyBanner({
  document,
  isAuthenticated,
  onChangeView,
}: ReadOnlyBannerProps) {
  const {
    triggerFork,
    isForkModalOpen,
    closeForkModal,
    handleFork,
    handleForkSuccess,
  } = useForkFlow(document, isAuthenticated);

  return (
    <div className="w-full border-b border-border-secondary dark:border-border-tertiary bg-base-200/60 dark:bg-base-600/40">
      <p className="text-center text-[13px] leading-6 text-ink-400 py-1.5 px-4">
        <span className="font-medium text-ink-100 dark:text-white">
          Read-only preview.
        </span>{" "}
        <button
          type="button"
          onClick={() => onChangeView("query")}
          className={LINK_CLASS}
        >
          View the query
        </button>
        , or{" "}
        <button
          type="button"
          disabled={!document}
          onClick={triggerFork}
          className={LINK_CLASS}
        >
          fork
        </button>{" "}
        to edit in your workspace.
      </p>

      {document && (
        <ForkToWorkspaceModal
          isOpen={isForkModalOpen}
          onClose={closeForkModal}
          document={document}
          onFork={handleFork}
          onForkSuccess={handleForkSuccess}
        />
      )}
    </div>
  );
}
