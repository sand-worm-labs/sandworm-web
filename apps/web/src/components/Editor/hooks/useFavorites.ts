import { useCallback, useMemo } from "react";

import {
  useAddFavoriteDocumentMutation,
  useRemoveFavoriteDocumentMutation,
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
export const useFavorites = (workspaceId: string): UseFavorites => {
  const { data, loading, error } = useGetFavoriteDocumentsQuery({
    variables: { workspaceId },
    skip: !workspaceId,
    fetchPolicy: "cache-and-network",
  });

  const [addFavoriteMutation] = useAddFavoriteDocumentMutation();
  const [removeFavoriteMutation] = useRemoveFavoriteDocumentMutation();

  const favorites = useMemo(
    () => data?.getFavoriteDocuments?.map(doc => doc.id) ?? [],
    [data]
  );

  // ⬢ Add to favorite
  // =====================================
  const favoriteDocument = useCallback(
    async (docId: string) => {
      try {
        await addFavoriteMutation({
          variables: {
            input: {
              workspaceId,
              documentId: docId,
            },
          },
          refetchQueries: [
            {
              query: GetFavoriteDocumentsDocument,
              variables: { workspaceId },
            },
          ],
        });
      } catch (err) {
        console.error("Failed to favorite document:", err);
        throw error;
      }
    },
    [workspaceId, addFavoriteMutation]
  );

  // ⬢ Remove from favorite
  // =====================================
  const unfavoriteDocument = useCallback(
    async (docId: string, shouldRefetch = true) => {
      try {
        await removeFavoriteMutation({
          variables: {
            input: {
              workspaceId,
              documentId: docId,
            },
          },
          refetchQueries: shouldRefetch
            ? [
                {
                  query: GetFavoriteDocumentsDocument,
                  variables: { workspaceId },
                },
              ]
            : [],
        });
      } catch (err) {
        console.error("Failed to unfavorite document:", error);
        throw error;
      }
    },
    [workspaceId, removeFavoriteMutation]
  );

  return useMemo(
    () => [
      new Set(favorites),
      {
        favoriteDocument,
        unfavoriteDocument,
      },
      {
        data,
        loading,
        error,
      },
    ],
    [favorites, favoriteDocument, unfavoriteDocument, data, loading, error]
  );
};
