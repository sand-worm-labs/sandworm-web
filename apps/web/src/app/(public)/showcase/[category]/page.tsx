import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ChainBadge } from "@/components/Showcase/ChainIcon";
import {
  fetchShowcaseCommunity,
  fetchShowcaseConfig,
  fetchShowcaseNotebooks,
} from "@/components/Showcase/fetchShowcase";
import { PublishedDashboard } from "@/components/Showcase/PublishedDashboard";
import { NotebookPlaceholder } from "@/components/Showcase/NotebookPlaceholder";
import { PublishedNotebook } from "@/components/Showcase/PublishedNotebook";
import {
  heroBreadcrumbClass,
  heroClass,
  lineBackdrop,
} from "@/components/Showcase/BoardKit";
import { ShowcaseHeader } from "@/components/Showcase/ShowcaseHeader";
import { ShowcaseLeadButton } from "@/components/Showcase/ShowcaseLeadButton";
import {
  CommunityCard,
  EmptyPanel,
  PageSection,
  ProtocolCard,
  ReportCard,
  SectionNav,
} from "@/components/Showcase/ShowcaseChain";
import {
  ShowcaseBreadcrumb,
  ShowcaseStats,
  StartAnalyzingLink,
} from "@/components/Showcase/ShowcaseParts";
import { OpenNotebookLink } from "@/components/Showcase/ShowcaseTracked";
import { fetchProtocolStats } from "@/lib/protocolStats";
import {
  findCategory,
  groupLabel,
  notebookHref,
  ofKind,
  projectsOf,
  slugify,
} from "@/lib/showcase";

// =====================================
// ⬢  Types
// =====================================
type Props = { params: Promise<{ category: string }> };

// How many protocols get live numbers on a page: each one is a call to DefiLlama.
const MAX_PROTOCOL_CARDS = 6;

