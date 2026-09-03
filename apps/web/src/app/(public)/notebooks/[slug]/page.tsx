"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as Y from "yjs";
import dynamic from "next/dynamic";
import { List } from "immutable";
import clsx from "clsx";

import type { ApiDocument, APIDataSource } from "@/types";
import { base64ToUint8Array } from "@/helpers/formatters";
import { useStringQuery } from "@/components/Editor/hooks/useQueryArgs";
import {
  useGetPublishedDocumentBySlugQuery,
  useGetPublishedDocumentStateQuery,
} from "@/generated/graphql";
import PublicNotebookBanner from "@/components/Editor/PublicNotebookBanner";
import type { NotebookView } from "@/components/Editor/ViewSwitcher";
import { publicWidthClasses } from "@/components/Editor/constants";
import {
  ContentSkeleton,
  TitleSkeleton,
} from "@/components/Editor/ContentSkeleton";
import { EmptyState } from "@/components/EmptyState";

const PublicEditor = dynamic(() => import("@/components/Editor/PublicEditor"), {
  ssr: false,
});

const EMPTY_DATA_SOURCES: List<APIDataSource> = List();

// ─────────────────────────────────────────────────────────────
// ⬢ HOOK — usePublicYDoc
// Fetches the published document + its Yjs state by public slug,
// then hydrates a fresh Y.Doc once. No provider, no socket.
// ─────────────────────────────────────────────────────────────
function usePublicYDoc(slug: string): {
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
      forkCount: 0,
      favoriteCount: 0,
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

// ─────────────────────────────────────────────────────────────
// ⬢ LOADING SKELETON
// ─────────────────────────────────────────────────────────────
function PublicSkeleton() {
  return (
    <div className="w-full flex justify-center">
      <div className={clsx(publicWidthClasses, "py-20")}>
        <TitleSkeleton visible />
        <ContentSkeleton visible />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ⬢ PAGE
// ─────────────────────────────────────────────────────────────
export default function PublicNotebookPage() {
  const slug = useStringQuery("slug");
  const { yDoc, document, error, isSyncing } = usePublicYDoc(slug);
  const [view, setView] = useState<NotebookView>("report");

  useEffect(() => {
    if (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }, [error]);

  const content = useMemo(() => {
    if (error) {
      return (
        <EmptyState
          heading="404"
          title="Notebook not found"
          subtitle="This notebook doesn't exist, or it's no longer public."
          showGoBack
        />
      );
    }

    if (isSyncing || !document || !yDoc) {
      return <PublicSkeleton />;
    }

    return (
      <PublicEditor
        document={document}
        dataSources={EMPTY_DATA_SOURCES}
        isApp
        isPDF={false}
        isFullScreen={false}
        yDoc={yDoc}
        isSyncing={false}
        isQueryView={view === "query"}
      />
    );
  }, [error, isSyncing, document, yDoc, view]);

  return (
    <div className="flex flex-col h-screen bg-base-100 font-body">
      <PublicNotebookBanner
        document={document}
        view={view}
        onChangeView={setView}
        notFound={!!error}
      />
      <div className="flex-1 min-w-0 flex overflow-hidden">{content}</div>
    </div>
  );
}
