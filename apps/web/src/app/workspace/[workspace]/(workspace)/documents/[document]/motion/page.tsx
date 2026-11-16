"use client";

import dynamic from "next/dynamic";
import Head from "next/head";

import { useSession } from "@/components/Editor/hooks/useAuth";
import { useStringQuery } from "@/components/Editor/hooks/useQueryArgs";
import useDocument from "@/components/Editor/hooks/useDocument";
import { getWorkspaceRole } from "@/utils/workspaceRole";

const Motion = dynamic(() => import("@/components/Editor/blocks/Motion"), {
  ssr: false,
});

export default function MotionPage() {
  const session = useSession({ redirectToLogin: true });

  const workspaceId = useStringQuery("workspace");
  const documentId = useStringQuery("document");

  const [{ document, loading }] = useDocument(workspaceId, documentId);

  if (!session.user || loading || !document) {
    return null;
  }

  const role = getWorkspaceRole(session?.user?.role, workspaceId) ?? "viewer";

  return (
    <>
      <Head>
        <title>{document.title || "Untitled"} - Motion</title>
      </Head>

      <main className="min-h-screen dark:bg-page-surface dark:text-white">
        <Motion document={document} role={role} />
      </main>
    </>
  );
}
