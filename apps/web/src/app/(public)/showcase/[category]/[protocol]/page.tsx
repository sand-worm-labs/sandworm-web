import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Tag } from "@/components/Tag";
import {
  fetchShowcaseConfig,
  fetchShowcaseNotebooks,
} from "@/components/Showcase/fetchShowcase";
import { ProtocolProfile } from "@/components/Showcase/ProtocolProfile";
import { PublishedNotebook } from "@/components/Showcase/PublishedNotebook";
import {
  heroBreadcrumbClass,
  heroClass,
  lineBackdrop,
} from "@/components/Showcase/BoardKit";
import { NotebookPlaceholder } from "@/components/Showcase/NotebookPlaceholder";
import { ProtocolLinks } from "@/components/Showcase/ProtocolLinks";
import { ProtocolLogo } from "@/components/Showcase/ProtocolLogo";
import { ShowcaseHeader } from "@/components/Showcase/ShowcaseHeader";
import {
  NotebookList,
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
import { fetchProtocolProfile } from "@/lib/protocolStats";

// =====================================
// ⬢  Types
// =====================================
type Props = { params: Promise<{ category: string; protocol: string }> };

// =====================================
// ⬢  Data
// =====================================
async function loadCaseStudy(params: Props["params"]) {
  const { category: categorySlug, protocol } = await params;
  const { taxonomy, protocolLinks = {} } = await fetchShowcaseConfig();
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
    protocolLinks,
  };
}

// A protocol the category lists but has no case study on yet: its page shows what DefiLlama
// publishes on it. A protocol the category does not list has no page.
async function loadListedProtocol(params: Props["params"]) {
  const { category: categorySlug, protocol } = await params;
  const { taxonomy, protocolLinks = {} } = await fetchShowcaseConfig();
  const category = findCategory(categorySlug, taxonomy);
  const name = category?.protocols?.find(n => slugify(n) === protocol);
  if (!category || !name) return null;

  const chain = category.chains?.[0] ?? category.name;
  return {
    category,
    group: groupLabel(category.group, taxonomy),
    name,
    chain,
    links: protocolLinks[protocol],
    profile: await fetchProtocolProfile(protocol, chain),
  };
}

// =====================================
// ⬢  Metadata
// =====================================
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const loaded = await loadCaseStudy(params);
  if (!loaded) {
    const listed = await loadListedProtocol(params);
    return listed
      ? {
          title: `${listed.name} on ${listed.chain} – Sandworm Showcase`,
          description:
            listed.profile?.description ??
            `${listed.name} on ${listed.chain}: value locked and fees.`,
        }
      : {};
  }
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
  if (!loaded) {
    const listed = await loadListedProtocol(params);
    if (!listed) notFound();
    return <ProtocolProfile {...listed} />;
  }

  const { category, group, caseStudy, notebooks, protocolLinks } = loaded;
  const { showcase } = caseStudy;
  const protocol = showcase.protocol ?? caseStudy.title;
  const projects = projectsOf(notebooks);
  const project = projects.find(p => p.slug === slugify(protocol));
  const moreNotebooks = (project?.notebooks ?? []).filter(
    n => n.id !== caseStudy.id
  );
  const otherProjects = projects.filter(p => p.slug !== project?.slug);
  const claimed = showcase.claimed === true;

  const hero = (
    <section className={heroClass} style={lineBackdrop}>
      <div className="container mx-auto px-4 sm:px-8 py-10">
        <ShowcaseBreadcrumb
          category={category}
          group={group}
          protocol={protocol}
          className={heroBreadcrumbClass}
        />

        <div className="mt-5 flex flex-wrap items-center gap-1.5">
          <Tag>On-chain analysis</Tag>
          {showcase.chains.map(chain => (
            <Tag key={chain}>{chain}</Tag>
          ))}
          {showcase.country && <Tag>{showcase.country}</Tag>}
        </div>

        <div className="mt-4 flex items-center gap-4">
          <ProtocolLogo
            name={protocol}
            className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-white/10 text-2xl text-white"
          />
          <h1 className="max-w-3xl text-3xl sm:text-5xl font-semibold leading-[1.05] tracking-[-0.02em]">
            {caseStudy.title}
          </h1>
        </div>
        {caseStudy.description && (
          <p className="mt-3 max-w-2xl text-sm text-white/70">
            {caseStudy.description}
          </p>
        )}
        <ProtocolLinks
          name={protocol}
          links={protocolLinks[slugify(protocol)]}
          className="mt-5"
        />

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <OpenNotebookLink
            slug={caseStudy.slug}
            category={category.slug}
            className="bg-white text-ink-navy dark:text-page-surface hover:bg-white/90"
          >
            Continue this research
          </OpenNotebookLink>
          <StartAnalyzingLink variant="ghost" />
        </div>

        <p className="mt-4 flex items-center gap-2 text-sm text-white/60">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" className="h-5 w-5 rounded-full" />
          <span>
            By Sandworm
            {showcase.dataAsOf ? ` · Data as of ${showcase.dataAsOf}` : ""}
          </span>
        </p>

        {showcase.heroStats.length > 0 && (
          <div className="mt-8">
            <ShowcaseStats stats={showcase.heroStats} dark />
          </div>
        )}
      </div>
    </section>
  );

  const closing = (
    <div className="container mx-auto px-4 sm:px-8 pb-16">
      <section className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-base-100 dark:bg-dropdown-bg border border-border-secondary dark:border-border-tertiary p-5">
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
          <NotebookList notebooks={moreNotebooks} />
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
        header={hero}
        footer={closing}
        empty={
          <NotebookPlaceholder
            status="In progress"
            title={`${protocol} on-chain analysis`}
            description={`This case study is still being written. Once it is published it answers one question about ${protocol} from the chain, with the numbers and the queries behind them.`}
            cards={[
              {
                label: "Activity",
                detail: `Who uses ${protocol}, and how often.`,
              },
              {
                label: "Value",
                detail: "What is locked or moved through it, over time.",
              },
              { label: "Revenue", detail: "What it earns, and who keeps it." },
            ]}
          />
        }
      />
    </div>
  );
}
