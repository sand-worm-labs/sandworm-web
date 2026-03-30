import { useCallback, useMemo } from "react";

import {
  useAddFavoriteDocumentMutation,
  useRemoveFavoriteDocumentMutation,
  useGetFavoriteDocumentsQuery,
  GetFavoriteDocumentsDocument,
} from "@/generated/graphql";

type API = {
  favoriteDocument: (docId: string) => Promise<void>;
  unfavoriteDocument: (docId: string, refetch?: boolean) => Promise<void>;
};

type UseFavorites = [
  Set<string>,
  API,
  { data: any; loading: boolean; error?: any },
];

export const useFavorites = (workspaceId: string): UseFavorites => {
  const { data, refetch, loading, error } = useGetFavoriteDocumentsQuery({
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
      } catch (error) {
        console.error("Failed to favorite document:", error);
        throw error;
      }
    },
    [workspaceId, addFavoriteMutation]
  );

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
      } catch (error) {
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
