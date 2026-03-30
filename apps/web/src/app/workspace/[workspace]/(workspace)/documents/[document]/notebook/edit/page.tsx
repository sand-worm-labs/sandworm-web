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
function EditNotebook(props: Props) {
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
    }
  }, [document, loading, props.user]);

  useEffect(() => {
    if (document) {
      window.document.title = `${document.title || "Untitled"} - Sandworm`;
    }
  }, [document?.title]);

  if (!document) {
    return null;
  }

  return (
    <PrivateDocumentPage
      key={props.documentId}
      workspaceId={props.workspaceId}
      documentId={props.documentId}
      user={props.user}
      isApp={false}
    />
  );
}

export default function EditNotebookPage() {
  const session = useSession({ redirectToLogin: true });
  const workspaceId = useStringQuery("workspace");
  const documentId = useStringQuery("document");

  if (!session.user || !workspaceId || !documentId) {
    return null;
  }
  return (
    <EditNotebook
      workspaceId={workspaceId}
      documentId={documentId}
      user={session.user}
    />
  );
}
