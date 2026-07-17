"use client";

import React, { useCallback, useMemo } from "react";
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
        bg-white dark:bg-base-720 text-ink-300 dark:text-ink-500"
      >
        <PiTrash size={20} />
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="text-[15px] font-medium text-ink-500 dark:text-ink-200">
          Trash is empty
        </p>
        <p className="text-sm text-ink-300 dark:text-ink-500 text-center max-w-[240px]">
          Deleted notebooks sit here for 30 days before they're gone for good.
        </p>
      </div>
    </div>
  );
}

// =====================================
// ⬢ TrashPage
// =====================================

export default function TrashPage() {
  const workspaceId = useStringQuery("workspace");

  const [state, { restoreDocument, deleteDocument }] =
    useDocuments(workspaceId);

  const documents = useMemo(
    () =>
      state.documents.filter(
        (doc): doc is ApiDeletedDocument => doc.deletedAt !== null
      ),
    [state.documents]
  );

  const onPermanentDelete = useCallback(
    (id: string) => deleteDocument(id, true),
    [deleteDocument]
  );

  const onRestore = useCallback(
    (id: string) => restoreDocument(id),
    [restoreDocument]
  );

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
    <ScrollBar className="w-full bg-white dark:bg-base-100 h-full overflow-auto font-body">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* ── Header ── */}
        <div
          className="flex items-center gap-2 mb-6
          pb-4 border-b border-base-300 dark:border-base-700"
        >
          <PiTrash size={16} className="text-ink-400 dark:text-ink-500" />
          <h3 className="text-sm font-medium text-ink-100 dark:text-white">
            Trash
          </h3>
        </div>

        {/* ── Content ── */}
        {documents.size === 0 ? (
          <EmptyTrash />
        ) : (
          <TrashList
            workspaceId={workspaceId}
            documents={documents}
            onPermanentDelete={onPermanentDelete}
            onRestore={onRestore}
          />
        )}
      </div>
    </ScrollBar>
  );
}
