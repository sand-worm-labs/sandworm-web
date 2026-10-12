// A protocol's page when no case study has been written about it yet: what DefiLlama
// publishes on it, drawn the way the Showcase draws things, with the way to ask for coverage.
// Nothing here is Sandworm's own analysis, and the page says so.
import Link from "next/link";

import { ShowcaseHeader } from "@/components/Showcase/ShowcaseHeader";
import { ShowcaseLeadButton } from "@/components/Showcase/ShowcaseLeadButton";
import { eyebrowClass, gridBackdrop } from "@/components/Showcase/BoardKit";
import { PageSection } from "@/components/Showcase/ShowcaseChain";
import { SeriesChart } from "@/components/Showcase/SeriesChart";
import {
  ShowcaseBreadcrumb,
  StartAnalyzingLink,
} from "@/components/Showcase/ShowcaseParts";
import { Tag } from "@/components/Tag";
import {
  formatUsd,
  type ProtocolProfile as Profile,
} from "@/lib/protocolStats";
import { categoryHref } from "@/lib/showcase";
import type { ShowcaseTaxonomyEntry } from "@/types";

// =====================================
// ⬢  Constants
// =====================================
const DAY = 86_400;
const FEES_DAYS = 90;

// =====================================
// ⬢  Utils
// =====================================
const longDate = (seconds: number) =>
  new Date(seconds * 1000).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

// The value `days` before the last point of a series, or null if the series is not that long.
function before(points: [number, number][], days: number): number | null {
  const last = points[points.length - 1];
  if (!last) return null;
  const target = last[0] - days * DAY;
  const found = [...points].reverse().find(p => p[0] <= target);
  return found ? found[1] : null;
}

function Stat({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="rounded-xl border border-border-secondary dark:border-border-tertiary bg-base-100 dark:bg-dropdown-bg p-4">
      <dt className="text-[12px] text-ink-400">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold tracking-[-0.01em] text-ink-100 dark:text-white">
        {value}
      </dd>
      {note && <p className="mt-0.5 text-[11px] text-ink-300">{note}</p>}
    </div>
  );
}

function ChartCard({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="rounded-xl border border-border-secondary dark:border-border-tertiary bg-base-100 dark:bg-dropdown-bg p-4">
      <figcaption className="text-sm font-semibold text-ink-100 dark:text-white">
        {title}
      </figcaption>
      <div className="mt-3">{children}</div>
      <p className="mt-2 text-[11px] text-ink-300">{note}</p>
    </figure>
  );
}

