"use client";

import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { PiTrash } from "react-icons/pi";

import type { ApiDeletedDocument } from "@/types";
import { useSession } from "@/components/Editor/hooks/useAuth";
import TrashList from "@/components/Editor/blocks/TrashList";
import ScrollBar from "@/components/Editor/blocks/ScrollBar";
import { useDocuments } from "@/components/Editor/hooks/useDocuments";
import { useStringQuery } from "@/components/Editor/hooks/useQueryArgs";
import { Loader } from "@/components/Loader";

// =====================================
// ⬢ Empty State
// =====================================

function EmptyTrash() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div
        className="flex items-center justify-center w-12 h-12
        rounded-xl border border-border dark:border-base-710
        bg-white dark:bg-base-720 text-ink-300 dark:text-placeholder-muted"
      >
        <PiTrash size={20} />
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="text-[15px] font-medium text-ink-500 dark:text-ink-200">
          Trash is empty
        </p>
        <p className="text-sm text-ink-300 dark:text-placeholder-muted text-center max-w-[240px]">
          Deleted notebooks sit here for 30 days before they're gone for good.
        </p>
      </div>
    </div>
  );
}

// =====================================
// ⬢ Confirm Dialog
// =====================================

type ConfirmDialogProps = {
  isOpen: boolean;
  isBusy: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  busyLabel: string;
  variant?: "danger" | "primary";
  onClose: () => void;
  onConfirm: () => void;
};

function ConfirmDialog({
  isOpen,
  isBusy,
  title,
  message,
  confirmLabel,
  busyLabel,
  variant = "danger",
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 flex items-center justify-center text-ink-100"
        onClose={onClose}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="absolute inset-0 bg-black/[10.2%]" />
        </TransitionChild>

        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0 scale-95 translate-y-1"
          enterTo="opacity-100 scale-100 translate-y-0"
          leave="ease-in duration-150"
          leaveFrom="opacity-100 scale-100 translate-y-0"
          leaveTo="opacity-0 scale-95 translate-y-1"
        >
          <DialogPanel
            className="relative bg-white dark:bg-base-400 dark:border
            dark:border-border-tertiary rounded-2xl shadow-xl w-full max-w-sm
            mx-4 p-6 font-body"
          >
            <DialogTitle className="text-base font-medium text-ink-100 dark:text-white">
              {title}
            </DialogTitle>
            <p className="text-sm text-ink-300 dark:text-placeholder-muted mt-2">
              {message}
            </p>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={isBusy}
                className="flex-1 py-2.5 rounded-xl border border-border
                  dark:border-border-tertiary text-ink-400 dark:text-ink-400
                  text-sm font-medium hover:bg-inputBg dark:hover:bg-dropdown-hover
                  transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isBusy}
                className={`flex-1 py-2.5 rounded-xl text-white text-sm
                  font-medium hover:bg-opacity-90 transition-colors
                  disabled:opacity-50
                  ${variant === "danger" ? "bg-error" : "bg-primary"}`}
              >
                {isBusy ? busyLabel : confirmLabel}
              </button>
            </div>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}

// =====================================
// ⬢ Selection helpers
// =====================================

// Documents whose parent is also in `ids` will be cascade-restored /
// cascade-deleted by their ancestor, so acting on them directly races
// with (and can 404 against) the ancestor's own operation.
function getActionRoots(
  ids: Set<string>,
  docsById: Map<string, ApiDeletedDocument>
): string[] {
  const hasSelectedAncestor = (doc: ApiDeletedDocument): boolean => {
    let parent = doc.parentId ? docsById.get(doc.parentId) : undefined;
    while (parent) {
      if (ids.has(parent.id)) return true;
      parent = parent.parentId ? docsById.get(parent.parentId) : undefined;
    }
    return false;
  };

  return Array.from(ids).filter(id => {
    const doc = docsById.get(id);
    return !!doc && !hasSelectedAncestor(doc);
  });
}

// =====================================
// ⬢ Pending Action
// =====================================

type PendingAction =
  | { kind: "delete"; scope: "all" }
  | { kind: "delete"; scope: "selected" }
  | { kind: "delete"; scope: "one"; id: string; title: string }
  | { kind: "restore"; scope: "one"; id: string; title: string };

// =====================================
// ⬢ TrashPage
// =====================================

