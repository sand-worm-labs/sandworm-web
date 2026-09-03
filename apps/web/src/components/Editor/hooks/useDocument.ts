import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import type { ApiDocument } from "@/types";
import { useGetDocumentQuery } from "@/generated/graphql";

import { useDocuments } from "./useDocuments";

type API = {
  publish: () => Promise<void>;
  unpublish: () => Promise<void>;
  toggleRunUnexecutedBlocks: () => Promise<void>;
  toggleRunSQLSelection: () => Promise<void>;
  toggleShareLinksWithoutSidebar: () => Promise<void>;
};

type UseDocument = [
  {
    document: ApiDocument | null;
    loading: boolean;
    publishing: boolean;
  },
  API,
];

function useDocument(workspaceId: string, documentId: string): UseDocument {
  const [{ documents, loading }, api] = useDocuments(workspaceId);
  const documentFromList = useMemo(
    () => documents.find(doc => doc.id === documentId) ?? null,
    [documents, documentId]
  );

  // Fast path: fetch this one document directly instead of waiting on the
  // full workspace document-list socket broadcast that useDocuments is
  // gated on. Skipped once the list has caught up, since it's the source
  // of truth for live edits/settings.
  const { data: singleDocData } = useGetDocumentQuery({
    variables: { workspaceId, documentId },
    skip: !workspaceId || !documentId || !!documentFromList,
  });

  const document = useMemo<ApiDocument | null>(() => {
    if (documentFromList) {
      return documentFromList;
    }

    const raw = singleDocData?.getDocument;
    if (!raw) {
      return null;
    }

    return {
      ...raw,
      forkCount: 0,
      favoriteCount: 0,
      isFavorite: false,
      author: {
        username: raw.author?.username ?? "",
        image: raw.author?.avater ?? "",
        userId: "",
      },
    } as ApiDocument;
  }, [documentFromList, singleDocData]);

  const currRunUnexecutedBlocks = document?.runUnexecutedBlocks ?? false;

  const [publishing, setPublishing] = useState(false);
  const publish = useCallback(async () => {
    setPublishing(true);

    try {
      await api.publish(documentId);
    } finally {
      setPublishing(false);
    }
  }, [workspaceId, documentId, api.publish]);

  const unpublish = useCallback(async () => {
    setPublishing(true);
    try {
      await api.unpublish(documentId);
    } finally {
      setPublishing(false);
    }
  }, [workspaceId, documentId, api.unpublish]);

  const toggleRunUnexecutedBlocks = useCallback(async () => {
    const newRunUnexecutedBlocks = !currRunUnexecutedBlocks;
    try {
      await api.updateDocumentSettings(documentId, {
        runUnexecutedBlocks: newRunUnexecutedBlocks,
      });
    } catch (err) {
      toast.error("Failed to update document settings");
    }
  }, [
    workspaceId,
    documentId,
    currRunUnexecutedBlocks,
    api.updateDocumentSettings,
  ]);

  const toggleRunSQLSelection = useCallback(async () => {
    const newRunSQLSelection = !document?.runSQLSelection;
    try {
      await api.updateDocumentSettings(documentId, {
        runSQLSelection: newRunSQLSelection,
      });
    } catch (err) {
      toast.error("Failed to update document settings");
    }
  }, [
    workspaceId,
    documentId,
    document?.runSQLSelection,
    api.updateDocumentSettings,
  ]);

  const toggleShareLinksWithoutSidebar = useCallback(async () => {
    const newShareLinksWithoutSidebar = !document?.shareLinksWithoutSidebar;
    try {
      await api.updateDocumentSettings(documentId, {
        shareLinksWithoutSidebar: newShareLinksWithoutSidebar,
      });
    } catch (err) {
      toast.error("Failed to update document settings");
    }
  }, [
    workspaceId,
    documentId,
    document?.shareLinksWithoutSidebar,
    api.updateDocumentSettings,
  ]);

  return useMemo(
    () => [
      { document, loading, publishing },
      {
        publish,
        unpublish,
        toggleRunUnexecutedBlocks,
        toggleRunSQLSelection,
        toggleShareLinksWithoutSidebar,
      },
    ],
    [
      document,
      loading,
      publishing,
      publish,
      unpublish,
      toggleRunUnexecutedBlocks,
      toggleRunSQLSelection,
      toggleShareLinksWithoutSidebar,
    ]
  );
}

export default useDocument;
