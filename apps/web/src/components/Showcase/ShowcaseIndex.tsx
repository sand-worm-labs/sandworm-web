"use client";

import { useMemo, useState } from "react";

import { useShowcaseFilters } from "@/hooks/useShowcaseFilters";
import { buildCategoryCards, chainsPresent } from "@/lib/showcase";
import { cn } from "@/lib/utils";
import type {
  ShowcaseCategoryCard,
  ShowcaseConfig,
  ShowcaseGroupFilter,
  ShowcaseLeadTarget,
  ShowcaseNotebook,
  ShowcaseTaxonomy,
} from "@/types";

import { SectionHero } from "./BoardKit";
import { ChainColors, ChainIcon } from "./ChainIcon";
import { ShowcaseGrid } from "./ShowcaseGrid";
import { ShowcaseHeader } from "./ShowcaseHeader";
import { ShowcaseLeadModal } from "./ShowcaseLeadModal";
import { StartAnalyzingLink } from "./ShowcaseParts";

// =====================================
// ⬢  Class names
// =====================================
const pillClass = (active: boolean) =>
  cn(
    "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[13px] transition-colors",
    active
      ? "border-ink-100 bg-ink-100 text-white dark:border-white dark:bg-white dark:text-ink-100"
      : "border-border-secondary dark:border-border-tertiary bg-base-100 text-ink-400 hover:border-ink-300 hover:text-ink-100 dark:hover:text-white"
  );

// =====================================
// ⬢  Hero aside
// =====================================
// What is on the Showcase, in a line. Only what a visitor can open is
// counted apart: a count of what is not there yet is not worth a number.
function Summary({ cards }: { cards: ShowcaseCategoryCard[] }) {
  const studies = cards.reduce((sum, card) => sum + card.caseStudyCount, 0);
  const parts = [
    `${cards.length} categories`,
    studies > 0
      ? `${studies} on-chain ${studies === 1 ? "analysis" : "analyses"}`
      : null,
  ].filter(Boolean);

  return <p className="text-[13px] text-ink-400">{parts.join(" · ")}</p>;
}

// =====================================
// ⬢  Group pills
// =====================================
function GroupPills({
  taxonomy,
  active,
  counts,
  onChange,
}: {
  taxonomy: ShowcaseTaxonomy;
  active: ShowcaseGroupFilter;
  counts: Record<ShowcaseGroupFilter, number>;
  onChange: (group: ShowcaseGroupFilter) => void;
}) {
  // A group with nothing in it under the current filters is not listed.
  const groups: { id: ShowcaseGroupFilter; label: string }[] = [
    { id: "all", label: "All" },
    ...taxonomy.groups.filter(
      group => (counts[group.id] ?? 0) > 0 || group.id === active
    ),
  ];

  return (
    <div
      className="flex min-w-0 gap-1.5 overflow-x-auto no-scrollbar"
      aria-label="Filter by group"
    >
      {groups.map(group => (
        <button
          key={group.id}
          type="button"
          onClick={() => onChange(group.id)}
          aria-pressed={active === group.id}
          className={pillClass(active === group.id)}
        >
          {group.label}
          <span
            className={cn(
              "text-[11px]",
              active === group.id ? "opacity-70" : "text-ink-300"
            )}
          >
            {counts[group.id] ?? 0}
          </span>
        </button>
      ))}
    </div>
  );
}

// =====================================
// ⬢  Chain toggles
// =====================================
// A chain's badge is its button. Pressing the active one clears it.
function ChainToggles({
  chains,
  active,
  onChange,
}: {
  chains: string[];
  active: string | null;
  onChange: (chain: string | null) => void;
}) {
  if (chains.length === 0) return null;

  return (
    <div
      className="flex shrink-0 items-center gap-1"
      aria-label="Filter by chain"
    >
      {chains.map(chain => (
        <button
          key={chain}
          type="button"
          title={chain}
          aria-label={chain}
          aria-pressed={active === chain}
          onClick={() => onChange(active === chain ? null : chain)}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full border transition-all",
            active === chain
              ? "border-primary bg-primary/10"
              : "border-transparent hover:bg-inputBg dark:hover:bg-header-surface",
            active !== null && active !== chain && "opacity-40"
          )}
        >
          <ChainIcon chain={chain} size={18} />
        </button>
      ))}
    </div>
  );
}

