"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { List } from "immutable";
import { useRouter } from "next/navigation";
import { getDashboard } from "@sandworm/editor";

import type { APIDataSource } from "@/types";
import { useStringQuery } from "@/components/Editor/hooks/useQueryArgs";
import { usePublicYDoc } from "@/components/Editor/hooks/usePublicYDoc";
import PublicNotebookBanner from "@/components/Editor/PublicNotebookBanner";
import type { NotebookView } from "@/components/Editor/ViewSwitcher";
import { PublicSkeleton } from "@/components/Editor/PublicSkeleton";
import { EmptyState } from "@/components/EmptyState";

const PublicEditor = dynamic(() => import("@/components/Editor/PublicEditor"), {
  ssr: false,
});

const EMPTY_DATA_SOURCES: List<APIDataSource> = List();

// ─────────────────────────────────────────────────────────────
// ⬢ PAGE
// ─────────────────────────────────────────────────────────────
export default function PublicNotebookPage() {
  const slug = useStringQuery("slug");
  const router = useRouter();
  const { yDoc, document, error, isSyncing } = usePublicYDoc(slug);
  const [view, setView] = useState<NotebookView>("report");

  const hasDashboardContent = useMemo(
    () => (yDoc ? getDashboard(yDoc).size > 0 : false),
    [yDoc]
  );
  const showDashboard = hasDashboardContent && !!document?.isDashboardPublic;

  const onChangeView = (nextView: NotebookView) => {
    if (nextView === "dashboard") {
      router.push(`/notebooks/${slug}/dashboard`);
      return;
    }
    setView(nextView);
  };

  useEffect(() => {
    if (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }, [error]);

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

    if (isSyncing || !document || !yDoc) {
      return <PublicSkeleton />;
    }

    return (
      <PublicEditor
        document={document}
        dataSources={EMPTY_DATA_SOURCES}
        isApp
        isPDF={false}
        isFullScreen={false}
        yDoc={yDoc}
        isSyncing={false}
        isQueryView={view === "query"}
      />
    );
  }, [error, isSyncing, document, yDoc, view]);

  return (
    <div className="flex flex-col h-screen bg-base-100 dark:bg-page-surface font-body">
      <PublicNotebookBanner
        document={document}
        view={view}
        onChangeView={onChangeView}
        notFound={!!error}
        showDashboard={showDashboard}
      />
      <div className="flex-1 min-w-0 flex overflow-hidden">{content}</div>
    </div>
  );
}