// Where to read more about a chain, for the chains we have checked the links of.
const CHAIN_RESOURCES: Record<string, { label: string; href: string }[]> = {
  Monad: [
    { label: "Website", href: "https://www.monad.xyz" },
    { label: "Docs", href: "https://docs.monad.xyz" },
    { label: "Block explorer", href: "https://monadscan.com" },
    { label: "X", href: "https://x.com/monad" },
    { label: "DefiLlama", href: "https://defillama.com/chain/Monad" },
  ],
};

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
// Page 2, a category (a chain, a sector). Its notebook is the category's dashboard when it
// has one, or is rendered in published mode when it does not. Around it the page lists the
// reports written about the category, the protocols in it, what the community has built,
// and the way on.
export default async function ShowcaseCategoryPage({ params }: Props) {
  const { taxonomy, chains: chainColors } = await fetchShowcaseConfig();
  const category = findCategory((await params).category, taxonomy);
  if (!category) notFound();

  const [notebooks, community] = await Promise.all([
    fetchShowcaseNotebooks(category.slug),
    fetchShowcaseCommunity(category.slug, 9),
  ]);
  const categoryNotebook = ofKind(notebooks, "category")[0];
  const reports = ofKind(notebooks, "report");
  const projects = projectsOf(notebooks);

  const isChain = category.group === "chains";
  const chain = category.chains?.[0] ?? category.name;
  const showDashboard = !!categoryNotebook?.hasDashboard;

  // Every protocol the category lists or has a notebook on, listed ones first.
  const protocolNames = Array.from(
    new Set([...(category.protocols ?? []), ...projects.map(p => p.name)])
  ).slice(0, MAX_PROTOCOL_CARDS);
  const protocols = await Promise.all(
    protocolNames.map(async name => ({
      name,
      project: projects.find(p => p.slug === slugify(name)),
      stats: await fetchProtocolStats(slugify(name), chain),
    }))
  );

  const resources = CHAIN_RESOURCES[chain] ?? [];
  const sections = [
    ...(showDashboard ? [{ id: "dashboard", label: "Dashboard" }] : []),
    { id: "reports", label: "Reports" },
    ...(protocols.length > 0 ? [{ id: "protocols", label: "Protocols" }] : []),
    { id: "community", label: "Community" },
    ...(resources.length > 0 ? [{ id: "resources", label: "Resources" }] : []),
  ];

  const header = (
    <section className={heroClass} style={lineBackdrop}>
      <div className="container mx-auto px-4 sm:px-8 py-10">
        <ShowcaseBreadcrumb
          category={category}
          group={groupLabel(category.group, taxonomy)}
          className={heroBreadcrumbClass}
        />

        <div className="mt-6 flex items-center gap-4">
          {isChain && (
            <ChainBadge
              chain={chain}
              colors={chainColors}
              size={64}
              className="hidden sm:block"
            />
          )}
          <div className="min-w-0">
            <h1 className="text-3xl sm:text-5xl font-semibold leading-[1.05] tracking-[-0.02em]">
              {category.name}
            </h1>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70">
          {category.question}
        </p>

        {categoryNotebook ? (
          <>
            <div className="mt-6">
              <ShowcaseStats stats={categoryNotebook.showcase.heroStats} dark />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {showDashboard && (
                <Link
                  href={`${notebookHref(categoryNotebook.slug)}/dashboard`}
                  className="h-9 inline-flex items-center rounded-lg px-4 text-sm font-medium font-body bg-primary text-white hover:bg-primary-710 transition-colors"
                >
                  Open the dashboard
                </Link>
              )}
              <OpenNotebookLink
                slug={categoryNotebook.slug}
                category={category.slug}
                className={
                  showDashboard
                    ? "border border-white/25 text-white hover:bg-white/10"
                    : "bg-primary text-white hover:bg-primary-710"
                }
              >
                Open in notebook
              </OpenNotebookLink>
              {categoryNotebook.showcase.dataAsOf && (
                <span className="font-body-mono text-[11px] uppercase tracking-[0.12em] text-white/50">
                  Data as of {categoryNotebook.showcase.dataAsOf}
                </span>
              )}
            </div>
          </>
        ) : (
          <p className="mt-6 text-sm text-white/70">
            The dashboard for this category is not published yet.
          </p>
        )}
      </div>
    </section>
  );

  const around = (
    <>
      <PageSection
        id="reports"
        title="Reports"
        description={`Written analysis of ${category.name}, from the Sandworm team.`}
      >
        {reports.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {reports.map(report => (
              <li key={report.slug}>
                <ReportCard notebook={report} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyPanel
            title={`No ${category.name} reports yet`}
            action={
              <ShowcaseLeadButton
                variant="outline"
                target={{ kind: "report", category: category.slug }}
              >
                Request a report
              </ShowcaseLeadButton>
            }
          >
            Reports go deeper than the dashboard on one question about{" "}
            {category.name}. Tell us which one you want answered first.
          </EmptyPanel>
        )}
      </PageSection>

      {protocols.length > 0 && (
        <PageSection
          id="protocols"
          title="Protocols"
          description={`Protocols on ${chain} we cover or plan to cover.`}
        >
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {protocols.map(protocol => (
              <li key={protocol.name}>
                <ProtocolCard
                  name={protocol.name}
                  categorySlug={category.slug}
                  chain={chain}
                  project={protocol.project}
                  stats={protocol.stats}
                />
              </li>
            ))}
          </ul>
        </PageSection>
      )}

      <PageSection
        id="community"
        title="From the community"
        description={`Notebooks and dashboards people have published about ${category.name}, most forked first. Unverified: fork one and check it for yourself.`}
        action={
          <Link
            href="/explore"
            className="text-[13px] font-medium text-primary dark:text-primary-tint-75 hover:underline"
          >
            Browse all community work →
          </Link>
        }
      >
        {community.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {community.map(item => (
              <li key={item.id}>
                <CommunityCard item={item} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyPanel
            title={`Nobody has published about ${category.name} yet`}
            action={<StartAnalyzingLink variant="primary" />}
          >
            Publish a notebook tagged “{category.name}” and it shows up here.
          </EmptyPanel>
        )}
      </PageSection>

      {resources.length > 0 && (
        <PageSection id="resources" title={`${chain} resources`}>
          <ul className="flex flex-wrap gap-2">
            {resources.map(resource => (
              <li key={resource.href}>
                <a
                  href={resource.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 inline-flex items-center rounded-full border border-border-secondary dark:border-pill-border bg-base-100 dark:bg-pill-bg px-3 text-[13px] text-ink-400 hover:border-ink-300 hover:text-ink-100 dark:hover:text-white transition-colors"
                >
                  {resource.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </PageSection>
      )}

      <section className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-base-100 dark:bg-block-surface border border-border-secondary dark:border-border-tertiary p-5">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink-100 dark:text-white">
            Missing a protocol, or a question?
          </p>
          <p className="mt-0.5 text-[13px] text-ink-400">
            Ask for coverage of a {category.name} protocol, or fork the
            dashboard and answer it yourself.
          </p>
        </div>
        <ShowcaseLeadButton
          variant="primary"
          target={{ kind: "coverage", category: category.slug }}
        >
          Request coverage
        </ShowcaseLeadButton>
      </section>
    </>
  );

  const closing = (
    <div className="container mx-auto px-4 sm:px-8 pb-16">{around}</div>
  );

  return (
    <div className="flex flex-col h-[100dvh] bg-page-surface font-body">
      <ShowcaseHeader active="showcase" />
      {categoryNotebook && !showDashboard ? (
        <PublishedNotebook
          slug={categoryNotebook.slug}
          header={
            <>
              {header}
              <SectionNav sections={sections} />
            </>
          }
          footer={closing}
          empty={
            <NotebookPlaceholder
              status="Coming soon"
              title={category.name}
              description={category.question}
              cards={[
                {
                  label: "The ranking",
                  detail: `${category.name} protocols, ranked on one measure.`,
                },
                {
                  label: "Over time",
                  detail: "How the ranking moved over the last year.",
                },
                {
                  label: "What changed",
                  detail: "The protocols that moved most, and why.",
                },
              ]}
            />
          }
        />
      ) : (
        <main className="flex-1 min-w-0 overflow-y-auto scroll-smooth">
          {header}
          <SectionNav sections={sections} />
          <div className="container mx-auto px-4 sm:px-8 pb-16">
            {categoryNotebook && (
              <PageSection
                id="dashboard"
                title={`${category.name} dashboard`}
                description="Charts update each time the notebook runs. Open the notebook to see the code behind every one."
                action={
                  <Link
                    href={`${notebookHref(categoryNotebook.slug)}/dashboard`}
                    className="text-[13px] font-medium text-primary dark:text-primary-tint-75 hover:underline"
                  >
                    Open full screen →
                  </Link>
                }
              >
                <PublishedDashboard slug={categoryNotebook.slug} />
              </PageSection>
            )}
            {around}
          </div>
        </main>
      )}
    </div>
  );
}
