import type { Metadata } from "next";
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
  NotebookCard,
  ProjectCard,
  ShowcaseBreadcrumb,
  ShowcaseSection,
  ShowcaseStats,
  StartAnalyzingLink,
} from "@/components/Showcase/ShowcaseParts";
import {
  OpenNotebookLink,
  TrackCaseStudyView,
} from "@/components/Showcase/ShowcaseTracked";
import {
  findCaseStudy,
  findCategory,
  groupLabel,
  projectsOf,
  slugify,
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
// Page 3, a project's page. Its case study is a notebook rendered in
// published mode: this page adds the hero above it, and below it the way on
// ("Continue this research"), the project's other notebooks, and the rest of
// the category.
export default async function ShowcaseCaseStudyPage({ params }: Props) {
  const loaded = await loadCaseStudy(params);
  if (!loaded) notFound();

  const { category, group, caseStudy, notebooks } = loaded;
  const { showcase } = caseStudy;
  const protocol = showcase.protocol ?? caseStudy.title;
  const projects = projectsOf(notebooks);
  const project = projects.find(p => p.slug === slugify(protocol));
  const moreNotebooks = (project?.notebooks ?? []).filter(
    n => n.id !== caseStudy.id
  );
  const otherProjects = projects.filter(p => p.slug !== project?.slug);
  const claim: ShowcaseLeadTarget = {
    kind: "claim",
    category: category.slug,
    protocol,
    notebookSlug: caseStudy.slug,
  };
  const claimed = showcase.claimed === true;

  const hero = (
    <section className="bg-ink-navy text-white" style={gridBackdrop}>
      <div className="container mx-auto px-4 sm:px-8 py-10">
        <ShowcaseBreadcrumb
          category={category}
          group={group}
          protocol={protocol}
          className="[&_ol]:text-white/60 [&_span]:!text-white"
        />

        <div className="mt-5 flex flex-wrap items-center gap-1.5">
          <Tag>On-chain analysis</Tag>
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
            Continue this research
          </OpenNotebookLink>
          <StartAnalyzingLink variant="ghost" />
        </div>

        <p className="mt-4 font-body-mono text-[11px] uppercase tracking-[0.12em] text-white/50">
          By Sandworm
          {showcase.dataAsOf ? ` · Data as of ${showcase.dataAsOf}` : ""}
        </p>

        {showcase.heroStats.length > 0 && (
          <div className="mt-8">
            <ShowcaseStats stats={showcase.heroStats} dark />
          </div>
        )}
      </div>
    </section>
  );

  // An unclaimed page opens with the prompt, right under the hero, so the
  // people it is about see it before the notebook.
  const claimPrompt = (
    <section className="border-b border-border-secondary dark:border-border-tertiary bg-base-100">
      <div className="container mx-auto px-4 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-3">
        <p className="min-w-0 max-w-2xl text-sm text-ink-400">
          <span className="font-semibold text-ink-100 dark:text-white">
            Work at {protocol}?
          </span>{" "}
          Claim this page to correct anything and get the numbers for your team.
        </p>
        <ShowcaseLeadButton variant="outline" target={claim}>
          Claim this page
        </ShowcaseLeadButton>
      </div>
    </section>
  );

  const closing = (
    <div className="container mx-auto px-4 sm:px-8 pb-16">
      <section className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-base-100 border border-border-secondary dark:border-border-tertiary p-5">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-ink-100 dark:text-white">
            This page is a notebook
          </h2>
          <p className="mt-1 max-w-xl text-sm text-ink-400">
            Open the notebook behind this page: run it again, change the
            question, and keep asking.
          </p>
        </div>
        <OpenNotebookLink
          slug={caseStudy.slug}
          category={category.slug}
          className="bg-primary text-white hover:bg-primary-710"
        >
          Continue this research
        </OpenNotebookLink>
      </section>

      {moreNotebooks.length > 0 && (
        <ShowcaseSection title={`More on ${protocol}`}>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {moreNotebooks.map(notebook => (
              <li key={notebook.id}>
                <NotebookCard notebook={notebook} />
              </li>
            ))}
          </ul>
        </ShowcaseSection>
      )}

      {otherProjects.length > 0 && (
        <ShowcaseSection title={`More in ${category.name}`}>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {otherProjects.map(other => (
              <li key={other.slug}>
                <ProjectCard project={other} category={category.slug} />
              </li>
            ))}
          </ul>
        </ShowcaseSection>
      )}

      {claimed && (
        <section className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-dashed border-border-secondary dark:border-border-tertiary p-5">
          <p className="min-w-0 max-w-xl text-sm text-ink-400">
            On another team? Look at your own protocol the same way.
          </p>
          <StartAnalyzingLink />
        </section>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-[100dvh] bg-page-surface font-body">
      <ShowcaseHeader active="showcase" />
      <TrackCaseStudyView category={category.slug} protocol={protocol} />
      <PublishedNotebook
        slug={caseStudy.slug}
        header={
          <>
            {hero}
            {!claimed && claimPrompt}
          </>
        }
        footer={closing}
      />
    </div>
  );
}
