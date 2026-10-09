import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Tag } from "@/components/Tag";
import {
  fetchShowcaseConfig,
  fetchShowcaseNotebooks,
} from "@/components/Showcase/fetchShowcase";
import { PublishedNotebook } from "@/components/Showcase/PublishedNotebook";
import { gridBackdrop } from "@/components/Showcase/BoardKit";
import { ShowcaseHeader } from "@/components/Showcase/ShowcaseHeader";
import { ShowcaseLeadButton } from "@/components/Showcase/ShowcaseLeadButton";
import {
  CaseStudyCard,
  ShowcaseBreadcrumb,
  ShowcaseSection,
  ShowcaseStats,
} from "@/components/Showcase/ShowcaseParts";
import {
  OpenNotebookLink,
  TrackCaseStudyView,
} from "@/components/Showcase/ShowcaseTracked";
import {
  categoryHref,
  findCaseStudy,
  findCategory,
  groupLabel,
  ofKind,
} from "@/lib/showcase";
import type { ShowcaseLeadTarget } from "@/types";

// =====================================
// ⬢  Types
// =====================================
type Props = { params: Promise<{ category: string; protocol: string }> };

// =====================================
// ⬢  Data
// =====================================
async function loadCaseStudy(params: Props["params"]) {
  const { category: categorySlug, protocol } = await params;
  const { taxonomy } = await fetchShowcaseConfig();
  const category = findCategory(categorySlug, taxonomy);
  if (!category) return null;

  const notebooks = await fetchShowcaseNotebooks(category.slug);
  const caseStudy = findCaseStudy(notebooks, category.slug, protocol);
  if (!caseStudy) return null;

  return {
    category,
    group: groupLabel(category.group, taxonomy),
    caseStudy,
    notebooks,
  };
}

// =====================================
// ⬢  Metadata
// =====================================
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const loaded = await loadCaseStudy(params);
  if (!loaded) return {};
  const { caseStudy } = loaded;
  const top = caseStudy.showcase.heroStats[0];
  return {
    title: `${caseStudy.title} – Sandworm Showcase`,
    description:
      caseStudy.description ?? (top ? `${top.value} ${top.label}` : undefined),
  };
}

// =====================================
// ⬢  Page
// =====================================
// Page 3. A case study is a notebook rendered in published mode: this page
// adds the hero above it and the calls to action below.
export default async function ShowcaseCaseStudyPage({ params }: Props) {
  const loaded = await loadCaseStudy(params);
  if (!loaded) notFound();

  const { category, group, caseStudy, notebooks } = loaded;
  const { showcase } = caseStudy;
  const protocol = showcase.protocol ?? caseStudy.title;
  const others = ofKind(notebooks, "case_study").filter(
    n => n.id !== caseStudy.id
  );
  const lead = (kind: ShowcaseLeadTarget["kind"]): ShowcaseLeadTarget => ({
    kind,
    category: category.slug,
    protocol: kind === "claim" ? protocol : undefined,
    notebookSlug: caseStudy.slug,
  });

  const hero = (
    <section className="bg-ink-navy text-white" style={gridBackdrop}>
      <div className="container mx-auto px-4 sm:px-8 py-10">
        <ShowcaseBreadcrumb
          category={category}
          group={group}
          protocol={protocol}
          className="[&_ol]:text-white/60"
        />

        <div className="mt-5 flex flex-wrap items-center gap-1.5">
          <Tag>Case study</Tag>
          {showcase.chains.map(chain => (
            <Tag key={chain}>{chain}</Tag>
          ))}
          {showcase.country && <Tag>{showcase.country}</Tag>}
        </div>

        <h1 className="mt-4 max-w-3xl text-3xl sm:text-5xl font-semibold leading-[1.05] tracking-[-0.02em]">
          {caseStudy.title}
        </h1>
        {caseStudy.description && (
          <p className="mt-3 max-w-2xl text-sm text-white/70">
            {caseStudy.description}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <OpenNotebookLink
            slug={caseStudy.slug}
            category={category.slug}
            className="bg-white text-ink-navy hover:bg-white/90"
          >
            Open the notebook
          </OpenNotebookLink>
          <ShowcaseLeadButton variant="ghost" target={lead("report")}>
            Get this for your protocol
          </ShowcaseLeadButton>
        </div>

        <p className="mt-4 font-body-mono text-[11px] uppercase tracking-[0.12em] text-white/50">
          By Sandworm
          {showcase.dataAsOf ? ` · Data as of ${showcase.dataAsOf}` : ""}
        </p>

        <div className="mt-8">
          <ShowcaseStats stats={showcase.heroStats} dark />
        </div>
      </div>
    </section>
  );

  const closing = (
    <div className="container mx-auto px-4 sm:px-8 pb-16">
      <section className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-dashed border-border-secondary dark:border-border-tertiary p-5">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-ink-100 dark:text-white">
            Work at {protocol}?
          </h2>
          <p className="mt-1 max-w-xl text-sm text-ink-400">
            Claim this page to correct anything we got wrong, add context, and
            get the numbers behind it for your team.
          </p>
        </div>
        <ShowcaseLeadButton variant="outline" target={lead("claim")}>
          Claim this page
        </ShowcaseLeadButton>
      </section>

      {others.length > 0 && (
        <ShowcaseSection title={`More in ${category.name}`}>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {others.map(notebook => (
              <li key={notebook.id}>
                <CaseStudyCard notebook={notebook} />
              </li>
            ))}
          </ul>
        </ShowcaseSection>
      )}

      <section className="mt-10 rounded-xl bg-base-100 border border-border-secondary dark:border-border-tertiary p-6">
        <h2 className="text-lg font-semibold text-ink-100 dark:text-white">
          Run a protocol? Get this page for yours.
        </h2>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <ShowcaseLeadButton target={lead("report")}>
            Request a report
          </ShowcaseLeadButton>
          <Link
            href={categoryHref(category.slug)}
            className="h-9 inline-flex items-center rounded-lg px-4 text-sm font-medium border-[1.5px] border-primary text-primary dark:text-primary-tint-75 dark:border-hover-border"
          >
            Compare {category.name.toLowerCase()}
          </Link>
        </div>
      </section>
    </div>
  );

  return (
    <div className="flex flex-col h-[100dvh] bg-page-surface font-body">
      <ShowcaseHeader active="showcase" />
      <TrackCaseStudyView category={category.slug} protocol={protocol} />
      <PublishedNotebook slug={caseStudy.slug} header={hero} footer={closing} />
    </div>
  );
}
