"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

import { useStringQuery } from "@/components/Visualization/hooks/useQueryArgs";
import { useDocuments } from "@/components/Visualization/hooks/useDocuments";
import { Loader } from "@/components/Loader";

export default function DocumentsPage() {
  const router = useRouter();
  const workspaceId = useStringQuery("workspace");
  const [state] = useDocuments(workspaceId);

  const documents = useMemo(
    () =>
      state.documents.filter(doc => doc.deletedAt === null && doc.version > 1),
    [state.documents]
  );

  useEffect(() => {
    const first = documents.first();
    if (!state.loading && first) {
      router.replace(`/workspace/${workspaceId}/documents/${first.id}`);
    }
  }, [state.loading, documents, workspaceId, router]);

  if (state.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (!state.loading && documents?.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-ink-400">No documents found</p>
        </div>
      </div>
    );
  }

  return null;
}
