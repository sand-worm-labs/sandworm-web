"use client";

import { useCallback, useEffect, useState } from "react";
import { PiX } from "react-icons/pi";

import { ForkToWorkspaceModal } from "@/components/Explore/ForkToWorkspaceModal";

import type { NotebookView } from "../ViewSwitcher";

import { useForkFlow } from "./useForkFlow";

interface ReadOnlyBannerProps {
  document: { id: string; title: string } | null;
  isAuthenticated: boolean;
  onChangeView: (view: NotebookView) => void;
}

export const READ_ONLY_BANNER_DISMISSED_KEY =
  "sandworm:read-only-banner:dismissed";

function useDismissed() {

  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      setDismissed(
        window.localStorage.getItem(READ_ONLY_BANNER_DISMISSED_KEY) === "true"
      );
    } catch {
      setDismissed(false);
    }
  }, []);

  const dismiss = useCallback(() => {
    setDismissed(true);
    try {
      window.localStorage.setItem(READ_ONLY_BANNER_DISMISSED_KEY, "true");
    } catch {
      // The strip is already hidden for this visit.
    }
  }, []);

  return [dismissed, dismiss] as const;
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
  const [dismissed, dismiss] = useDismissed();

  if (dismissed !== false) {
    return null;
  }

  return (
    <div className="relative w-full border-b border-border-secondary dark:border-border-tertiary bg-base-200/60 dark:bg-page-surface">
      <p className="text-center text-[13px] leading-6 text-ink-400 py-1.5 px-11">
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

      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss read-only notice"
        title="Dismiss"
        className="absolute right-2 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-md text-ink-300 hover:text-ink-100 dark:hover:text-white hover:bg-hover-bg dark:hover:bg-base-600 transition-colors"
      >
        <PiX size={14} />
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
    </div>
  );
}
