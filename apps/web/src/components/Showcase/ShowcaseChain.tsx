// The sections of a category's page that sit around its dashboard: reports, protocols,
// what the community has built, and the way on. They render on the server; anything that
// needs a click handler lives in its own file.
import Link from "next/link";

import { ProtocolLogo } from "@/components/Showcase/ProtocolLogo";
import { Tag } from "@/components/Tag";
import { formatUsd, type ProtocolStats } from "@/lib/protocolStats";
import { notebookHref, projectHref, slugify } from "@/lib/showcase";
import { cn } from "@/lib/utils";
import type {
  ShowcaseCommunityItem,
  ShowcaseNotebook,
  ShowcaseProject,
} from "@/types";

// =====================================
// ⬢  Section
// =====================================
// A titled part of the page, with the anchor the section nav scrolls to.
export function PageSection({
  id,
  title,
  description,
  action,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-14 pt-12">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-[-0.01em] text-ink-100 dark:text-white">
            {title}
          </h2>
          {description && (
            <p className="mt-1 max-w-2xl text-sm leading-6 text-ink-400">
              {description}
            </p>
          )}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

// =====================================
// ⬢  Section nav
// =====================================

export function SectionNav({
  sections,
}: {
  sections: { id: string; label: string }[];
}) {
  return (
    <nav
      aria-label="On this page"
      className="sticky top-0 z-10 border-b border-border-secondary dark:border-border-tertiary bg-base-100 dark:bg-header-surface"
    >
      <ul className="container mx-auto px-4 sm:px-8 flex gap-1 overflow-x-auto py-2">
        {sections.map(section => (
          <li key={section.id} className="shrink-0">
            <a
              href={`#${section.id}`}
              className="h-7 inline-flex items-center rounded-lg px-2.5 text-[13px] text-ink-400 hover:text-ink-100 dark:hover:text-white hover:bg-base-600 dark:hover:bg-sidebar-active transition-colors"
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// =====================================
// ⬢  Card
// =====================================
const CARD_CLASS =
  "group flex flex-col h-full rounded-xl p-4 bg-base-100 dark:bg-block-surface border border-border-secondary dark:border-border-tertiary transition-colors";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

// =====================================
// ⬢  Reports
// =====================================
// A written analysis of the category, opened as a notebook.
export function ReportCard({ notebook }: { notebook: ShowcaseNotebook }) {
  return (
    <Link
      href={notebookHref(notebook.slug)}
      className={cn(CARD_CLASS, "hover:border-primary")}
    >
      <span className="font-body-mono text-[10px] uppercase tracking-[0.16em] text-ink-300">
        Report · {formatDate(notebook.publishedAt)}
      </span>
      <h3 className="mt-2 text-[15px] font-semibold leading-5 text-ink-100 dark:text-white group-hover:text-primary dark:group-hover:text-primary-tint-75">
        {notebook.title}
      </h3>
      {notebook.description && (
        <p className="mt-1.5 text-[13px] leading-5 text-ink-400 line-clamp-3">
          {notebook.description}
        </p>
      )}
      <span className="mt-auto pt-4 text-[13px] font-medium text-primary dark:text-primary-tint-75">
        Read the report →
      </span>
    </Link>
  );
}

// Shown when a category has no report yet: what it will hold, and the way to ask for one.
export function EmptyPanel({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-dashed border-border-secondary dark:border-border-tertiary p-5">
      <div className="min-w-0 max-w-xl">
        <p className="text-sm font-medium text-ink-100 dark:text-white">
          {title}
        </p>
        <p className="mt-1 text-[13px] leading-5 text-ink-400">{children}</p>
      </div>
      {action}
    </div>
  );
}

// =====================================
// ⬢  Protocols
// =====================================
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dd className="text-lg font-semibold leading-6 text-ink-100 dark:text-white">
        {value}
      </dd>
      <dt className="text-[11px] text-ink-400">{label}</dt>
    </div>
  );
}

// A protocol on the chain. It opens the protocol's page: the case study when there is one,
// and otherwise a profile of what DefiLlama publishes on it. The numbers on the card come
// from DefiLlama.
export function ProtocolCard({
  name,
  categorySlug,
  chain,
  project,
  stats,
}: {
  name: string;
  // The category the protocol is listed under, for the link to its page.
  categorySlug: string;
  // The chain its TVL is measured on.
  chain: string;
  project?: ShowcaseProject;
  stats: ProtocolStats | null;
}) {
  const body = (
    <>
      <div className="flex items-start gap-3">
        <ProtocolLogo
          name={name}
          className="h-10 w-10 rounded-lg bg-primary/10 text-base text-primary dark:bg-pill-bg dark:text-white"
        />
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold text-ink-100 dark:text-white group-hover:text-primary dark:group-hover:text-primary-tint-75">
            {name}
          </h3>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <Tag>{stats?.category ?? "Protocol"}</Tag>
            {!project && <Tag>Coverage planned</Tag>}
          </div>
        </div>
      </div>

      {stats?.description && (
        <p className="mt-3 text-[13px] leading-5 text-ink-400 line-clamp-2">
          {stats.description}
        </p>
      )}

      {stats && (stats.tvl !== null || stats.fees30d !== null) && (
        <dl className="mt-4 flex gap-6">
          {stats.tvl !== null && (
            <Stat label={`TVL on ${chain}`} value={formatUsd(stats.tvl)} />
          )}
          {stats.fees30d !== null && (
            <Stat label="Fees, 30 days" value={formatUsd(stats.fees30d)} />
          )}
        </dl>
      )}

      <p className="mt-auto flex items-center justify-between gap-3 pt-4 text-[11px] text-ink-300">
        <span>
          {stats ? "Numbers: DefiLlama" : "Numbers unavailable right now"}
        </span>
        <span className="text-[13px] font-medium text-primary dark:text-primary-tint-75">
          {project ? "Open analysis →" : "View profile →"}
        </span>
      </p>
    </>
  );

  return (
    <Link
      href={projectHref(categorySlug, project?.slug ?? slugify(name))}
      className={cn(CARD_CLASS, "hover:border-primary")}
    >
      {body}
    </Link>
  );
}

// =====================================
// ⬢  Community
// =====================================
export function CommunityCard({ item }: { item: ShowcaseCommunityItem }) {
  return (
    <div
      className={cn(
        CARD_CLASS,
        "relative hover:border-border-focus dark:hover:border-border-focus"
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <Tag>Notebook</Tag>
        {item.hasDashboard && <Tag>Dashboard</Tag>}
      </div>
      <h3 className="mt-3 text-[15px] font-semibold leading-5 text-ink-100 dark:text-white">
        <Link
          href={notebookHref(item.slug)}
          className="after:absolute after:inset-0 hover:text-primary dark:hover:text-primary-tint-75"
        >
          {item.title}
        </Link>
      </h3>
      {item.description && (
        <p className="mt-1.5 text-[13px] leading-5 text-ink-400 line-clamp-2">
          {item.description}
        </p>
      )}
      <div className="mt-auto flex items-center justify-between gap-3 pt-4 text-[12px] text-ink-400">
        <span className="min-w-0 truncate">
          {item.authorName ? `@${item.authorUsername ?? item.authorName}` : ""}
          {item.forks > 0 &&
            ` · ${item.forks} ${item.forks === 1 ? "fork" : "forks"}`}
        </span>
        {item.hasDashboard && (
          <Link
            href={`${notebookHref(item.slug)}/dashboard`}
            className="relative z-10 shrink-0 font-medium text-primary dark:text-primary-tint-75 hover:underline"
          >
            Open dashboard →
          </Link>
        )}
      </div>
    </div>
  );
}
