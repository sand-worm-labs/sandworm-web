import { Map, List, Set } from "immutable";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { equals } from "ramda";
import { toast } from "sonner";

import type { Document, ApiDocument } from "@/types";
import {
  useCreateDocumentMutation,
  useDeleteDocumentMutation,
  useDuplicateDocumentMutation,
  useEmptyTrashMutation,
  useRestoreDocumentMutation,
  useUpdateDocumentMutation,
  usePublishDocumentMutation,
  useUnpublishDocumentMutation,
  useSetDocumentLinkVisibilityMutation,
  type UpdateDocumentInput,
} from "@/generated/graphql";

import { useFavorites } from "./useFavorites";
import { useWebsocket } from "./useWebSocket";

// ⬢ Delete document in Memory
// =====================================
function deleteDocumentInMemory(
  documents: List<ApiDocument>,
  id: string,
  isPermanent?: boolean
) {
  let documentsToRemove = Set<string>();
  let affectedDocuments = Map<string, ApiDocument>();

  const documentsById = Map(documents.map(d => [d.id, d]));
  const childrenByParentId = List(documents).groupBy(d => d.parentId);

  const deletedAt = new Date();
  if (isPermanent) {
    const doc = documentsById.get(id);
    if (!doc) {
      return documents;
    }

    if (!doc.deletedAt) {
      // if this document is not soft deleted we need to decrement
      // orderIndex of all documents that belongs to the same parent
      // and comes after the current document
      const siblings = childrenByParentId.get(doc.parentId) ?? List();
      siblings.forEach(d => {
        if (d.orderIndex > doc.orderIndex) {
          affectedDocuments = affectedDocuments.set(d.id, {
            ...d,
            orderIndex: d.orderIndex - 1,
          });
        }
      });
    }

    documentsToRemove = documentsToRemove.add(id);
  } else {
    const doc = documentsById.get(id);
    if (!doc) {
      return documents;
    }

    // decrement orderIndex of all documents that belongs to the same parent
    // and comes after the current document
    const siblings = childrenByParentId.get(doc.parentId) ?? List();
    siblings.forEach(d => {
      if (d.orderIndex > doc.orderIndex) {
        affectedDocuments = affectedDocuments.set(d.id, {
          ...d,
          orderIndex: d.orderIndex - 1,
        });
      }
    });

    const stack = [doc];
    let current = stack.pop();
    while (current) {
      const children = childrenByParentId.get(current.id) ?? List();
      children.forEach(child => {
        stack.push(child);
      });
      affectedDocuments = affectedDocuments.set(current.id, {
        ...current,
        deletedAt,
      });

      current = stack.pop();
    }
  }

  let result: List<ApiDocument> = List();
  documents.forEach(doc => {
    if (documentsToRemove.has(doc.id)) {
      return;
    }

    const affectedDoc = affectedDocuments.get(doc.id);
    if (affectedDoc) {
      result = result.push(affectedDoc);
      return;
    }

    result = result.push(doc);
  });

  return result;
}

// =====================================
// ⬢ Types
// =====================================
type StateValue = {
  loading: boolean;
  documents: List<ApiDocument>;
};
type State = Map<string, StateValue>;

type API = {
  createDocument: (
    data: {
      id?: string;
      parentId?: string | null;
      version: number;
    },
    skipAddingToDocument?: boolean
  ) => Promise<Document>;
  duplicateDocument: (id: string) => Promise<ApiDocument>;
  deleteDocument: (id: string, isPermanent?: boolean) => Promise<void>;
  restoreDocument: (id: string) => Promise<void>;
  emptyTrash: () => Promise<void>;
  updateParent: (
    id: string,
    parentId: string | null,
    orderIndex: number
  ) => Promise<void>;
  updateDocumentSettings: (
    id: string,
    settings: {
      runUnexecutedBlocks?: boolean;
      runSQLSelection?: boolean;
      shareLinksWithoutSidebar?: boolean;
    }
  ) => Promise<void>;
  publish: (id: string) => Promise<void>;
  unpublish: (id: string) => Promise<void>;
  setLinkVisibility: (id: string) => Promise<void>;
};

type UseDocumentsState = {
  loading: boolean;
  documents: List<ApiDocument>;
};
type UseDocuments = [UseDocumentsState, API];

