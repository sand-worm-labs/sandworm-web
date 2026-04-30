"use client";

import { useCallback } from "react";
import {
  useGetTrendingPublishedDocumentsQuery,
  useGetFeaturedDocumentsQuery,
  useGetUserFavoritePublicDocumentsQuery,
  useGetUserForkedPublicDocumentsQuery,
  useGetUserPublicDocumentsQuery,
  useForkDocumentMutation,
} from "@/generated/graphql";
import type { ApiDocument } from "@/types";

// ─── CONSTANTS ───
const DEFAULT_PAGE_SIZE = 20;
const FEATURED_LIMIT = 4;

// ─── TYPES ───
export type PublicDocument = ApiDocument;

export type DocumentFilter =
  | { kind: "trending" }
  | { kind: "favorites"; userId: string }
  | { kind: "forked"; userId: string };

export interface UsePublicDocumentsOptions {
  filter?: DocumentFilter;
  initialDocuments?: PublicDocument[];
  initialFeatured?: PublicDocument[];
  pageSize?: number;
}

export interface UsePublicDocumentsResult {
  documents: PublicDocument[];
  loading: boolean;
  loadingMore: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
  featured: PublicDocument[];
  featuredLoading: boolean;
  featuredError: Error | null;
}

// ─── MAIN HOOK ───
export function usePublicDocuments({
  filter = { kind: "trending" },
  initialDocuments = [],
  initialFeatured = [],
  pageSize = DEFAULT_PAGE_SIZE,
}: UsePublicDocumentsOptions = {}): UsePublicDocumentsResult {

  // ⬢ Only one feed runs at a time based on filter
  const trending = useTrendingFeed(
    filter.kind === "trending",
    initialDocuments,
    pageSize
  );

  const favorites = useFlatUserFeed(
    "favorites",
    filter.kind === "favorites" ? filter.userId : null
  );

  const forked = useFlatUserFeed(
    "forked",
    filter.kind === "forked" ? filter.userId : null
  );

  const feed =
    filter.kind === "trending"
      ? trending
      : filter.kind === "favorites"
        ? favorites
        : forked;

  const featured = useFeaturedInternal(initialFeatured);

  return { ...feed, ...featured };
}

// ─── TRENDING FEED ───
function useTrendingFeed(
  active: boolean,
  initialDocuments: PublicDocument[],
  pageSize: number
) {
  const hasSSR = initialDocuments.length > 0;

  const { data, loading, error, fetchMore, refetch, networkStatus } =
    useGetTrendingPublishedDocumentsQuery({
      variables: { limit: pageSize, offset: 0 },
      notifyOnNetworkStatusChange: true,
      skip: !active || hasSSR,  // ⬢ skip if SSR data already exists
      fetchPolicy: "cache-first",
    });

  const fetched = (data?.getTrendingPublishedDocuments ?? []) as PublicDocument[];
  const documents = hasSSR && fetched.length === 0 ? initialDocuments : fetched;
  const loadingMore = networkStatus === 3;
  const hasMore = documents.length > 0 && documents.length % pageSize === 0;

  const loadMore = useCallback(async () => {
    if (!active || loading || loadingMore || !hasMore) return;
    await fetchMore({
      variables: { limit: pageSize, offset: documents.length },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          ...prev,
          getTrendingPublishedDocuments: [
            ...(prev.getTrendingPublishedDocuments ?? []),
            ...(fetchMoreResult.getTrendingPublishedDocuments ?? []),
          ],
        };
      },
    });
  }, [active, fetchMore, documents.length, pageSize, loading, loadingMore, hasMore]);

  return {
    documents,
    loading: active && !hasSSR ? loading : false,
    loadingMore,
    error: (error as Error) ?? null,
    hasMore,
    loadMore,
    refetch: async () => { await refetch({ limit: pageSize, offset: 0 }); },
  };
}

// ─── USER FEEDS ───
function useFlatUserFeed(kind: "favorites" | "forked", userId: string | null) {
  const favoritesQ = useGetUserFavoritePublicDocumentsQuery({
    skip: !userId || kind !== "favorites",
    fetchPolicy: "cache-and-network",
  });

  const forkedQ = useGetUserForkedPublicDocumentsQuery({
    skip: !userId || kind !== "forked",
    fetchPolicy: "cache-and-network",
  });

  const { loading, error, refetch } = kind === "favorites" ? favoritesQ : forkedQ;

  const documents =
    kind === "favorites"
      ? ((favoritesQ.data?.favoritePublicDocuments ?? []) as PublicDocument[])
      : ((forkedQ.data?.getUserForkedPublicDocuments ?? []) as PublicDocument[]);

  return {
    documents,
    loading: userId ? loading : false,
    loadingMore: false,
    error: (error as Error) ?? null,
    hasMore: false,
    loadMore: async () => {},
    refetch: async () => { await refetch(); },
  };
}

// ─── FEATURED ───
function useFeaturedInternal(initialFeatured: PublicDocument[]) {
  const hasSSR = initialFeatured.length > 0;

  const { data, loading, error } = useGetFeaturedDocumentsQuery({
    variables: { limit: FEATURED_LIMIT },
    skip: hasSSR,
  });

  return {
    featured: hasSSR
      ? initialFeatured
      : ((data?.getFeaturedDocuments ?? []) as PublicDocument[]),
    featuredLoading: hasSSR ? false : loading,
    featuredError: hasSSR ? null : ((error as Error) ?? null),
  };
}

// ─── USER PUBLIC DOCS ───
export function useUserPublicDocuments(
  userId: string | null,
  pageSize = 20,
  initialDocuments: ApiDocument[] = []
) {
  const hasSSR = initialDocuments.length > 0;

  const { data, loading, error, fetchMore, refetch, networkStatus } =
    useGetUserPublicDocumentsQuery({
      variables: { userId: userId!, limit: pageSize, offset: 0 },
      skip: !userId || hasSSR,
      fetchPolicy: hasSSR ? "cache-only" : "cache-and-network",
      notifyOnNetworkStatusChange: true,
    });

  const fetched = (data?.getUserPublicDocuments ?? []) as ApiDocument[];
  const documents = hasSSR && fetched.length === 0 ? initialDocuments : fetched;
  const loadingMore = networkStatus === 3;
  const hasMore = documents.length > 0 && documents.length % pageSize === 0;

  const loadMore = useCallback(async () => {
    if (!userId || loading || loadingMore || !hasMore) return;
    await fetchMore({
      variables: { userId: userId!, limit: pageSize, offset: documents.length },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          ...prev,
          getUserPublicDocuments: [
            ...(prev.getUserPublicDocuments ?? []),
            ...(fetchMoreResult.getUserPublicDocuments ?? []),
          ],
        };
      },
    });
  }, [userId, fetchMore, documents.length, pageSize, loading, loadingMore, hasMore]);

  return {
    documents,
    loading: userId ? loading : false,
    loadingMore,
    error: (error as Error) ?? null,
    hasMore,
    loadMore,
    refetch: async () => { await refetch(); },
  };
}

// ─── FORK ───
export function useForkDocument() {
  const [forkDocumentMutation, { loading, error }] = useForkDocumentMutation();

  const forkDocument = useCallback(
    async (documentId: string, targetWorkspaceId: string) => {
      const { data } = await forkDocumentMutation({
        variables: { input: { documentId, targetWorkspaceId } },
      });
      return data?.forkDocument ?? null;
    },
    [forkDocumentMutation]
  );

  return {
    forkDocument,
    loading,
    error: (error as Error) ?? null,
  };
}