export default function TrashPage() {
  const workspaceId = useStringQuery("workspace");

  const [state, { restoreDocument, deleteDocument, emptyTrash }] =
    useDocuments(workspaceId);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectAllRef = useRef<HTMLInputElement>(null);

  const [isRestoringAll, setIsRestoringAll] = useState(false);
  const [isRestoringSelected, setIsRestoringSelected] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null
  );
  const [isActionBusy, setIsActionBusy] = useState(false);

  const documents = useMemo(
    () =>
      state.documents.filter(
        (doc): doc is ApiDeletedDocument => doc.deletedAt !== null
      ),
    [state.documents]
  );

  const docsById = useMemo(
    () => new Map(documents.map(doc => [doc.id, doc] as const)),
    [documents]
  );

  // Drop selected ids that fell out of the trash (restored/deleted elsewhere).
  useEffect(() => {
    setSelectedIds(prev => {
      const next = new Set(Array.from(prev).filter(id => docsById.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [docsById]);

  const allSelected = documents.size > 0 && selectedIds.size === documents.size;
  const someSelected = selectedIds.size > 0 && !allSelected;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const onToggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const onToggleSelectAll = useCallback(() => {
    setSelectedIds(allSelected ? new Set() : new Set(documents.map(d => d.id)));
  }, [allSelected, documents]);

  const onRequestPermanentDelete = useCallback(
    (id: string) => {
      const title = docsById.get(id)?.title || "Untitled";
      setPendingAction({ kind: "delete", scope: "one", id, title });
    },
    [docsById]
  );

  const onRequestRestore = useCallback(
    (id: string) => {
      const title = docsById.get(id)?.title || "Untitled";
      setPendingAction({ kind: "restore", scope: "one", id, title });
    },
    [docsById]
  );

  const restoreRoots = useCallback(
    async (ids: Set<string>) => {
      const roots = getActionRoots(ids, docsById);
      await Promise.allSettled(roots.map(id => restoreDocument(id)));
    },
    [docsById, restoreDocument]
  );

  const onRestoreAll = useCallback(async () => {
    setIsRestoringAll(true);
    try {
      await restoreRoots(new Set(documents.map(d => d.id)));
    } finally {
      setIsRestoringAll(false);
    }
  }, [restoreRoots, documents]);

  const onRestoreSelected = useCallback(async () => {
    setIsRestoringSelected(true);
    try {
      await restoreRoots(selectedIds);
      setSelectedIds(new Set());
    } finally {
      setIsRestoringSelected(false);
    }
  }, [restoreRoots, selectedIds]);

  const onConfirmPendingAction = useCallback(async () => {
    if (!pendingAction) return;

    setIsActionBusy(true);
    try {
      if (pendingAction.kind === "restore") {
        await restoreDocument(pendingAction.id);
      } else if (pendingAction.scope === "all") {
        await emptyTrash();
      } else if (pendingAction.scope === "selected") {
        const roots = getActionRoots(selectedIds, docsById);
        await Promise.allSettled(roots.map(id => deleteDocument(id, true)));
        setSelectedIds(new Set());
      } else {
        await deleteDocument(pendingAction.id, true);
      }
      setPendingAction(null);
    } finally {
      setIsActionBusy(false);
    }
  }, [
    pendingAction,
    selectedIds,
    docsById,
    deleteDocument,
    restoreDocument,
    emptyTrash,
  ]);

  const pendingDialog = useMemo(() => {
    if (!pendingAction) return null;

    if (pendingAction.kind === "restore") {
      return {
        title: "Restore notebook?",
        message: `Restore "${pendingAction.title}" from trash?`,
        confirmLabel: "Restore",
        busyLabel: "Restoring…",
        variant: "primary" as const,
      };
    }

    switch (pendingAction.scope) {
      case "all":
        return {
          title: "Empty trash?",
          message:
            "This will permanently delete every notebook in trash. This action cannot be undone.",
          confirmLabel: "Delete all",
          busyLabel: "Deleting…",
          variant: "danger" as const,
        };
      case "selected":
        return {
          title: "Delete selected?",
          message: `This will permanently delete ${selectedIds.size} selected notebook${selectedIds.size === 1 ? "" : "s"}. This action cannot be undone.`,
          confirmLabel: "Delete selected",
          busyLabel: "Deleting…",
          variant: "danger" as const,
        };
      case "one":
        return {
          title: "Delete permanently?",
          message: `Permanently delete "${pendingAction.title}"? This action cannot be undone.`,
          confirmLabel: "Delete",
          busyLabel: "Deleting…",
          variant: "danger" as const,
        };
      default:
        return null;
    }
  }, [pendingAction, selectedIds.size]);

  const session = useSession({ redirectToLogin: true });
  if (!session.user) return null;

  if (state.loading) {
    return (
      <div className="items-center justify-center flex fixed top-0 bottom-0 w-full left-0 z-10 h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <ScrollBar className="w-full bg-white dark:bg-page-surface h-full overflow-auto font-body">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* ── Header ── */}
        <div
          className="flex items-center gap-2 mb-6
          pb-4 border-b border-base-300 dark:border-base-700"
        >
          <PiTrash size={16} className="text-ink-400 dark:text-placeholder-muted" />
          <h3 className="text-sm font-medium text-ink-100 dark:text-white">
            Trash
          </h3>
        </div>

        {/* ── Bulk toolbar ── */}
        {documents.size > 0 && (
          <div className="flex items-center justify-between gap-3 mb-4">
            <label
              className="flex items-center gap-2 text-sm text-ink-300
              dark:text-placeholder-muted cursor-pointer select-none"
            >
              <input
                ref={selectAllRef}
                type="checkbox"
                checked={allSelected}
                onChange={onToggleSelectAll}
                className="h-4 w-4 rounded border-border-faint
                  dark:border-border-tertiary text-primary
                  focus:border-primary cursor-pointer"
              />
              {selectedIds.size > 0
                ? `${selectedIds.size} selected`
                : "Select all"}
            </label>

            <div className="flex items-center gap-2">
              {selectedIds.size > 0 ? (
                <>
                  <button
                    type="button"
                    onClick={onRestoreSelected}
                    disabled={isRestoringSelected}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium border border-transparent
                      text-primary bg-primary-tint-50 dark:bg-create-project-tint/[0.16]
                      dark:border-border-tertiary dark:text-white hover:bg-primary hover:text-white
                      dark:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.12)]
                      transition-colors duration-100 disabled:opacity-50"
                  >
                    {isRestoringSelected ? "Restoring…" : "Restore selected"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setPendingAction({ kind: "delete", scope: "selected" })
                    }
                    className="px-3 py-1.5 rounded-lg text-sm font-medium border border-transparent
                      text-error bg-error-tint dark:bg-error/[0.16]
                      dark:border-error/30 hover:bg-error hover:text-white
                      dark:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.12)]
                      transition-colors duration-100"
                  >
                    Delete selected
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onRestoreAll}
                    disabled={isRestoringAll}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium border border-transparent
                      text-primary bg-primary-tint-50 dark:bg-create-project-tint/[0.16]
                      dark:border-border-tertiary dark:text-white hover:bg-primary hover:text-white
                      dark:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.12)]
                      transition-colors duration-100 disabled:opacity-50"
                  >
                    {isRestoringAll ? "Restoring…" : "Restore all"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setPendingAction({ kind: "delete", scope: "all" })
                    }
                    className="px-3 py-1.5 rounded-lg text-sm font-medium border border-transparent
                      text-error bg-error-tint dark:bg-error/[0.16]
                      dark:border-error/30 hover:bg-error hover:text-white
                      dark:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.12)]
                      transition-colors duration-100"
                  >
                    Delete all
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Content ── */}
        {documents.size === 0 ? (
          <EmptyTrash />
        ) : (
          <TrashList
            workspaceId={workspaceId}
            documents={documents}
            selectedIds={selectedIds}
            onToggleSelect={onToggleSelect}
            onPermanentDelete={onRequestPermanentDelete}
            onRestore={onRequestRestore}
          />
        )}
      </div>

      {pendingDialog && (
        <ConfirmDialog
          isOpen={pendingAction !== null}
          isBusy={isActionBusy}
          title={pendingDialog.title}
          message={pendingDialog.message}
          confirmLabel={pendingDialog.confirmLabel}
          busyLabel={pendingDialog.busyLabel}
          variant={pendingDialog.variant}
          onClose={() => setPendingAction(null)}
          onConfirm={onConfirmPendingAction}
        />
      )}
    </ScrollBar>
  );
}
