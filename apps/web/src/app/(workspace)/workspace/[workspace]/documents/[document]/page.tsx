"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStringQuery } from "@/components/Visualization/hooks/useQueryArgs";
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

interface PrivateDocumentPageProps {
  workspaceId: string;
  documentId: string;
  user: SessionUser;
  role: UserWorkspaceRole;
}

function PrivateDocumentPage(props: PrivateDocumentPageProps) {
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
      return;
    }

    if (document.hasDashboard) {
      router.replace(
        `/workspace/${props.workspaceId}/documents/${props.documentId}/dashboard${location.search}`
      );
    } else {
      router.replace(
        `/workspace/${props.workspaceId}/documents/${props.documentId}/notebook${location.search}`
      );
    }
  }, [document, loading, props.workspaceId, props.documentId, router]);

  return (
    <div style={{ padding: "20px" }}>
      <p>Loading document...</p>
    </div>
  );
}

export default function DocumentPage() {
  const session = {
    data: MOCK_SESSION,
    isLoading: false,
  };

  const workspaceId = useStringQuery("workspace");
  const documentId = useStringQuery("document");

  const role = session.data?.roles[workspaceId];
  const router = useRouter();

  if (!session.data || !role) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>Debug Info:</h2>
        <p>
          <strong>Workspace ID from URL:</strong> {workspaceId || "null"}
        </p>
        <p>
          <strong>Document ID from URL:</strong> {documentId || "null"}
        </p>
        <p>
          <strong>Role:</strong> {role || "undefined"}
        </p>
        <p>
          <strong>Available workspace IDs:</strong>{" "}
          {Object.keys(session.data?.roles || {}).join(", ")}
        </p>
        <p style={{ color: "red" }}>No role found for this workspace</p>
      </div>
    );
  }

  return (
    <PrivateDocumentPage
      workspaceId={workspaceId}
      documentId={documentId}
      user={session.data}
      role={role}
    />
  );
}
