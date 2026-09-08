"use client";

import { useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { getDashboard } from "@sandworm/editor";

import { useStringQuery } from "@/components/Editor/hooks/useQueryArgs";
import { usePublicYDoc } from "@/components/Editor/hooks/usePublicYDoc";
import PublicNotebookBanner from "@/components/Editor/PublicNotebookBanner";
import type { NotebookView } from "@/components/Editor/ViewSwitcher";
import { PublicSkeleton } from "@/components/Editor/PublicSkeleton";
import { EmptyState } from "@/components/EmptyState";

const PublicDashboard = dynamic(
  () => import("@/components/Editor/PublicDashboard"),
  { ssr: false }
);

// ─────────────────────────────────────────────────────────────
// ⬢ PAGE
// A document's dashboard is a grid layout over the same blocks as
// its notebook — this route gives it its own shareable URL, mirroring
// the authenticated /notebook vs /dashboard split. Only reachable when
// the document actually has dashboard content and its author has kept
// it public (Page settings > "Show dashboard on public page").
// ─────────────────────────────────────────────────────────────
export default function PublicDashboardPage() {
  const slug = useStringQuery("slug");
  const router = useRouter();
  const { yDoc, document, error, isSyncing } = usePublicYDoc(slug);

  const hasDashboardContent = useMemo(
    () => (yDoc ? getDashboard(yDoc).size > 0 : false),
    [yDoc]
  );

  const notEligible =
    !isSyncing && (!hasDashboardContent || document?.isDashboardPublic === false);

  useEffect(() => {
    if (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
    if (notEligible) {
      router.replace(`/notebooks/${slug}`);
    }
  }, [error, notEligible, router, slug]);

  const onChangeView = (nextView: NotebookView) => {
    if (nextView === "dashboard") return;
    router.push(`/notebooks/${slug}`);
  };

  const content = useMemo(() => {
    if (error) {
      return (
        <EmptyState
          heading="404"
          title="Notebook not found"
          subtitle="This notebook doesn't exist, or it's no longer public."
          showGoBack
        />
      );
    }

    if (isSyncing || !document || !yDoc || notEligible) {
      return <PublicSkeleton />;
    }

    return <PublicDashboard document={document} yDoc={yDoc} />;
  }, [error, isSyncing, document, yDoc, notEligible]);

  return (
    <div className="flex flex-col h-screen bg-base-100 font-body">
      <PublicNotebookBanner
        document={document}
        view="dashboard"
        onChangeView={onChangeView}
        notFound={!!error}
        showDashboard
      />
      <div className="flex-1 min-w-0 flex overflow-hidden">{content}</div>
    </div>
  );
}
