// Small pieces the category and case-study pages share. All of them render
// on the server; anything that needs a click handler lives in its own file.
import Link from "next/link";

import { Breadcrumb } from "@/components/Breadcrumb";
import { Tag } from "@/components/Tag";
import {
  caseStudyHref,
  categoryHref,
  notebookHref,
  projectHref,
} from "@/lib/showcase";
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
              : "border-border-secondary dark:border-border-tertiary bg-base-100"
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
      className="group flex flex-col h-full rounded-xl p-4 bg-base-100 border border-border-secondary dark:border-border-tertiary hover:border-primary transition-colors"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <Tag>Case study</Tag>
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
      className="group flex items-center justify-between gap-4 h-full rounded-xl px-4 py-3.5 bg-base-100 border border-border-secondary dark:border-border-tertiary hover:border-primary transition-colors"
    >
      <span className="min-w-0">
        <span className="block truncate text-[15px] font-semibold text-ink-100 dark:text-white group-hover:text-primary dark:group-hover:text-primary-tint-75">
          {project.name}
        </span>
        <span className="mt-0.5 block text-xs text-ink-400">
          {count} {count === 1 ? "notebook" : "notebooks"}
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
  case_study: "Case study",
  working: "Notebook",
  category: "Leaderboard",
};

// One notebook, opened as a notebook.
export function NotebookCard({ notebook }: { notebook: ShowcaseNotebook }) {
  return (
    <Link
      href={notebookHref(notebook.slug)}
      className="group flex flex-col h-full rounded-xl p-4 bg-base-100 border border-border-secondary dark:border-border-tertiary hover:border-primary transition-colors"
    >
      <span className="font-body-mono text-[10px] uppercase tracking-[0.16em] text-ink-300">
        {KIND_LABEL[notebook.showcase.kind]}
      </span>
      <span className="mt-2 text-[15px] font-semibold leading-5 text-ink-100 dark:text-white group-hover:text-primary dark:group-hover:text-primary-tint-75">
        {notebook.title}
      </span>
      {notebook.description && (
        <span className="mt-1.5 text-[13px] leading-5 text-ink-400 line-clamp-2">
          {notebook.description}
        </span>
      )}
    </Link>
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
