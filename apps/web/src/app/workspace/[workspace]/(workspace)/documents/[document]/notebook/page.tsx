"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";

import useDocument from "@/components/Visualization/hooks/useDocumentLocal";
import { useStringQuery } from "@/components/Visualization/hooks/useQueryArgs";
import PrivateDocumentPage from "@/components/Visualization/blocks/PrivateDocumentPage";
import { useSession } from "@/components/Visualization/hooks/useAuth";

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
        `/workspace/${props.workspaceId}/documents/${props.documentId}/notebook/edit${location.search}`
      );
    }
  }, [document, loading, props.user]);

  if (loading || !document || document.publishedAt === null) {
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
        isApp
      />
    </>
  );
}
