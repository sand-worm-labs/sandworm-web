"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import useDocument from "@/components/Visualization/hooks/useDocument";
import { useStringQuery } from "@/components/Visualization/hooks/useQueryArgs";
import PrivateDocumentPage from "@/components/Visualization/blocks/PrivateDocumentPage";

export default function NotebookPage() {
  const workspaceId = useStringQuery("workspaceId");
  const documentId = useStringQuery("documentId");

  const mockUser = {
    createdAt: "2025-10-21T14:03:41.471Z",
    email: "dqzxu2gbs@mozmail.com",
    id: "405498a2-f3cb-4307-bd1e-4daf5b3a1dba",
    lastVisitedWorkspaceId: "405498a2-f3cb-4307-bd1e-4daf5b3a1dba",
    name: "Si Cy",
    picture: null,
    roles: {
      "405498a2-f3cb-4307-bd1e-4daf5b3a1dba": "admin",
    },
    updatedAt: "2025-11-07T21:32:32.536Z",
  };

  return (
    <Notebook
      workspaceId={"405498a2-f3cb-4307-bd1e-4daf5b3a1dba"}
      documentId={documentId}
      user={mockUser}
    />
  );
}

interface Props {
  workspaceId: string;
  documentId: string;
  user: any; //testing purpose:   Replace 'any' with your type important
}

function Notebook(props: Props) {
  const [{ document, loading }] = useDocument(
    props.workspaceId,
    props.documentId
  );
  const router = useRouter();

  /*   useEffect(() => {
    if (loading) return;

    if (!document) {
      router.replace(`/workspaces/${props.workspaceId}`);
      return;
    }

    if (document.publishedAt === null) {
      router.replace(
        `/workspaces/${props.workspaceId}/documents/${props.documentId}/notebook/edit${location.search}`
      );
    }
  }, [
    document,
    loading,
    props.user,
    props.workspaceId,
    props.documentId,
    router,
  ]);

  if (loading || !document || document.publishedAt === null) {
    return null;
  }
 */
  return (
    <>
      <Head>
        <title>{"Untitled"} - Sandworm</title>
      </Head>
      <PrivateDocumentPage
        key={props.documentId}
        workspaceId={"405498a2-f3cb-4307-bd1e-4daf5b3a1dba"}
        documentId={props.documentId}
        user={props.user}
        isApp={false}
      />
    </>
  );
}
