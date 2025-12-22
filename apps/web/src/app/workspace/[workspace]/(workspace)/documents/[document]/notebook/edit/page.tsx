"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";

import { useStringQuery } from "@/components/Visualization/hooks/useQueryArgs";
import PrivateDocumentPage from "@/components/Visualization/blocks/PrivateDocumentPage";
import { useSession } from "@/components/Visualization/hooks/useAuth";
import useDocument from "@/components/Visualization/hooks/useDocument";

type UserWorkspaceRole = "editor" | "viewer" | "admin";

type SessionUser = {
  id: string;
  email: string;
  name: string;
  picture: string | null;
  lastVisitedWorkspaceId: string;
  createdAt: string;
  updatedAt: string;
  roles: Record<string, UserWorkspaceRole>;
};

export default function EditNotebookPage() {
  const session = useSession({ redirectToLogin: true });
  const workspaceId = useStringQuery("workspace");
  const documentId = useStringQuery("document");

  if (!session.user) {
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

  if (!document) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{document.title || "Untitled"} - Sandworm</title>
      </Head>
      <PrivateDocumentPage
        key={props.documentId}
        workspaceId={props.workspaceId}
        documentId={props.documentId}
        user={props.user}
        isApp={false}
      />
    </>
  );
}
