"use client";

import dynamic from "next/dynamic";
import Head from "next/head";

import { useSession } from "@/components/Editor/hooks/useAuth";
import { useStringQuery } from "@/components/Editor/hooks/useQueryArgs";
import useDocument from "@/components/Editor/hooks/useDocument";

const Dashboard = dynamic(
  () => import("@/components/Editor/blocks/Dashboard"),
  { ssr: false }
);

export default function DashboardPage() {
  const session = useSession({ redirectToLogin: true });

  const workspaceId = useStringQuery("workspace");
  const documentId = useStringQuery("document");

  const [{ document, loading, publishing }, { publish }] = useDocument(
    workspaceId,
    documentId
  );

  if (!session.user || loading || !document) {
    return null;
  }

  const role =
    session?.user?.role?.find(r => r[workspaceId])?.[workspaceId] ?? "viewer";

  return (
    <>
      <Head>
        <title>{document.title || "Untitled"} - Dashboard</title>
      </Head>

      <main className="min-h-screen">
        <Dashboard
          document={document}
          role={role}
          user={session.user}
          isEditing={false}
          publish={publish}
          publishing={publishing}
        />
      </main>
    </>
  );
}
