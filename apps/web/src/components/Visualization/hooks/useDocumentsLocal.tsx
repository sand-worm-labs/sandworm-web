import { Map, List } from "immutable";
import { v4 as uuidv4 } from "uuid";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";

import type { ApiDocument } from "@/types";

// localStorage key
const STORAGE_KEY = "workspace_documents_local";

// Helper to load documents from localStorage
function loadDocumentsFromStorage(workspaceId: string): List<ApiDocument> {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${workspaceId}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      return List(parsed);
    }
  } catch (error) {
    console.error("Error loading documents from localStorage:", error);
  }
  return List();
}

// Helper to save documents to localStorage
function saveDocumentsToStorage(
  workspaceId: string,
  documents: List<ApiDocument>
) {
  try {
    localStorage.setItem(
      `${STORAGE_KEY}_${workspaceId}`,
      JSON.stringify(documents.toArray())
    );
  } catch (error) {
    console.error("Error saving documents to localStorage:", error);
  }
}

// Helper function to create a new document object
function createDocumentObject(
  id: string,
  workspaceId: string,
  parentId: string | null,
  orderIndex: number,
  version: number
): ApiDocument {
  const now = new Date();
  return {
    id,
    title: "Untitled",
    parentId,
    orderIndex,
    isSyncedWithYjs: true,
    workspaceId,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    version,
    publishedAt: null,
    appId: "",
    clock: 0,
    appClock: 0,
    userAppClock: {},
    runUnexecutedBlocks: false,
    runSQLSelection: false,
    shareLinksWithoutSidebar: true,
    hasDashboard: false,
  };
}

type StateValue = {
  loading: boolean;
  documents: List<ApiDocument>;
};
type State = Map<string, StateValue>;

