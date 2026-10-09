import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  fetchShowcaseConfig,
  fetchShowcaseNotebooks,
} from "@/components/Showcase/fetchShowcase";
import { PublishedNotebook } from "@/components/Showcase/PublishedNotebook";
import { eyebrowClass, gridBackdrop } from "@/components/Showcase/BoardKit";
import { ShowcaseHeader } from "@/components/Showcase/ShowcaseHeader";
import { ShowcaseLeadButton } from "@/components/Showcase/ShowcaseLeadButton";
import {
  CaseStudyCard,
  ShowcaseBreadcrumb,
  ShowcaseSection,
  ShowcaseStats,
} from "@/components/Showcase/ShowcaseParts";
import { OpenNotebookLink } from "@/components/Showcase/ShowcaseTracked";
import { findCategory, groupLabel, ofKind } from "@/lib/showcase";

// =====================================
// ⬢  Types
// =====================================
type Props = { params: Promise<{ category: string }> };

// =====================================
// ⬢  Metadata
// =====================================
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { taxonomy } = await fetchShowcaseConfig();
  const category = findCategory((await params).category, taxonomy);
  if (!category) return {};
  return {
    title: `${category.name} – Sandworm Showcase`,
    description: category.question,
  };
}

// =====================================
// ⬢  Page
// =====================================
// Page 2. A category is a notebook rendered in published mode (its metrics
// and leaderboard are cells): this page adds the header above it and the
// case studies and request form below.
export default async function ShowcaseCategoryPage({ params }: Props) {
  const { taxonomy } = await fetchShowcaseConfig();
  const category = findCategory((await params).category, taxonomy);
  if (!category) notFound();

  const notebooks = await fetchShowcaseNotebooks(category.slug);
  const categoryNotebook = ofKind(notebooks, "category")[0];
  const caseStudies = ofKind(notebooks, "case_study");

  const header = (
    <section style={gridBackdrop}>
      <div className="container mx-auto px-4 sm:px-8 pt-8 pb-8">
        <ShowcaseBreadcrumb
          category={category}
          group={groupLabel(category.group, taxonomy)}
        />

        <p className={`mt-6 ${eyebrowClass}`}>Category</p>
        <h1 className="mt-2 text-3xl sm:text-5xl font-semibold leading-[1.05] tracking-[-0.02em] text-ink-100 dark:text-white">
          {category.name}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-400">
          {category.question}
        </p>

        {categoryNotebook ? (
          <>
            <div className="mt-6">
              <ShowcaseStats stats={categoryNotebook.showcase.heroStats} />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <OpenNotebookLink
                slug={categoryNotebook.slug}
                category={category.slug}
                className="bg-primary text-white hover:bg-primary-710"
              >
                Open in notebook
              </OpenNotebookLink>
              {categoryNotebook.showcase.dataAsOf && (
                <span className="font-body-mono text-[11px] uppercase tracking-[0.12em] text-ink-300">
                  Data as of {categoryNotebook.showcase.dataAsOf}
                </span>
              )}
            </div>
          </>
        ) : (
          <p className="mt-6 text-sm text-ink-400">
            The leaderboard for this category is not published yet.
          </p>
        )}
      </div>
    </section>
  );

  const closing = (
    <div className="container mx-auto px-4 sm:px-8 pb-16">
      <ShowcaseSection title="Case studies">
        {caseStudies.length === 0 ? (
          <p className="text-sm text-ink-400">
            No case studies yet. Ask for the protocol you want covered below.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {caseStudies.map(notebook => (
              <li key={notebook.id}>
                <CaseStudyCard notebook={notebook} />
              </li>
            ))}
          </ul>
        )}
      </ShowcaseSection>

      <ShowcaseSection title="Request coverage">
        <p className="max-w-2xl text-sm text-ink-400">
          We rank only protocols we can attribute on-chain with confidence. If
          yours is missing, tell us its name or contract address.
        </p>
        <ShowcaseLeadButton
          className="mt-4"
          target={{ kind: "coverage", category: category.slug }}
        >
          Request coverage
        </ShowcaseLeadButton>
      </ShowcaseSection>
    </div>
  );

  return (
    <div className="flex flex-col h-[100dvh] bg-page-surface font-body">
      <ShowcaseHeader active="showcase" />
      {categoryNotebook ? (
        <PublishedNotebook
          slug={categoryNotebook.slug}
          header={header}
          footer={closing}
        />
      ) : (
        <main className="flex-1 min-w-0 overflow-y-auto">
          {header}
          {closing}
        </main>
      )}
    </div>
  );
}
