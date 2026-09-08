import { useMemo, useRef } from "react";
import * as Y from "yjs";

import type { ApiDocument } from "@/types";
import { base64ToUint8Array } from "@/helpers/formatters";
import {
  useGetPublishedDocumentBySlugQuery,
  useGetPublishedDocumentStateQuery,
} from "@/generated/graphql";

// ─────────────────────────────────────────────────────────────
// ⬢ HOOK — usePublicYDoc
// Fetches the published document + its Yjs state by public slug,
// then hydrates a fresh Y.Doc once. No provider, no socket.
// ─────────────────────────────────────────────────────────────
export function usePublicYDoc(slug: string): {
  yDoc: Y.Doc | null;
  document: ApiDocument | null;
  error: string | null;
  isSyncing: boolean;
} {
  const yDocRef = useRef<Y.Doc | null>(null);
  const appliedStateRef = useRef<string | null>(null);

  const {
    data: docData,
    loading: docLoading,
    error: docError,
  } = useGetPublishedDocumentBySlugQuery({
    variables: { slug },
    skip: !slug,
  });

  const {
    data: stateData,
    loading: stateLoading,
    error: stateError,
  } = useGetPublishedDocumentStateQuery({
    variables: { slug },
    skip: !slug,
  });

  const rawState = stateData?.getPublishedDocumentState ?? null;

  if (rawState && appliedStateRef.current !== rawState) {
    if (!yDocRef.current) {
      yDocRef.current = new Y.Doc();
    }
    Y.applyUpdate(yDocRef.current, base64ToUint8Array(rawState));
    appliedStateRef.current = rawState;
  }

  const rawDoc = docData?.getPublishedDocumentBySlug;
  const document = useMemo<ApiDocument | null>(() => {
    if (!rawDoc) return null;
    return {
      ...rawDoc,
      isFavorite: false,
      author: rawDoc.author
        ? {
            username: rawDoc.author.username ?? null,
            firstName: rawDoc.author.firstName ?? null,
            lastName: rawDoc.author.lastName ?? null,
            avater: rawDoc.author.avater ?? null,
          }
        : null,
    } as ApiDocument;
  }, [rawDoc]);

  const error = docError?.message ?? stateError?.message ?? null;
  const isSyncing = docLoading || stateLoading || !appliedStateRef.current;

  return { yDoc: yDocRef.current, document, error, isSyncing };
}