const Context = createContext<
  [State, React.Dispatch<React.SetStateAction<State>>]
>([Map(), () => {}]);

type Props = {
  children: React.ReactNode;
};

// =====================================
// ⬢ Documents Provider
// =====================================
export function DocumentsProvider(props: Props) {
  const socket = useWebsocket();
  const [state, setState] = useState<State>(Map());

  useEffect(() => {
    if (!socket) {
      return () => {};
    }

    const onDocuments = (rawData: unknown) => {
      const data = Array.isArray(rawData) ? rawData[0] : rawData;

      if (!data?.workspaceId || !data?.documents) {
        console.error("Invalid workspace-documents payload:", rawData);
        return;
      }

      const now = new Date();
      const prepareForComparison = (stateValue: StateValue) => ({
        ...stateValue,
        documents: stateValue.documents
          .map(d => ({
            ...d,
            createdAt: now,
            updatedAt: now,
            deletedAt: d.deletedAt ? now : null,
          }))
          .sortBy(d => d.id),
      });

      setState(s => {
        const { workspaceId } = data;
        const previous: StateValue = s.get(workspaceId) ?? {
          loading: true,
          documents: List(),
        };
        const next: StateValue = {
          loading: false,
          documents: List(data.documents),
        };

        if (
          !equals(prepareForComparison(previous), prepareForComparison(next))
        ) {
          return s.set(workspaceId, next);
        }

        return s;
      });
    };
    socket.on("workspace-documents", onDocuments);

    const onDocumentUpdate = (data: {
      workspaceId: string;
      document: ApiDocument;
    }) => {
      setState(s => {
        const { workspaceId } = data;

        const documents = s.get(workspaceId)?.documents ?? List();

        const document = documents.find(d => d.id === data.document.id);

        if (document) {
          const nextDocuments = documents.map(d =>
            d.id === data.document.id ? data.document : d
          );

          return s.set(workspaceId, {
            loading: false,
            documents: nextDocuments,
          });
        }

        return s.set(workspaceId, {
          loading: false,
          documents: documents.push(data.document),
        });
      });
    };
    socket.on("workspace-document-update", onDocumentUpdate);

    return () => {
      socket.off("workspace-documents", onDocuments);
      socket.off("workspace-document-update", onDocumentUpdate);
    };
  }, [socket]);

  const value: [State, React.Dispatch<React.SetStateAction<State>>] = useMemo(
    () => [state, setState],
    [state, setState]
  );

  return <Context.Provider value={value}>{props.children}</Context.Provider>;
}

