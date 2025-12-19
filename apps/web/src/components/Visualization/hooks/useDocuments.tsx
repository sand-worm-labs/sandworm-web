import { Map, List, Set } from "immutable";
import { v4 as uuidv4 } from "uuid";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { equals } from "ramda";

import type { Document, ApiDocument } from "@/types";

import { NEXT_PUBLIC_API_URL } from "../utils/env";

import { useFavorites } from "./useFavorites";
import { useWebsocket } from "./useWebSocket";
import {
  useCreateDocumentMutation,
  useDeleteDocumentMutation,
  useDuplicateDocumentMutation,
  useRestoreDocumentMutation,
  useUpdateDocumentMutation,
  usePublishDocumentMutation,
} from "@/generated/graphql";

function upsertDocumentInMemory(
  documents: List<ApiDocument>,
  workspaceId: string,
  body: { id: string; parentId: string | null; version: number }
) {
  const documentsById = Map(documents.map(d => [d.id, d]));
  const childrenByParentId = List(documents).groupBy(d => d.parentId);

  let affectedDocuments = Map<string, ApiDocument>();

  const doc = documentsById.get(body.id);
  if (doc) {
    if (doc.parentId === body.parentId) {
      // nothing actually changed
      return documents;
    }

    const oldSiblings = childrenByParentId.get(doc.parentId) ?? List();
    // decrement orderIndex of all past siblings that came after the
    // current document
    oldSiblings.forEach(d => {
      if (d.orderIndex > doc.orderIndex) {
        affectedDocuments = affectedDocuments.set(d.id, {
          ...d,
          orderIndex: d.orderIndex - 1,
        });
      }
    });

    // place it at the end of the new siblings
    const newSiblings = childrenByParentId.get(body.parentId) ?? List();
    const orderIndex = newSiblings.size;
    affectedDocuments = affectedDocuments.set(doc.id, {
      ...doc,
      parentId: body.parentId,
      orderIndex,
    });
  } else {
    // inserting, just place it at the end of the new siblings
    const now = new Date();
    const siblings = childrenByParentId.get(body.parentId) ?? List();
    const orderIndex = siblings.size;
    affectedDocuments = affectedDocuments.set(body.id, {
      id: body.id,
      title: "",
      icon: "DocumentIcon",
      parentId: body.parentId,
      orderIndex,
      isSyncedWithYjs: true,
      workspaceId,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      version: body.version,
      publishedAt: null,
      appId: "",
      clock: 0,
      appClock: 0,
      userAppClock: {},
      runUnexecutedBlocks: false,
      runSQLSelection: false,
      shareLinksWithoutSidebar: true,
      hasDashboard: false,
    });
  }

  let result: List<ApiDocument> = List();
  documents.forEach(doc => {
    const affectedDoc = affectedDocuments.get(doc.id);
    if (affectedDoc) {
      result = result.push(affectedDoc);
      affectedDocuments = affectedDocuments.delete(doc.id);
      return;
    }

    result = result.push(doc);
  });

  return result.push(...Array.from(affectedDocuments.values()));
}

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

    // set deletedAt to target document and all children recursively
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
  setIcon: (id: string, icon: string) => Promise<void>;
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
export function DocumentsProvider(props: Props) {
  const socket = useWebsocket();
  const [state, setState] = useState<State>(Map());

  useEffect(() => {
    if (!socket) {
      return;
    }

    const onDocuments = (data: {
      workspaceId: string;
      documents: ApiDocument[];
    }) => {
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

export function useDocuments(workspaceId: string): UseDocuments {
  const [state, setState] = useContext(Context);
  const [_, { unfavoriteDocument }] = useFavorites(workspaceId);
  const { documents, loading } = useMemo(
    (): StateValue =>
      state.get(workspaceId) ?? { loading: true, documents: List() },
    [state, workspaceId]
  );

  const [createDocumentMutation] = useCreateDocumentMutation();
  const [deleteDocumentMutation] = useDeleteDocumentMutation();
  const [duplicateDocumentMutation] = useDuplicateDocumentMutation();
  const [restoreDocumentMutation] = useRestoreDocumentMutation();
  const [updateDocumentMutation] = useUpdateDocumentMutation();
  const [publishDocumentMutation] = usePublishDocumentMutation();

  const createDocument = useCallback(
    async (data: {
      id?: string;
      parentId?: string | null;
      version: number;
    }) => {
      if (loading) {
        throw new Error("Cannot create document while loading");
      }

      const id = data?.id ?? uuidv4();
      const body = {
        id,
        parentId: data?.parentId ?? null,
        version: data.version,
      };
      const previousStateValue = state.get(workspaceId);

      setState(s => {
        const { loading, documents } = s.get(workspaceId) ?? {
          loading: true,
          documents: List(),
        };

        return s.set(workspaceId, {
          loading,
          documents: upsertDocumentInMemory(documents, workspaceId, body),
        });
      });

      try {
        const result = await createDocumentMutation({
          variables: {
            workspaceId,
            input: {
              title: "",
              parentId: body.parentId,
              version: body.version,
            },
          },
        });

        if (!result.data?.createDocument) {
          throw new Error("Failed to create document");
        }

        return result.data.createDocument as Document;
      } catch (e) {
        alert("Something went wrong");
        if (previousStateValue) {
          setState(s => s.set(workspaceId, previousStateValue));
        } else {
          setState(s => s.delete(workspaceId));
        }
        throw e;
      }
    },
    [documents, workspaceId, loading, setState, state, createDocumentMutation]
  );

  const deleteDocument = useCallback(
    async (id: string, isPermanent?: boolean) => {
      const thisDocument = documents.find(d => d.id === id);
      if (loading || !thisDocument) {
        return;
      }

      if (!isPermanent && !thisDocument.parentId) {
        const rootNonDeletedDocuments = documents.filter(
          d => !d.deletedAt && !d.parentId
        );

        if (rootNonDeletedDocuments.size === 1) {
          return;
        }
      }

      const previousStateValue = state.get(workspaceId);

      setState(s => {
        const { loading, documents } = s.get(workspaceId) ?? {
          loading: true,
          documents: List(),
        };

        return s.set(workspaceId, {
          loading,
          documents: deleteDocumentInMemory(documents, id, isPermanent),
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
        alert("Something went wrong");
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

        setState(s => {
          const documents = s.get(workspaceId)?.documents ?? List();

          let updated = false;
          let newDocuments = documents.map(d => {
            if (d.id === doc.id) {
              updated = true;
              return doc;
            }
            return d;
          });

          if (!updated) {
            newDocuments = newDocuments.push(doc);
          }

          return s.set(workspaceId, {
            loading: false,
            documents: newDocuments,
          });
        });

        return doc;
      } catch (e) {
        alert("Something went wrong");
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
        alert("Something went wrong");
        throw e;
      }
    },
    [workspaceId, loading, restoreDocumentMutation]
  );

  const setIcon = useCallback(
    async (id: string, icon: string) => {
      if (loading) {
        throw new Error("Cannot set icon while loading");
      }

      const previousStateValue = state.get(workspaceId);
      setState(s => {
        const { loading, documents } = s.get(workspaceId) ?? {
          loading: true,
          documents: List(),
        };

        return s.set(workspaceId, {
          loading,
          documents: documents.map(doc =>
            doc.id === id ? { ...doc, icon } : doc
          ),
        });
      });

      try {
        // TODO: Convert to GraphQL once backend adds 'icon' to UpdateDocumentInput
        await fetch(
          `${NEXT_PUBLIC_API_URL()}/v1/workspaces/${workspaceId}/documents/${id}/icon`,
          {
            credentials: "include",
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ icon }),
          }
        );
      } catch (e) {
        alert("Something went wrong");
        if (previousStateValue) {
          setState(s => s.set(workspaceId, previousStateValue));
        } else {
          setState(s => s.delete(workspaceId));
        }
        throw e;
      }
    },
    [state, workspaceId, loading, setState]
  );

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
      setState(s => {
        const { loading, documents } = s.get(workspaceId) ?? {
          loading: true,
          documents: List(),
        };

        return s.set(workspaceId, {
          loading,
          documents: documents.map(doc => {
            const affectedDoc = affectedDocuments.get(doc.id);
            if (affectedDoc) {
              return affectedDoc;
            }

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
        alert("Something went wrong");
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

        setState(s => {
          const { loading, documents } = s.get(workspaceId) ?? {
            loading: true,
            documents: List(),
          };
          return s.set(workspaceId, {
            loading,
            documents: documents.map(doc =>
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
        alert("Failed to publish document");
        throw e;
      }
    },
    [documents, workspaceId, setState, publishDocumentMutation]
  );

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

      setState(s => {
        const { loading, documents } = s.get(workspaceId) ?? {
          loading: true,
          documents: List(),
        };

        return s.set(workspaceId, {
          loading,
          documents: documents.map(doc =>
            doc.id === id
              ? {
                  ...doc,
                  ...settings,
                }
              : doc
          ),
        });
      });

      try {
        const result = await updateDocumentMutation({
          variables: {
            workspaceId,
            documentId: id,
            input: settings,
          },
        });

        if (!result.data?.updateDocument) {
          throw new Error(`Error changing settings for Document(${id})`);
        }
      } catch (e) {
        alert("Something went wrong");
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
        setIcon,
        updateParent,
        publish,
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
      setIcon,
      updateParent,
      publish,
      updateDocumentSettings,
    ]
  );
}
