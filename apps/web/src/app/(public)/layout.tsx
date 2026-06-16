"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as Y from "yjs";
import dynamic from "next/dynamic";
import clsx from "clsx";

import type { ApiDocument } from "@/types";
import PublicNotebookBanner from "@/components/Editor/PublicNotebookBanner";
import { widthClasses } from "@/components/Editor/constants";
import {
  ContentSkeleton,
  TitleSkeleton,
} from "@/components/Editor/ContentSkeleton";

const PublicEditor = dynamic(() => import("@/components/Editor/PublicEditor"), {
  ssr: false,
});

// ─────────────────────────────────────────────────────────────
// ⬢ TYPES
// ─────────────────────────────────────────────────────────────

type FetchState<T> =
  | { _tag: "idle" }
  | { _tag: "loading" }
  | { _tag: "error"; message: string }
  | { _tag: "ok"; data: T };

interface Props {
  workspaceId: string;
  documentId: string;
}

// ─────────────────────────────────────────────────────────────
// ⬢ PUBLIC DOC FETCH
// Two parallel requests:
//   1. /api/public/documents/:id          → ApiDocument metadata
//   2. /api/public/documents/:id/state    → raw Yjs update bytes
//
// Adjust endpoint paths to match your NestJS public routes.
// ─────────────────────────────────────────────────────────────

async function fetchPublicDocument(documentId: string): Promise<ApiDocument> {
  const res = await fetch(`/api/public/documents/${documentId}`);
  if (!res.ok) throw new Error(`Failed to fetch document: ${res.status}`);
  return res.json();
}

async function fetchPublicDocState(documentId: string): Promise<Uint8Array> {
  const res = await fetch(`/api/public/documents/${documentId}/state`);
  if (!res.ok) throw new Error(`Failed to fetch doc state: ${res.status}`);
  const buf = await res.arrayBuffer();
  return new Uint8Array(buf);
}

// ─────────────────────────────────────────────────────────────
// ⬢ HOOK — usePublicYDoc
// Fetches + hydrates Y.Doc once. No provider, no socket.
// Returns the same shape callers expect so PublicEditor stays clean.
// ─────────────────────────────────────────────────────────────

function usePublicYDoc(documentId: string): {
  yDoc: Y.Doc | null;
  document: ApiDocument | null;
  error: string | null;
  isSyncing: boolean;
} {
  const yDocRef = useRef<Y.Doc | null>(null);

  const [docState, setDocState] = useState<FetchState<ApiDocument>>({
    _tag: "idle",
  });
  const [syncState, setSyncState] = useState<FetchState<true>>({
    _tag: "idle",
  });

  useEffect(() => {
    if (!documentId) return () => {};

    const doc = new Y.Doc();
    yDocRef.current = doc;

    setDocState({ _tag: "loading" });
    setSyncState({ _tag: "loading" });

    Promise.all([
      fetchPublicDocument(documentId),
      fetchPublicDocState(documentId),
    ])
      .then(([apiDoc, stateBytes]) => {
        Y.applyUpdate(doc, stateBytes);
        setDocState({ _tag: "ok", data: apiDoc });
        setSyncState({ _tag: "ok", data: true });
      })
      .catch(err => {
        const message = err instanceof Error ? err.message : "Unknown error";
        setDocState({ _tag: "error", message });
        setSyncState({ _tag: "error", message });
      });

    return () => {
      doc.destroy();
      yDocRef.current = null;
    };
  }, [documentId]);

  const isSyncing =
    docState._tag === "idle" ||
    docState._tag === "loading" ||
    syncState._tag === "idle" ||
    syncState._tag === "loading";

  const error =
    docState._tag === "error"
      ? docState.message
      : syncState._tag === "error"
        ? syncState.message
        : null;

  const document = docState._tag === "ok" ? docState.data : null;

  return {
    yDoc: yDocRef.current,
    document,
    error,
    isSyncing,
  };
}

// ─────────────────────────────────────────────────────────────
// ⬢ LOADING SKELETON
// ─────────────────────────────────────────────────────────────

function PublicSkeleton() {
  return (
    <div className="w-full flex justify-center">
      <div className={clsx(widthClasses, "py-20")}>
        <TitleSkeleton visible />
        <ContentSkeleton visible />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ⬢ INNER — renders once doc + yDoc are both ready
// ─────────────────────────────────────────────────────────────

function PublicNotebookPageInner({
  workspaceId,
  document,
  yDoc,
  isSyncing,
}: {
  workspaceId: string;
  document: ApiDocument;
  yDoc: Y.Doc;
  isSyncing: boolean;
}) {
  // Data sources are available in public mode for viz blocks that
  // need to reference datasource names. Pass empty array if your
  // public API doesn't expose them — blocks degrade gracefully.

  return (
    <PublicEditor
      document={document}
      isApp
      isPDF={false}
      isFullScreen={false}
      yDoc={yDoc}
      isSyncing={isSyncing}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// ⬢ PAGE
// ─────────────────────────────────────────────────────────────

export default function PublicNotebookPage({ workspaceId, documentId }: Props) {
  const { yDoc, document, error, isSyncing } = usePublicYDoc(documentId);

  const content = useMemo(() => {
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center flex-1 gap-y-2 text-sm text-ink-400">
          <p>Could not load this notebook.</p>
          <p className="text-xs text-red-400">{error}</p>
        </div>
      );
    }

    if (isSyncing || !document || !yDoc) {
      return <PublicSkeleton />;
    }

    return (
      <PublicNotebookPageInner
        workspaceId={workspaceId}
        document={document}
        yDoc={yDoc}
        isSyncing={false}
      />
    );
  }, [error, isSyncing, document, yDoc, workspaceId]);

  return (
    <div className="flex flex-col h-screen bg-base-100 font-body">
      <PublicNotebookBanner />
      <div className="flex-1 min-w-0 flex overflow-hidden">{content}</div>
    </div>
  );
}
