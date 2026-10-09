// Small pieces the category and case-study pages share. All of them render
// on the server; anything that needs a click handler lives in its own file.
import Link from "next/link";

import { Breadcrumb } from "@/components/Breadcrumb";
import { Tag } from "@/components/Tag";
import { caseStudyHref, categoryHref } from "@/lib/showcase";
import { cn } from "@/lib/utils";
import type {
  ShowcaseHeroStat,
  ShowcaseNotebook,
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
