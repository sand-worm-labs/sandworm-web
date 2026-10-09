"use client";

import dynamic from "next/dynamic";
import { List } from "immutable";
import type { ReactNode } from "react";

import { PublicSkeleton } from "@/components/Editor/PublicSkeleton";
import { usePublicYDoc } from "@/components/Editor/hooks/usePublicYDoc";
import { useNotebookSections } from "@/hooks/useNotebookSections";
import type { NotebookSection } from "@/lib/showcaseTemplate";
import type { APIDataSource } from "@/types";

// The editor only works in the browser.
const PublicEditor = dynamic(() => import("@/components/Editor/PublicEditor"), {
  ssr: false,
});

// =====================================
// ⬢  Constants
// =====================================
const EMPTY_DATA_SOURCES: List<APIDataSource> = List();

// =====================================
// ⬢  Contents
// =====================================
// Built from the notebook's H2s. Each entry scrolls to the block it is in.
function Contents({ sections }: { sections: NotebookSection[] }) {
  if (sections.length === 0) return null;

  const scrollTo = (id: string) =>
    document
      .getElementById(`block-group-${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <nav
      aria-label="Contents"
      className="border-b border-border-secondary dark:border-border-tertiary bg-base-100"
    >
      <ol className="container mx-auto px-4 sm:px-8 flex gap-1 overflow-x-auto py-2">
        {sections.map((section, index) => (
          <li key={`${section.id}-${section.title}`} className="shrink-0">
            <button
              type="button"
              onClick={() => scrollTo(section.id)}
              className="h-7 rounded-lg px-2.5 text-[13px] text-ink-400 hover:text-ink-100 dark:hover:text-white hover:bg-base-600 dark:hover:bg-header-surface"
            >
              <span className="font-body-mono text-[11px] text-ink-300 mr-1.5">
                {index + 1}
              </span>
              {section.title}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}

// =====================================
// ⬢  PublishedNotebook
// =====================================
// A notebook in published mode: code hidden, the wider reading width, and a
// contents list from its H2s. The page around it passes its own header (the
// hero) and footer (the calls to action), and the whole thing scrolls as one.
export function PublishedNotebook({
  slug,
  header,
  footer,
}: {
  slug: string;
  header: ReactNode;
  footer: ReactNode;
}) {
  const { yDoc, document: notebook, error, isSyncing } = usePublicYDoc(slug);
  const sections = useNotebookSections(isSyncing ? null : yDoc);

  // The page still has its header and footer when the notebook cannot load.
  if (error || isSyncing || !notebook || !yDoc) {
    return (
      <div className="flex-1 min-w-0 overflow-y-auto">
        {header}
        {error ? (
          <p className="container mx-auto px-4 sm:px-8 py-10 text-sm text-ink-400">
            The notebook behind this page could not be loaded.
          </p>
        ) : (
          <PublicSkeleton />
        )}
        {footer}
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0 flex overflow-hidden">
      <PublicEditor
        document={notebook}
        dataSources={EMPTY_DATA_SOURCES}
        isApp
        isPDF={false}
        isFullScreen={false}
        yDoc={yDoc}
        isSyncing={false}
        isQueryView={false}
        hideHero
        hideTitle
        header={
          <>
            {header}
            <Contents sections={sections} />
          </>
        }
        footer={footer}
      />
    </div>
  );
}
