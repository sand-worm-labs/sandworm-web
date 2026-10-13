// Small pieces the category and case-study pages share. All of them render
// on the server; anything that needs a click handler lives in its own file.
import Link from "next/link";

import { Breadcrumb } from "@/components/Breadcrumb";
import { boardClass, listHeadClass } from "@/components/Showcase/BoardKit";
import { Tag } from "@/components/Tag";
import {
  caseStudyHref,
  categoryHref,
  notebookHref,
  projectHref,
} from "@/lib/showcase";
import { ProtocolLogo } from "@/components/Showcase/ProtocolLogo";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import type {
  ShowcaseHeroStat,
  ShowcaseNotebook,
  ShowcaseProject,
  ShowcaseTaxonomyEntry,
} from "@/types";

// =====================================
// ⬢  Breadcrumb
// =====================================
// Showcase / {Group} / {Category} / {Protocol}
export function ShowcaseBreadcrumb({
  category,
  group,
  protocol,
  className,
}: {
  category: ShowcaseTaxonomyEntry;
  // The label of the category's group.
  group: string;
  protocol?: string;
  className?: string;
}) {
  return (
    <Breadcrumb
      className={className}
      items={[
        { label: "Showcase", href: "/showcase" },
        { label: group },
        {
          label: category.name,
          href: protocol ? categoryHref(category.slug) : undefined,
        },
        ...(protocol ? [{ label: protocol }] : []),
      ]}
    />
  );
}

// =====================================
// ⬢  Stat tiles
// =====================================
export function ShowcaseStats({
  stats,
  dark = false,
}: {
  stats: ShowcaseHeroStat[];
  dark?: boolean;
}) {
  if (stats.length === 0) return null;

  return (
    <dl className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map(stat => (
        <div
          key={stat.label}
          className={cn(
            "rounded-xl p-4 border",
            dark
              ? "border-white/15 bg-white/5"
              : "border-border-secondary dark:border-border-tertiary bg-base-100 dark:bg-block-surface"
          )}
        >
          <dd
            className={cn(
              "text-2xl font-semibold",
              dark
                ? "font-body-mono text-white"
                : "font-body-mono text-ink-100 dark:text-white"
            )}
          >
            {stat.value}
          </dd>
          <dt
            className={cn(
              "mt-1 text-xs",
              dark
                ? "font-body-mono text-[10px] uppercase tracking-[0.16em] text-white/60"
                : "font-body-mono text-[10px] uppercase tracking-[0.16em] text-ink-300"
            )}
          >
            {stat.label}
          </dt>
        </div>
      ))}
    </dl>
  );
}

// =====================================
// ⬢  Case study card
// =====================================
export function CaseStudyCard({ notebook }: { notebook: ShowcaseNotebook }) {
  const { protocol, chains, heroStats } = notebook.showcase;
  const lead = heroStats[0];

  return (
    <Link
      href={caseStudyHref(notebook)}
      className="group flex flex-col h-full rounded-xl p-4 bg-base-100 dark:bg-block-surface border border-border-secondary dark:border-border-tertiary hover:border-primary transition-colors"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <Tag>On-chain analysis</Tag>
        {chains.map(chain => (
          <Tag key={chain}>{chain}</Tag>
        ))}
      </div>
      <p className="mt-3 text-xs text-ink-400">{protocol}</p>
      <h3 className="mt-1 text-base font-semibold text-ink-100 dark:text-white group-hover:text-primary">
        {notebook.title}
      </h3>
      {lead && (
        <p className="mt-auto pt-4 text-sm text-ink-400">
          <span className="text-lg font-semibold text-ink-100 dark:text-white">
            {lead.value}
          </span>{" "}
          {lead.label}
        </p>
      )}
    </Link>
  );
}

// =====================================
// ⬢  Section
// =====================================
export function ShowcaseSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-ink-100 dark:text-white">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