// =====================================
// ⬢ Use Documents Hook
// =====================================
export function useDocuments(workspaceId: string): UseDocuments {
  const [state, setState] = useContext(Context);
  const [, { unfavoriteDocument }] = useFavorites(workspaceId);
  const [createDocumentMutation] = useCreateDocumentMutation();
  const [deleteDocumentMutation] = useDeleteDocumentMutation();
  const [duplicateDocumentMutation] = useDuplicateDocumentMutation();
  const [restoreDocumentMutation] = useRestoreDocumentMutation();
  const [emptyTrashMutation] = useEmptyTrashMutation();
  const [updateDocumentMutation] = useUpdateDocumentMutation();
  const [publishDocumentMutation] = usePublishDocumentMutation();
  const [unpublishDocumentMutation] = useUnpublishDocumentMutation();
  const [setLinkVisibilityMutation] = useSetDocumentLinkVisibilityMutation();

  const { documents, loading } = useMemo(
    (): StateValue =>
      state.get(workspaceId) ?? { loading: true, documents: List() },
    [state, workspaceId]
  );

  // ⬢ Create Document
  // =====================================
  const createDocument = useCallback(
    async (data: { parentId?: string | null; version: number }) => {
      if (loading) {
        throw new Error("Cannot create document while loading");
      }

      try {
        const result = await createDocumentMutation({
          variables: {
            workspaceId,
            input: {
              title: "Untitled",
              parentId: data.parentId ?? null,
              version: data.version,
            },
          },
        });

        if (!result.data?.createDocument) {
          throw new Error("Failed to create document");
        }

        const newDoc = result.data.createDocument as ApiDocument;

        return newDoc as Document;
      } catch (e) {
        toast.error("Something went wrong");
        throw e;
      }
    },
    [loading, workspaceId, createDocumentMutation]
  );

  // ⬢ Delete Document
  // =====================================
  const deleteDocument = useCallback(
    async (id: string, isPermanent?: boolean) => {
      const thisDocument = documents.find(d => d.id === id);
      if (loading || !thisDocument) {
        return;
      }

      const previousStateValue = state.get(workspaceId);

      setState(prev => {
        const { loading: prevLoading, documents: prevDocuments } = prev.get(
          workspaceId
        ) ?? {
          loading: true,
          documents: List(),
        };
        return prev.set(workspaceId, {
          loading: prevLoading,
          documents: deleteDocumentInMemory(prevDocuments, id, isPermanent),
        });
      });

      try {
        const result = await deleteDocumentMutation({
          variables: {
            input: {
              workspaceId,
              documentId: id,
              isPermanent: isPermanent ?? false,
            },
          },
        });

        if (!result.data?.deleteDocument) {
          throw new Error("Failed to delete document");
        }

        unfavoriteDocument(id);
      } catch (e) {
        if (previousStateValue) {
          setState(s => s.set(workspaceId, previousStateValue));
        } else {
          setState(s => s.delete(workspaceId));
        }
        toast.error("Something went wrong");
      }
    },
    [
      documents,
      workspaceId,
      loading,
      setState,
      unfavoriteDocument,
      state,
      deleteDocumentMutation,
    ]
  );

  // ⬢ Duplicate Document
  // =====================================
  const duplicateDocument = useCallback(
    async (id: string) => {
      if (loading) {
        throw new Error("Cannot duplicate document while loading");
      }

      setState(s =>
        s.set(workspaceId, {
          loading: true,
          documents: s.get(workspaceId)?.documents ?? List(),
        })
      );

      try {
        const result = await duplicateDocumentMutation({
          variables: {
            input: {
              workspaceId,
              documentId: id,
            },
          },
        });

        if (!result.data?.duplicateDocument) {
          throw new Error("Failed to duplicate document");
        }

        const doc = result.data.duplicateDocument as ApiDocument;

        setState(prev => {
          const prevDocuments = prev.get(workspaceId)?.documents ?? List();

          let updated = false;
          let newDocuments = prevDocuments.map(d => {
            if (d.id === doc.id) {
              updated = true;
              return doc;
            }
            return d;
          });

          if (!updated) {
            newDocuments = newDocuments.push(doc);
          }

          return prev.set(workspaceId, {
            loading: false,
            documents: newDocuments,
          });
        });

        return doc;
      } catch (e) {
        toast.error("Something went wrong");
        setState(s =>
          s.set(workspaceId, {
            loading: false,
            documents: s.get(workspaceId)?.documents ?? List(),
          })
        );
        throw e;
      }
    },
    [workspaceId, loading, setState, duplicateDocumentMutation]
  );

  // ⬢ Restore Document
  // =====================================
  const restoreDocument = useCallback(
    async (id: string) => {
      if (loading) {
        throw new Error("Cannot restore document while loading");
      }

      try {
        const result = await restoreDocumentMutation({
          variables: {
            input: {
              workspaceId,
              documentId: id,
            },
          },
        });

        if (!result.data?.restoreDocument) {
          throw new Error("Failed to restore document");
        }
      } catch (e) {
        toast.error("Something went wrong");
        throw e;
      }
    },
    [workspaceId, loading, restoreDocumentMutation]
  );

  // ⬢ Empty Trash
  // =====================================
  const emptyTrash = useCallback(async () => {
    if (loading) {
      throw new Error("Cannot empty trash while loading");
    }

    const previousStateValue = state.get(workspaceId);

    setState(prev => {
      const { loading: prevLoading, documents: prevDocuments } = prev.get(
        workspaceId
      ) ?? {
        loading: true,
        documents: List(),
      };
      return prev.set(workspaceId, {
        loading: prevLoading,
        documents: prevDocuments.filter(d => !d.deletedAt),
      });
    });

    try {
      const result = await emptyTrashMutation({
        variables: { workspaceId },
      });

      if (!result.data?.emptyTrash) {
        throw new Error("Failed to empty trash");
      }
    } catch (e) {
      if (previousStateValue) {
        setState(s => s.set(workspaceId, previousStateValue));
      } else {
        setState(s => s.delete(workspaceId));
      }
      toast.error("Something went wrong");
      throw e;
    }
  }, [workspaceId, loading, state, setState, emptyTrashMutation]);

  // ⬢ Update Parent
  // =====================================
  const updateParent = useCallback(
    async (
      id: string,
      futureParentId: string | null,
      futureOrderIndex: number
    ) => {
      const document = documents.find(doc => doc.id === id);
      if (!document) {
        return;
      }

      if (
        futureParentId === document.parentId &&
        futureOrderIndex === document.orderIndex
      ) {
        return;
      }

      let affectedDocuments = Map<string, ApiDocument>();
      documents.forEach(doc => {
        if (document.parentId !== futureParentId) {
          if (
            doc.parentId === document.parentId &&
            doc.orderIndex > document.orderIndex
          ) {
            affectedDocuments = affectedDocuments.set(doc.id, {
              ...doc,
              orderIndex: doc.orderIndex - 1,
            });
          }

          if (
            doc.parentId === futureParentId &&
            doc.orderIndex >= futureOrderIndex &&
            futureOrderIndex !== -1
          ) {
            affectedDocuments = affectedDocuments.set(doc.id, {
              ...doc,
              orderIndex: doc.orderIndex + 1,
            });
          }
        } else if (
          document.orderIndex !== futureOrderIndex &&
          futureOrderIndex !== -1
        ) {
          if (doc.parentId === document.parentId) {
            if (doc.orderIndex >= futureOrderIndex) {
              affectedDocuments = affectedDocuments.set(doc.id, {
                ...doc,
                orderIndex: doc.orderIndex + 1,
              });
            }
          }
        }
      });

      let actualOrderIndex = futureOrderIndex;
      if (futureOrderIndex === -1) {
        actualOrderIndex = documents.filter(
          doc => doc.parentId === futureParentId
        ).size;
      }

      const previousStateValue = state.get(workspaceId);
      setState(prev => {
        const { loading: prevLoading, documents: prevDocuments } = prev.get(
          workspaceId
        ) ?? {
          loading: true,
          documents: List(),
        };
        return prev.set(workspaceId, {
          loading: prevLoading,
          documents: prevDocuments.map(doc => {
            const affectedDoc = affectedDocuments.get(doc.id);
            if (affectedDoc) return affectedDoc;
            if (doc.id === id) {
              return {
                ...doc,
                parentId: futureParentId,
                orderIndex: actualOrderIndex,
              };
            }
            return doc;
          }),
        });
      });

      try {
        const result = await updateDocumentMutation({
          variables: {
            workspaceId,
            documentId: id,
            input: {
              parentId: futureParentId,
              orderIndex: actualOrderIndex,
            },
          },
        });

        if (!result.data?.updateDocument) {
          throw new Error("Failed to update document parent");
        }
      } catch (e) {
        toast.error("Something went wrong");
        if (previousStateValue) {
          setState(s => s.set(workspaceId, previousStateValue));
        } else {
          setState(s => s.delete(workspaceId));
        }
        throw e;
      }
    },
    [documents, workspaceId, state, setState, updateDocumentMutation]
  );

  // ⬢ Publish Document
  // =====================================
  const publish = useCallback(
    async (id: string) => {
      const document = documents.find(doc => doc.id === id);
      if (!document) {
        return;
      }

      try {
        const result = await publishDocumentMutation({
          variables: {
            workspaceId,
            documentId: id,
          },
        });

        if (!result.data?.publishDocument) {
          throw new Error(`Error publishing Document(${id})`);
        }

        setState(prev => {
          const { loading: prevLoading, documents: prevDocuments } = prev.get(
            workspaceId
          ) ?? {
            loading: true,
            documents: List(),
          };
          return prev.set(workspaceId, {
            loading: prevLoading,
            documents: prevDocuments.map(doc =>
              doc.id === id
                ? {
                    ...doc,
                    isDataApp: true,
                    publishedAt: new Date().toISOString(),
                  }
                : doc
            ),
          });
        });
      } catch (e) {
        toast.error("Failed to publish document");
        throw e;
      }
    },
    [documents, workspaceId, setState, publishDocumentMutation]
  );

  // ⬢ Unpublish Document
  // =====================================
  const unpublish = useCallback(
    async (id: string) => {
      const document = documents.find(doc => doc.id === id);
      if (!document) {
        return;
      }

      try {
        const result = await unpublishDocumentMutation({
          variables: {
            workspaceId,
            documentId: id,
          },
        });

        if (!result.data?.unpublishDocument) {
          throw new Error(`Error unpublishing Document(${id})`);
        }

        setState(prev => {
          const { loading: prevLoading, documents: prevDocuments } = prev.get(
            workspaceId
          ) ?? {
            loading: true,
            documents: List(),
          };
          return prev.set(workspaceId, {
            loading: prevLoading,
            documents: prevDocuments.map(doc =>
              doc.id === id ? { ...doc, publishedAt: null } : doc
            ),
          });
        });
      } catch (e) {
        toast.error("Failed to unpublish document");
        throw e;
      }
    },
    [documents, workspaceId, setState, unpublishDocumentMutation]
  );

  // ⬢ Set Document Link Visibility
  // =====================================
  const setLinkVisibility = useCallback(
    async (id: string) => {
      const document = documents.find(doc => doc.id === id);
      if (!document) {
        return;
      }

      try {
        const result = await setLinkVisibilityMutation({
          variables: {
            workspaceId,
            documentId: id,
          },
        });

        if (!result.data?.setDocumentLinkVisibility) {
          throw new Error(`Error setting link visibility for Document(${id})`);
        }

        // Mirrors unpublish: LINK docs never appear on the community
        // explore/trending feeds, so publishedAt is cleared server-side too.
        setState(prev => {
          const { loading: prevLoading, documents: prevDocuments } = prev.get(
            workspaceId
          ) ?? {
            loading: true,
            documents: List(),
          };
          return prev.set(workspaceId, {
            loading: prevLoading,
            documents: prevDocuments.map(doc =>
              doc.id === id
                ? {
                    ...doc,
                    publishedAt: null,
                  }
                : doc
            ),
          });
        });
      } catch (e) {
        toast.error("Failed to update link sharing");
        throw e;
      }
    },
    [documents, workspaceId, setState, setLinkVisibilityMutation]
  );

  // ⬢ Update Document Settings
  // =====================================
  const updateDocumentSettings = useCallback(
    async (
      id: string,
      settings: {
        runUnexecutedBlocks?: boolean;
        runSQLSelection?: boolean;
        shareLinksWithoutSidebar?: boolean;
      }
    ) => {
      const document = documents.find(doc => doc.id === id);
      if (!document) {
        return;
      }

      const previousStateValue = state.get(workspaceId);

      setState(prev => {
        const { loading: prevLoading, documents: prevDocuments } = prev.get(
          workspaceId
        ) ?? {
          loading: true,
          documents: List(),
        };
        return prev.set(workspaceId, {
          loading: prevLoading,
          documents: prevDocuments.map(doc =>
            doc.id === id ? { ...doc, ...settings } : doc
          ),
        });
      });

      try {
        const result = await updateDocumentMutation({
          variables: {
            workspaceId,
            documentId: id,
            // orderIndex is required by UpdateDocumentInput even though
            // this call never changes it — carry the document's current
            // value through so the mutation doesn't fail validation.
            input: {
              orderIndex: document.orderIndex,
              ...settings,
            } as UpdateDocumentInput,
          },
        });

        if (!result.data?.updateDocument) {
          throw new Error(`Error changing settings for Document(${id})`);
        }
      } catch (e) {
        toast.error("Something went wrong");
        if (previousStateValue) {
          setState(s => s.set(workspaceId, previousStateValue));
        } else {
          setState(s => s.delete(workspaceId));
        }
        throw e;
      }
    },
    [documents, workspaceId, state, setState, updateDocumentMutation]
  );

  return useMemo(
    () => [
      { loading, documents },
      {
        createDocument,
        duplicateDocument,
        deleteDocument,
        restoreDocument,
        emptyTrash,
        updateParent,
        publish,
        unpublish,
        setLinkVisibility,
        updateDocumentSettings,
      },
    ],
    [
      loading,
      documents,
      createDocument,
      duplicateDocument,
      deleteDocument,
      restoreDocument,
      emptyTrash,
      updateParent,
      publish,
      unpublish,
      setLinkVisibility,
      updateDocumentSettings,
    ]
  );
}