// =====================================
// ⬢  ProtocolProfile
// =====================================
export function ProtocolProfile({
  category,
  group,
  chain,
  name,
  profile,
}: {
  category: ShowcaseTaxonomyEntry;
  // The label of the category's group.
  group: string;
  // The chain its value is measured on.
  chain: string;
  // The protocol as the taxonomy names it.
  name: string;
  profile: Profile | null;
}) {
  const lastTvl = profile?.tvlHistory[profile.tvlHistory.length - 1];
  const tvlMonthAgo = profile ? before(profile.tvlHistory, 30) : null;
  const tvlChange =
    profile?.tvl != null && tvlMonthAgo
      ? (profile.tvl / tvlMonthAgo - 1) * 100
      : null;
  const peak = profile?.tvlHistory.reduce<[number, number] | null>(
    (best, point) => (best && best[1] >= point[1] ? best : point),
    null
  );
  const fees = profile?.feesHistory.slice(-FEES_DAYS) ?? [];

  return (
    <div className="flex flex-col h-[100dvh] bg-page-surface font-body">
      <ShowcaseHeader active="showcase" />
      <main className="flex-1 min-w-0 overflow-y-auto scroll-smooth">
        <section style={gridBackdrop}>
          <div className="container mx-auto px-4 sm:px-8 pt-8 pb-8">
            <ShowcaseBreadcrumb
              category={category}
              group={group}
              protocol={name}
            />

            <div className="mt-6 flex items-center gap-4">
              <span className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-2xl font-semibold text-primary dark:bg-pill-bg dark:text-white">
                {name.charAt(0).toUpperCase()}
                {profile?.logo && (
                  // The logo covers the initial; if it does not load, the initial shows.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.logo}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover text-transparent"
                  />
                )}
              </span>
              <div className="min-w-0">
                <p className={eyebrowClass}>Protocol on {chain}</p>
                <h1 className="mt-1 text-3xl sm:text-5xl font-semibold leading-[1.05] tracking-[-0.02em] text-ink-100 dark:text-white">
                  {name}
                </h1>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              {profile?.category && <Tag>{profile.category}</Tag>}
              <Tag>{chain}</Tag>
              <Tag>Coverage planned</Tag>
            </div>

            {profile?.description && (
              <p className="mt-4 max-w-2xl text-sm leading-6 text-ink-400">
                {profile.description}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {profile?.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 inline-flex items-center rounded-lg px-4 text-sm font-medium font-body bg-primary text-white hover:bg-primary-710 transition-colors"
                >
                  Visit {name} ↗
                </a>
              )}
              <ShowcaseLeadButton
                variant="outline"
                target={{
                  kind: "coverage",
                  category: category.slug,
                  protocol: name,
                }}
              >
                Request coverage
              </ShowcaseLeadButton>
              <Link
                href={categoryHref(category.slug)}
                className="text-[13px] font-medium text-primary dark:text-primary-tint-75 hover:underline"
              >
                ← All of {category.name}
              </Link>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-8 pb-16">
          <p className="mt-6 rounded-xl border border-dashed border-border-secondary dark:border-border-tertiary p-4 text-[13px] leading-5 text-ink-400">
            <span className="font-semibold text-ink-100 dark:text-white">
              Sandworm has not published its own analysis of {name} yet.
            </span>{" "}
            The numbers below are DefiLlama&apos;s, drawn as they come. Ask for
            coverage and we will look at who uses it and how the money moves.
          </p>

          {profile ? (
            <>
              <PageSection id="numbers" title={`${name} in numbers`}>
                <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {profile.tvl !== null && (
                    <Stat
                      label={`TVL on ${chain}`}
                      value={formatUsd(profile.tvl)}
                      note={
                        tvlChange !== null
                          ? `${tvlChange >= 0 ? "+" : ""}${tvlChange.toFixed(0)}% in 30 days`
                          : undefined
                      }
                    />
                  )}
                  {peak && (
                    <Stat
                      label="Peak TVL"
                      value={formatUsd(peak[1])}
                      note={longDate(peak[0])}
                    />
                  )}
                  {profile.fees30d !== null && (
                    <Stat
                      label="Fees, 30 days"
                      value={formatUsd(profile.fees30d)}
                    />
                  )}
                  {profile.feesAllTime !== null && (
                    <Stat
                      label="Fees, all time"
                      value={formatUsd(profile.feesAllTime)}
                    />
                  )}
                </dl>
              </PageSection>

              <PageSection id="history" title="History">
                <div className="grid gap-3 lg:grid-cols-2">
                  <ChartCard
                    title={`Value locked on ${chain}`}
                    note={`Source: DefiLlama, daily TVL${lastTvl ? `, to ${longDate(lastTvl[0])}` : ""}`}
                  >
                    <SeriesChart
                      points={profile.tvlHistory}
                      variant="area"
                      format={formatUsd}
                      label={`${name} TVL on ${chain} over time`}
                    />
                  </ChartCard>
                  <ChartCard
                    title={`Daily fees, last ${FEES_DAYS} days`}
                    note="Source: DefiLlama, fees paid by traders per day"
                  >
                    <SeriesChart
                      points={fees}
                      variant="bars"
                      format={formatUsd}
                      label={`${name} fees per day`}
                    />
                  </ChartCard>
                </div>
                {profile.feesMethodology && (
                  <p className="mt-3 max-w-3xl text-[12px] leading-5 text-ink-400">
                    <span className="font-medium text-ink-100 dark:text-white">
                      What counts as fees:
                    </span>{" "}
                    {profile.feesMethodology}
                  </p>
                )}
              </PageSection>
            </>
          ) : (
            <p className="mt-10 text-sm text-ink-400">
              DefiLlama has no numbers on {name} we can show right now.
            </p>
          )}

          <section className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-base-100 dark:bg-dropdown-bg border border-border-secondary dark:border-border-tertiary p-5">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink-100 dark:text-white">
                Run {name}? Get this page for your protocol.
              </p>
              <p className="mt-0.5 text-[13px] text-ink-400">
                Open the same data in a notebook and answer your own questions.
              </p>
            </div>
            <StartAnalyzingLink />
          </section>
        </div>
      </main>
    </div>
  );
}
