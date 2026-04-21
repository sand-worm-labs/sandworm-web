"use client";

import { useCallback, useMemo, useState } from "react";
import { useApolloClient } from "@apollo/client";

import {
  GetExplorerDocumentsDocument,
  type GetExplorerDocumentsQuery,
  type GetExplorerDocumentsQueryVariables,
  useGetFeaturedDocumentsQuery,
} from "@/generated/graphql";
import type { ApiDocument } from "@/types";

// ─── CONSTANTS ───
const DEFAULT_PAGE_SIZE = 20;
const FEATURED_LIMIT = 4;

// ─── TYPES ───
export interface UsePublicDocumentsOptions {
  initialDocuments?: ApiDocument[];
  initialFeatured?: ApiDocument[];
  pageSize?: number;
}

export interface UsePublicDocumentsResult {
  documents: ApiDocument[];
  loading: boolean;
  loadingMore: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
  featured: ApiDocument[];
  featuredLoading: boolean;
  featuredError: Error | null;
}

export function usePublicDocuments(
  options: UsePublicDocumentsOptions = {}
): UsePublicDocumentsResult {
  const {
    initialDocuments = [],
    initialFeatured = [],
    pageSize = DEFAULT_PAGE_SIZE,
  } = options;

  const client = useApolloClient();

  // ─── EXPLORER STATE ───
  const [documents, setDocuments] = useState<ApiDocument[]>(initialDocuments);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const [hasMore, setHasMore] = useState(
    initialDocuments.length === 0 || initialDocuments.length >= pageSize
  );

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return;

    const isColdStart = documents.length === 0;
    if (isColdStart) setLoading(true);
    else setLoadingMore(true);
    setError(null);

    try {
      const result = await client.query<
        GetExplorerDocumentsQuery,
        GetExplorerDocumentsQueryVariables
      >({
        query: GetExplorerDocumentsDocument,
        variables: { limit: pageSize, offset: documents.length },
        fetchPolicy: "network-only",
      });

      console.log("Full Apollo Result:", result);

      const incoming = (result.data?.getExplorerDocuments ??
        []) as ApiDocument[];

      setDocuments(prev => [...prev, ...incoming]);
      if (incoming.length < pageSize) setHasMore(false);
    } catch (err) {
      console.error("Apollo Query Error:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [client, documents.length, hasMore, loading, loadingMore, pageSize]);

  // ─── FEATURED ───
  const hasSSRFeatured = initialFeatured.length > 0;
  const {
    data: featuredData,
    loading: featuredClientLoading,
    error: featuredClientError,
  } = useGetFeaturedDocumentsQuery({
    variables: { limit: FEATURED_LIMIT },
    skip: hasSSRFeatured,
  });

  const featured = useMemo(() => {
    if (hasSSRFeatured) return initialFeatured;
    return (featuredData?.getFeaturedDocuments ?? []) as ApiDocument[];
  }, [hasSSRFeatured, initialFeatured, featuredData]);

  return {
    documents,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    featured,
    featuredLoading: hasSSRFeatured ? false : featuredClientLoading,
    featuredError: hasSSRFeatured ? null : (featuredClientError ?? null),
  };
}