// =====================================
// ⬢  Project card
// =====================================
// A protocol in a category. It opens the project's page, where its notebooks
// are.
export function ProjectCard({
  project,
  category,
}: {
  project: ShowcaseProject;
  category: string;
}) {
  const count = project.notebooks.length;

  return (
    <Link
      href={projectHref(category, project.slug)}
      className="group flex items-center justify-between gap-4 h-full rounded-xl px-4 py-3.5 bg-base-100 dark:bg-block-surface border border-border-secondary dark:border-border-tertiary hover:border-primary transition-colors"
    >
      <span className="flex min-w-0 items-center gap-3">
        <ProtocolLogo
          name={project.name}
          className="h-9 w-9 rounded-lg bg-primary/10 text-sm text-primary dark:bg-pill-bg dark:text-white"
        />
        <span className="min-w-0">
          <span className="block truncate text-[15px] font-semibold text-ink-100 dark:text-white group-hover:text-primary dark:group-hover:text-primary-tint-75">
            {project.name}
          </span>
          <span className="mt-0.5 block text-xs text-ink-400">
            {count} {count === 1 ? "notebook" : "notebooks"}
          </span>
        </span>
      </span>
      <span
        aria-hidden="true"
        className="text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
      >
        →
      </span>
    </Link>
  );
}

// =====================================
// ⬢  Notebook card
// =====================================
const KIND_LABEL: Record<ShowcaseNotebook["showcase"]["kind"], string> = {
  case_study: "On-chain analysis",
  working: "Notebook",
  category: "Leaderboard",
  report: "Report",
};

// Notebooks as a list, laid out like the Explore page's: one row each, the title opening the
// notebook, the kind and the date beside it.
export function NotebookList({ notebooks }: { notebooks: ShowcaseNotebook[] }) {
  return (
    <div className={`overflow-x-auto ${boardClass}`}>
      <table className="block md:table w-full border-collapse">
        <thead className={`hidden md:table-header-group ${listHeadClass}`}>
          <tr>
            <th className="text-left px-4 py-2.5 font-normal">Notebook</th>
            <th className="text-left px-4 py-2.5 font-normal">Type</th>
            <th className="text-right px-4 py-2.5 font-normal">Published</th>
          </tr>
        </thead>
        <tbody className="block md:table-row-group">
          {notebooks.map(notebook => (
            <tr
              key={notebook.id}
              className="block md:table-row py-3 md:py-0 border-b border-border-secondary dark:border-border-tertiary last:border-b-0 hover:bg-inputBg dark:hover:bg-header-surface transition-colors shadow-[inset_2px_0_0_transparent] hover:shadow-[inset_2px_0_0_theme(colors.primary.DEFAULT)]"
            >
              <td className="block md:table-cell px-4 py-1.5 md:p-4 align-top">
                <Link
                  href={notebookHref(notebook.slug)}
                  className="text-sm font-medium text-ink-100 dark:text-white hover:underline break-words"
                >
                  {notebook.title}
                </Link>
                {notebook.description && (
                  <p className="mt-1 max-w-xl text-xs text-ink-300 line-clamp-2">
                    {notebook.description}
                  </p>
                )}
              </td>
              <td className="block md:table-cell px-4 py-1.5 md:p-4 align-top">
                <Tag>{KIND_LABEL[notebook.showcase.kind]}</Tag>
              </td>
              <td className="block md:table-cell px-4 py-1.5 md:p-4 align-top md:text-right text-xs text-ink-300 whitespace-nowrap">
                {formatDate(notebook.publishedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// =====================================
// ⬢  Start analyzing
// =====================================
const START_VARIANT = {
  primary: "bg-primary text-white hover:bg-primary-710",
  // For the dark project hero.
  ghost: "border border-white/25 text-white hover:bg-white/10",
  text: "h-auto px-0 text-primary dark:text-primary-tint-75 hover:underline",
};

// The way into the product from a Showcase page. We do not run analysis for
// protocols on request: they sign up and analyze their own.
export function StartAnalyzingLink({
  variant = "primary",
  className,
}: {
  variant?: keyof typeof START_VARIANT;
  className?: string;
}) {
  return (
    <Link
      href="/signup"
      className={cn(
        "h-9 inline-flex items-center rounded-lg px-4 text-sm font-medium font-body transition-colors",
        START_VARIANT[variant],
        className
      )}
    >
      Start analyzing your protocol
    </Link>
  );
}
