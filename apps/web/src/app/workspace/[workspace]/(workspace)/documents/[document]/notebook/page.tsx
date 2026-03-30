"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useStringQuery } from "@/components/Editor/hooks/useQueryArgs";
import PrivateDocumentPage from "@/components/Editor/blocks/PrivateDocumentPage";
import { useSession } from "@/components/Editor/hooks/useAuth";
import useDocument from "@/components/Editor/hooks/useDocument";
import type { SessionUser } from "@/components/Editor/hooks/useAuth";

interface Props {
  workspaceId: string;
  documentId: string;
  user: SessionUser;
}
function Notebook(props: Props) {
  const [{ document, loading }] = useDocument(
    props.workspaceId,
    props.documentId
  );
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!document) {
      router.replace(`/workspace/${props.workspaceId}`);
      return;
    }

    if (document.publishedAt === null) {
      router.replace(
        `/workspace/${props.workspaceId}/documents/${props.documentId}/notebook/edit${window.location.search}`
      );
    }
  }, [document, loading, props.user]);

  useEffect(() => {
    if (document) {
      window.document.title = `${document.title || "Untitled"} - Sandworm`;
    }
  }, [document?.title]);

  if (loading || !document || document.publishedAt === null) {
    return null;
  }

  return (
    <PrivateDocumentPage
      key={props.documentId}
      workspaceId={props.workspaceId}
      documentId={props.documentId}
      user={props.user}
      isApp
    />
  );
}

export default function NotebookPage() {
  const session = useSession({ redirectToLogin: true });
  const workspaceId = useStringQuery("workspace");
  const documentId = useStringQuery("document");

  if (session.user) {
    return (
      <Notebook
        workspaceId={workspaceId}
        documentId={documentId}
        user={session.user}
      />
    );
  }

  return null;
}
