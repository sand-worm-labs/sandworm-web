"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useStringQuery } from "@/components/Visualization/hooks/useQueryArgs";
import {
  ContentSkeleton,
  TitleSkeleton,
} from "@/components/Editor/ContentSkeleton";
import { useSession } from "@/components/Visualization/hooks/useAuth";
import useDocument from "@/components/Visualization/hooks/useDocument";

interface PrivateDocumentPageProps {
  workspaceId: string;
  documentId: string;
}

function PrivateDocumentPage(props: PrivateDocumentPageProps) {
  const [{ document, loading }] = useDocument(
    props.workspaceId,
    props.documentId
  );
  const router = useRouter();
  const searchParams = useSearchParams();

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
        `/workspace/${props.workspaceId}/documents/${props.documentId}/notebook/edit${searchParams.toString()}`
      );
      return;
    }

    if (document.hasDashboard) {
      router.replace(
        `/workspace/${props.workspaceId}/documents/${props.documentId}/dashboard${searchParams.toString()}`
      );
    } else {
      router.replace(
        `/workspace/${props.workspaceId}/documents/${props.documentId}/notebook${searchParams.toString()}`
      );
    }
  }, [document, loading, props.workspaceId, props.documentId, router]);

  return (
    <div className="w-full flex justify-center">
      <div className="py-20">
        <TitleSkeleton visible />
        <ContentSkeleton visible />
      </div>
    </div>
  );
}

export default function DocumentPage() {
  const session = useSession({ redirectToLogin: true });
  const workspaceId = useStringQuery("workspace");
  const documentId = useStringQuery("document");

  const roles = session?.user?.role;

  if (!session.user || !roles) {
    return <div></div>;
  }

  return (
    <PrivateDocumentPage workspaceId={workspaceId} documentId={documentId} />
  );
}
