"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

import { useStringQuery } from "@/components/Visualization/hooks/useQueryArgs";
import { useDocuments } from "@/components/Visualization/hooks/useDocuments";

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
  }, [state.loading, documents, workspaceId]);

  return null;
}
