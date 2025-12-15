"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";

import { useStringQuery } from "@/components/Visualization/hooks/useQueryArgs";
import PrivateDocumentPage from "@/components/Visualization/blocks/PrivateDocumentPage";
import useDocument from "@/components/Visualization/hooks/useDocumentLocal";

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

const MOCK_SESSION: SessionUser = {
  id: "4a6e71c4-2c06-460b-bb29-f337bf64e0bc",
  email: "dqzxu2gbs@mozmail.com",
  name: "Si Cy",
  picture: null,
  lastVisitedWorkspaceId: "405498a2-f3cb-4307-bd1e-4daf5b3a1dbb",
  createdAt: "2025-10-21T14:03:41.471Z",
  updatedAt: "2025-11-28T04:59:50.952Z",
  roles: {
    "405498a2-f3cb-4307-bd1e-4daf5b3a1dbb": "admin",
  },
};

export default function EditNotebookPage() {
  const session = {
    data: MOCK_SESSION,
    isLoading: false,
  };
  const workspaceId = useStringQuery("workspace");
  const documentId = useStringQuery("document");

  if (!session.data) {
    return null;
  }

  return (
    <EditNotebook
      workspaceId={workspaceId}
      documentId={documentId}
      user={session.data}
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
