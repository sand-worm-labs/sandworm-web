"use client";

import dynamic from "next/dynamic";
import Head from "next/head";

import { useSession } from "@/components/Visualization/hooks/useAuth";
import { useStringQuery } from "@/components/Visualization/hooks/useQueryArgs";
import useDocument from "@/components/Visualization/hooks/useDocument";

const Dashboard = dynamic(
  () => import("@/components/Visualization/blocks/Dashboard"),
  { ssr: false }
);

export default function DashboardPage() {
  const session = useSession({ redirectToLogin: true });

  const workspaceId = useStringQuery("workspace");
  const documentId = useStringQuery("document");

  const [{ document, loading }] = useDocument(workspaceId, documentId);

  // Wait until everything is ready
  if (!session.user || loading || !document) {
    return null;
  }

  const role = session.user.roles?.[workspaceId] ?? "viewer";

  return (
    <>
      <Head>
        <title>{document.title || "Untitled"} - Dashboard</title>
      </Head>
      <main className="min-h-screen dark:bg-neutral-950 dark:text-white">
        <Dashboard
          document={document}
          role={role}
          user={session.user}
          isEditing={false}
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