type API = {
  createDocument: (data: {
    id?: string;
    parentId?: string | null;
    version: number;
  }) => Promise<ApiDocument>;
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

type UseDocumentsLocalState = {
  loading: boolean;
  documents: List<ApiDocument>;
};
type UseDocumentsLocal = [UseDocumentsLocalState, API];

const LocalContext = createContext<
  [State, React.Dispatch<React.SetStateAction<State>>]
>([Map(), () => { }]);

type Props = {
  children: React.ReactNode;
};

export function DocumentsLocalProvider(props: Props) {
  const [state, setState] = useState<State>(Map());

  return (
    <LocalContext.Provider value={[state, setState]}>
      {props.children}
    </LocalContext.Provider>
  );
}

export function useDocumentsLocal(workspaceId: string): UseDocumentsLocal {
  const [state, setState] = useContext(LocalContext);

  // Initialize documents from localStorage on mount
  useEffect(() => {
    const storedDocuments = loadDocumentsFromStorage(workspaceId);
    setState(s =>
      s.set(workspaceId, {
        loading: false,
        documents: storedDocuments,
      })
    );
  }, [workspaceId, setState]);

  const { documents, loading } = useMemo(
    (): StateValue =>
      state.get(workspaceId) ?? { loading: false, documents: List() },
    [state, workspaceId]
  );

  // Save to localStorage whenever documents change
  useEffect(() => {
    if (!loading && documents.size > 0) {
      saveDocumentsToStorage(workspaceId, documents);
    }
  }, [documents, workspaceId, loading]);

  const createDocument = useCallback(
    async (data: {
      id?: string;
      parentId?: string | null;
      version: number;
    }): Promise<ApiDocument> => {
      const id = data?.id ?? uuidv4();
      const parentId = data?.parentId ?? null;

      // Calculate order index
      const siblings = documents.filter(d => d.parentId === parentId);
      const orderIndex = siblings.size;

      const newDocument = createDocumentObject(
        id,
        workspaceId,
        parentId,
        orderIndex,
        data.version
      );

      setState(s => {
        const currentState = s.get(workspaceId) ?? {
          loading: false,
          documents: List(),
        };

        return s.set(workspaceId, {
          loading: false,
          documents: currentState.documents.push(newDocument),
        });
      });

      return newDocument;
    },
    [documents, workspaceId, setState]
  );

  const deleteDocument = useCallback(
    async (id: string, isPermanent?: boolean) => {
      const thisDocument = documents.find(d => d.id === id);
      if (!thisDocument) {
        return;
      }

      // Prevent deleting the last root document if soft delete
      if (!isPermanent && !thisDocument.parentId) {
        const rootNonDeletedDocuments = documents.filter(
          d => !d.deletedAt && !d.parentId
        );
        if (rootNonDeletedDocuments.size === 1) {
          return;
        }
      }

      setState(s => {
        const currentState = s.get(workspaceId) ?? {
          loading: false,
          documents: List(),
        };

        let newDocuments = currentState.documents;

        if (isPermanent) {
          // Permanently remove the document
          newDocuments = newDocuments.filter(d => d.id !== id);

          // Update order indices for siblings
          newDocuments = newDocuments.map(d => {
            if (
              d.parentId === thisDocument.parentId &&
              d.orderIndex > thisDocument.orderIndex
            ) {
              return { ...d, orderIndex: d.orderIndex - 1 };
            }
            return d;
          });
        } else {
          // Soft delete - mark as deleted
          const deletedAt = new Date();
          newDocuments = newDocuments.map(d => {
            if (d.id === id) {
              return { ...d, deletedAt };
            }
            return d;
          });

          // Update order indices for siblings
          newDocuments = newDocuments.map(d => {
            if (
              d.parentId === thisDocument.parentId &&
              d.orderIndex > thisDocument.orderIndex
            ) {
              return { ...d, orderIndex: d.orderIndex - 1 };
            }
            return d;
          });
        }

        return s.set(workspaceId, {
          loading: false,
          documents: newDocuments,
        });
      });
    },
    [documents, workspaceId, setState]
  );

  const duplicateDocument = useCallback(
    async (id: string): Promise<ApiDocument> => {
      const originalDoc = documents.find(d => d.id === id);
      if (!originalDoc) {
        throw new Error("Document not found");
      }

      const newId = uuidv4();
      const siblings = documents.filter(
        d => d.parentId === originalDoc.parentId
      );
      const orderIndex = siblings.size;

      const duplicatedDoc: ApiDocument = {
        ...originalDoc,
        id: newId,
        title: `${originalDoc.title} (Copy)`,
        orderIndex,
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: null,
      };

      setState(s => {
        const currentState = s.get(workspaceId) ?? {
          loading: false,
          documents: List(),
        };

        return s.set(workspaceId, {
          loading: false,
          documents: currentState.documents.push(duplicatedDoc),
        });
      });

      return duplicatedDoc;
    },
    [documents, workspaceId, setState]
  );

  const restoreDocument = useCallback(
    async (id: string) => {
      setState(s => {
        const currentState = s.get(workspaceId) ?? {
          loading: false,
          documents: List(),
        };

        return s.set(workspaceId, {
          loading: false,
          documents: currentState.documents.map(d =>
            d.id === id ? { ...d, deletedAt: null } : d
          ),
        });
      });
    },
    [workspaceId, setState]
  );

  const setIcon = useCallback(
    async (id: string, icon: string) => {
      setState(s => {
        const currentState = s.get(workspaceId) ?? {
          loading: false,
          documents: List(),
        };

        return s.set(workspaceId, {
          loading: false,
          documents: currentState.documents.map(doc =>
            doc.id === id ? { ...doc, icon, updatedAt: new Date() } : doc
          ),
        });
      });
    },
    [workspaceId, setState]
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

      setState(s => {
        const currentState = s.get(workspaceId) ?? {
          loading: false,
          documents: List(),
        };

        let newDocuments = currentState.documents;

        // Update order indices for old siblings
        if (document.parentId !== futureParentId) {
          newDocuments = newDocuments.map(doc => {
            if (
              doc.parentId === document.parentId &&
              doc.orderIndex > document.orderIndex
            ) {
              return { ...doc, orderIndex: doc.orderIndex - 1 };
            }
            return doc;
          });
        }

        // Calculate actual order index if -1
        let actualOrderIndex = futureOrderIndex;
        if (futureOrderIndex === -1) {
          const futureSiblings = newDocuments.filter(
            doc => doc.parentId === futureParentId
          );
          actualOrderIndex = futureSiblings.size;
        }

        // Update order indices for new siblings
        newDocuments = newDocuments.map(doc => {
          if (
            doc.parentId === futureParentId &&
            doc.orderIndex >= actualOrderIndex &&
            doc.id !== id
          ) {
            return { ...doc, orderIndex: doc.orderIndex + 1 };
          }
          return doc;
        });

        // Update the moved document
        newDocuments = newDocuments.map(doc => {
          if (doc.id === id) {
            return {
              ...doc,
              parentId: futureParentId,
              orderIndex: actualOrderIndex,
              updatedAt: new Date(),
            };
          }
          return doc;
        });

        return s.set(workspaceId, {
          loading: false,
          documents: newDocuments,
        });
      });
    },
    [documents, workspaceId, setState]
  );

  const publish = useCallback(
    async (id: string) => {
      setState(s => {
        const currentState = s.get(workspaceId) ?? {
          loading: false,
          documents: List(),
        };

        return s.set(workspaceId, {
          loading: false,
          documents: currentState.documents.map(doc =>
            doc.id === id
              ? {
                ...doc,
                publishedAt: new Date().toISOString(),
                updatedAt: new Date(),
              }
              : doc
          ),
        });
      });
    },
    [workspaceId, setState]
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
      setState(s => {
        const currentState = s.get(workspaceId) ?? {
          loading: false,
          documents: List(),
        };

        return s.set(workspaceId, {
          loading: false,
          documents: currentState.documents.map(doc =>
            doc.id === id
              ? {
                ...doc,
                ...settings,
                updatedAt: new Date(),
              }
              : doc
          ),
        });
      });
    },
    [workspaceId, setState]
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
