import { useCallback, useMemo } from "react";

import {
  useAddFavoriteDocumentMutation,
  useRemoveFavoriteDocumentMutation,
  useAddPublicFavoriteDocumentMutation,
  useRemovePublicFavoriteDocumentMutation,
  useGetFavoriteDocumentsQuery,
  GetFavoriteDocumentsDocument,
} from "@/generated/graphql";

// =====================================
// ⬢ Types
// =====================================
type API = {
  favoriteDocument: (docId: string) => Promise<void>;
  unfavoriteDocument: (docId: string, refetch?: boolean) => Promise<void>;
};

type UseFavorites = [
  Set<string>,
  API,
  { data: any; loading: boolean; error?: any },
];

// =====================================
// ⬢ Use Favorites
// =====================================
export const useFavorites = (
  workspaceId: string | null,
  publicDocument = false
): UseFavorites => {
  const { data, loading, error } = useGetFavoriteDocumentsQuery({
    variables: { workspaceId: workspaceId! },
    skip: !workspaceId || publicDocument,
    fetchPolicy: "cache-and-network",
  });

  // Workspace mutations
  const [addFavoriteMutation] = useAddFavoriteDocumentMutation();
  const [removeFavoriteMutation] = useRemoveFavoriteDocumentMutation();

  // Public mutations
  const [addPublicFavoriteMutation] = useAddPublicFavoriteDocumentMutation();
  const [removePublicFavoriteMutation] = useRemovePublicFavoriteDocumentMutation();

  const favorites = useMemo(
    () => data?.getFavoriteDocuments?.map((doc) => doc.id) ?? [],
    [data]
  );

  // ⬢ Add to favorite
  // =====================================
  const favoriteDocument = useCallback(
    async (docId: string) => {
      try {
        if (publicDocument) {
          await addPublicFavoriteMutation({
            variables: {
              input: { documentId: docId },
            },
          });
        } else {
          await addFavoriteMutation({
            variables: {
              input: {
                workspaceId: workspaceId!,
                documentId: docId,
              },
            },
            refetchQueries: workspaceId
              ? [{ query: GetFavoriteDocumentsDocument, variables: { workspaceId } }]
              : [],
          });
        }
      } catch (err) {
        console.error("Failed to favorite document:", err);
        throw err;
      }
    },
    [workspaceId, publicDocument, addFavoriteMutation, addPublicFavoriteMutation]
  );

  // ⬢ Remove from favorite
  // =====================================
  const unfavoriteDocument = useCallback(
    async (docId: string, shouldRefetch = true) => {
      try {
        if (publicDocument) {
          await removePublicFavoriteMutation({
            variables: {
              input: { documentId: docId },
            },
          });
        } else {
          await removeFavoriteMutation({
            variables: {
              input: {
                workspaceId: workspaceId!,
                documentId: docId,
              },
            },
            refetchQueries: shouldRefetch && workspaceId
              ? [{ query: GetFavoriteDocumentsDocument, variables: { workspaceId } }]
              : [],
          });
        }
      } catch (err) {
        console.error("Failed to unfavorite document:", err);
        throw err;
      }
    },
    [workspaceId, publicDocument, removeFavoriteMutation, removePublicFavoriteMutation]
  );

  return useMemo(
    () => [
      new Set(favorites),
      { favoriteDocument, unfavoriteDocument },
      { data, loading, error },
    ],
    [favorites, favoriteDocument, unfavoriteDocument, data, loading, error]
  );
};