// =====================================
// ⬢  ShowcaseIndex
// =====================================
// Page 1. Built from the taxonomy joined with notebook metadata: nothing on
// it is curated by hand.
export function ShowcaseIndex({
  config,
  notebooks,
  embedded = false,
}: {
  config: ShowcaseConfig;
  notebooks: ShowcaseNotebook[];
  // Inside a workspace: the app already has its own header and scrolling, so
  // the page brings neither, and the search moves next to the filters.
  embedded?: boolean;
}) {
  const { taxonomy } = config;

  // State
  const [leadTarget, setLeadTarget] = useState<ShowcaseLeadTarget | null>(null);

  // Derived
  // Only categories with something to open are shown. One that is in the
  // taxonomy but has no notebook yet stays off the page.
  const cards = useMemo(
    () =>
      buildCategoryCards(notebooks, taxonomy).filter(
        card => card.status !== "request"
      ),
    [notebooks, taxonomy]
  );
  const isEmpty = cards.length === 0;
  const chains = useMemo(
    () => chainsPresent(cards, taxonomy),
    [cards, taxonomy]
  );
  const { filters, visible, counts, setGroup, setChain, setSearch } =
    useShowcaseFilters(cards);

  // Handlers
  const onRequest = (card: ShowcaseCategoryCard) =>
    setLeadTarget({ kind: "coverage", category: card.slug });

  const page = (
    <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-8 pb-24">
      <SectionHero
        compact={embedded}
        eyebrow="Showcase"
        title="Teams that use Sandworm, and teams we care about."
        description="What the chain shows about each of them, with the notebook behind every number."
        aside={isEmpty ? undefined : <Summary cards={cards} />}
      />

      {isEmpty && <StartAnalyzingLink />}

      {!isEmpty && (
        <>
          <div className="sticky top-0 z-10 -mx-4 sm:-mx-8 px-4 sm:px-8 py-3 flex items-center justify-between gap-4 bg-page-surface/90 backdrop-blur border-b border-border-secondary dark:border-border-tertiary">
            <GroupPills
              taxonomy={taxonomy}
              active={filters.group}
              counts={counts}
              onChange={setGroup}
            />
            <div className="flex items-center gap-3 min-w-0">
              {embedded && (
                <input
                  type="search"
                  value={filters.search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search categories, protocols, chains"
                  aria-label="Search categories, protocols, chains"
                  className="hidden sm:block h-8 w-56 rounded-full px-3 text-[13px] bg-base-100 border border-border-secondary dark:border-border-tertiary text-ink-100 dark:text-white placeholder:text-ink-300 outline-none focus:border-primary"
                />
              )}
              <ChainToggles
                chains={chains}
                active={filters.chain}
                onChange={setChain}
              />
            </div>
          </div>

          <div className="mt-8">
            <ShowcaseGrid
              cards={visible}
              taxonomy={taxonomy}
              onRequest={onRequest}
            />
          </div>

          <p className="mt-12 text-[13px] text-ink-400">
            Don&apos;t see your protocol? <StartAnalyzingLink variant="text" />
          </p>
        </>
      )}
    </div>
  );

  const leadModal = (
    <ShowcaseLeadModal
      target={leadTarget}
      onClose={() => setLeadTarget(null)}
    />
  );

  if (embedded) {
    return (
      <ChainColors.Provider value={config.chains}>
        <div className="min-h-[88vh] bg-page-surface font-body">
          {page}
          {leadModal}
        </div>
      </ChainColors.Provider>
    );
  }

  return (
    <ChainColors.Provider value={config.chains}>
      <div className="flex flex-col h-[100dvh] bg-base-100 font-body">
        <ShowcaseHeader
          active="showcase"
          search={{ value: filters.search, onChange: setSearch }}
        />
        <main className="flex-1 min-w-0 overflow-y-auto bg-page-surface">
          {page}
        </main>
        {leadModal}
      </div>
    </ChainColors.Provider>
  );
}
