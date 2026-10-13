"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { getDashboard } from "@sandworm/editor";

import { DashboardPageSkeleton } from "@/components/Skeletons";
import { usePublicYDoc } from "@/components/Editor/hooks/usePublicYDoc";

// The dashboard only works in the browser.
// The page around it already has its own side padding.
const SKELETON_CLASS = "px-0 lg:px-0 py-0";
const PublicDashboard = dynamic(
  () => import("@/components/Editor/PublicDashboard"),
  {
    ssr: false,
    loading: () => <DashboardPageSkeleton className={SKELETON_CLASS} />,
  }
);

// =====================================
// ⬢  PublishedDashboard
// =====================================
// A notebook's public dashboard, drawn inside a Showcase page. The page around it owns the
// title and the way to open it on its own; this is only the grid. It takes the height of its
// content, so the page scrolls as one.
export function PublishedDashboard({ slug }: { slug: string }) {
  const { yDoc, document: notebook, error, isSyncing } = usePublicYDoc(slug);

  const hasDashboard = useMemo(
    () => (yDoc ? getDashboard(yDoc).size > 0 : false),
    [yDoc]
  );

  if (error) {
    return (
      <p className="py-10 text-sm text-ink-400">
        The dashboard behind this page could not be loaded.
      </p>
    );
  }

  if (isSyncing || !notebook || !yDoc) {
    return <DashboardPageSkeleton className={SKELETON_CLASS} />;
  }

  if (!hasDashboard) {
    return (
      <p className="py-10 text-sm text-ink-400">
        This dashboard has no tiles yet.
      </p>
    );
  }

  return <PublicDashboard document={notebook} yDoc={yDoc} embedded />;
}
