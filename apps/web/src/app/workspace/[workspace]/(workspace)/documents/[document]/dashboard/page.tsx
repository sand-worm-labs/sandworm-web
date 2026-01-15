"use client";

import dynamic from "next/dynamic";
import Head from "next/head";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useStringQuery } from "@/components/Visualization/hooks/useQueryArgs";
import { useSession } from "@/components/Visualization/hooks/useAuth";
import useDocument from "@/components/Visualization/hooks/useDocument";
import type { SessionUser } from "@/types";

const Dashboard = dynamic(
  () => import("@/components/Visualization/blocks/Dashboard"),
  {
    ssr: false,
  }
);

interface Props {
  workspaceId: string;
  documentId: string;
  user: SessionUser;
}

export function DashboardEdit(props: Props) {
  const [{ document, loading }] = useDocument(
    props.workspaceId,
    props.documentId
  );
  const router = useRouter();
  const role = props.user.roles?.[props.workspaceId] || "viewer";
  useEffect(() => {
    if (loading) {
      return;
    }

    if (!document) {
      router.replace(`/workspace/${props.workspaceId}`);
      return;
    }

    if (!document.hasDashboard) {
      router.replace(
        `/workspace/${props.workspaceId}/documents/${props.documentId}/dashboard/edit${window.location.search}`
      );
      return;
    }

    if (role === "viewer") {
      router.replace(
        `/workspace/${props.workspaceId}/documents/${props.documentId}/dashboard${window.location.search}`
      );
    }
  }, [document, loading, role, props.workspaceId, props.documentId, router]);

  if (loading || !document || role === "viewer") {
    return null;
  }

  return (
    <>
      <Head>
        <title>{document.title || "Untitled"} - Dashboard Edit</title>
      </Head>
      <main className="min-h-screen dark:bg-neutral-950 dark:text-white">
        <Dashboard
          document={document}
          role={role}
          user={props.user}
          isEditing
          publish={() => Promise.resolve()}
          publishing={false}
        />
      </main>
    </>
  );
}

export default function DashboardPage() {
  const session = useSession({ redirectToLogin: true });
  const workspaceId = useStringQuery("workspace");
  const documentId = useStringQuery("document");

  if (session.user) {
    return (
      <DashboardEdit
        workspaceId={workspaceId}
        documentId={documentId}
        user={session.user}
      />
    );
  }
}
