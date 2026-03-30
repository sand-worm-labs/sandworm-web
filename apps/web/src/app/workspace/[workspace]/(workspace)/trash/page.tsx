"use client";

import { HandThumbUpIcon } from "@heroicons/react/24/outline";
import React, { useCallback, useMemo } from "react";

import type { ApiDeletedDocument } from "@/types";
import { useSession } from "@/components/Editor/hooks/useAuth";
import TrashList from "@/components/Editor/blocks/TrashList";
import ScrollBar from "@/components/Editor/blocks/ScrollBar";
import { useDocuments } from "@/components/Editor/hooks/useDocuments";
import { useStringQuery } from "@/components/Editor/hooks/useQueryArgs";

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
    (id: string) => {
      return deleteDocument(id, true);
    },
    [deleteDocument]
  );

  const onRestore = useCallback(
    (id: string) => {
      return restoreDocument(id);
    },
    [restoreDocument]
  );

  const session = useSession({ redirectToLogin: true });
  if (!session.user) {
    return null;
  }

  // Add loading state check
  if (state.loading) {
    return (
      <div className="items-center justify-center flex fixed top-0 bottom-0 w-full left-0 z-10 h-screen">
        <div className="loader">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className={`square sq${i + 1}`} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <ScrollBar className="w-full bg-white dark:bg-base-100  h-full overflow-auto font-body">
      <div className="px-4 sm:p-6 lg:p-8">
        <div className=" pb-4 sm:flex sm:items-center sm:justify-between">
          <h3 className="text-lg font-medium leading-6 text-ink-100">Trash</h3>
        </div>

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

function EmptyTrash() {
  return (
    <div className="py-6 ">
      <div className="text-center py-12 bg-gray-50 dark:bg-base-100  rounded-xl border-2 border-border-secondary dark:border-border-tertiary border-dashed">
        <HandThumbUpIcon className="h-12 w-12 text-ink-400 mx-auto" />
        <h3 className="mt-2 text-sm font-semibold text-ink-100">
          Your trash is empty
        </h3>
        <p className="mt-1 text-sm text-ink-400">
          In the vacuum of bits, your trash bin echoes the mindfulness of
          deletion.
        </p>
      </div>
    </div>
  );
}
