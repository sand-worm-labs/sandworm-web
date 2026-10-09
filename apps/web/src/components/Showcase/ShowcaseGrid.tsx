// The Showcase index as a gallery: one card per category, set out under its
// group. A card leads with the question the category answers, since that is
// what a visitor is choosing between.
import Link from "next/link";
import { PiArrowRight } from "react-icons/pi";

import { categoryHref, groupLabel } from "@/lib/showcase";
import { cn } from "@/lib/utils";
import type { ShowcaseCategoryCard, ShowcaseTaxonomy } from "@/types";

import { ChainStack } from "./ChainIcon";
import { BoardStatus } from "./ShowcaseBoard";

// =====================================
// ⬢  Constants
// =====================================
const MAX_PROTOCOLS = 3;

const CARD_CLASS =
  "group flex h-full w-full flex-col rounded-2xl border border-border-secondary dark:border-border-tertiary bg-base-100 p-5 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-[0_10px_30px_-18px_rgba(30,41,90,0.35)] outline-none focus-visible:border-primary";

// =====================================
// ⬢  Card
// =====================================
function CardBody({ card }: { card: ShowcaseCategoryCard }) {
  const shown = card.protocols.slice(0, MAX_PROTOCOLS);
  const extra = card.protocols.length - shown.length;
  const covered = card.status !== "request";

  return (
    <>
      <span className="flex items-start justify-between gap-3">
        <span className="text-[15px] font-semibold leading-5 text-ink-100 dark:text-white">
          {card.name}
        </span>
        {/* Only a category with something to open says so: most are not
            covered yet, and a wall of the same label says nothing. */}
        {covered && (
          <span className="shrink-0 pt-0.5">
            <BoardStatus status={card.status} />
          </span>
        )}
      </span>

      <span className="mt-2 block text-[13px] leading-5 text-ink-400 line-clamp-3">
        {card.question}
      </span>

      {shown.length > 0 && (
        <span className="mt-4 flex flex-wrap gap-1.5">
          {shown.map(protocol => (
            <span
              key={protocol}
              className="rounded-full bg-inputBg dark:bg-header-surface px-2 py-0.5 text-[11px] leading-4 text-ink-400"
            >
              {protocol}
            </span>
          ))}
          {extra > 0 && (
            <span className="px-1 py-0.5 text-[11px] leading-4 text-ink-300">
              +{extra}
            </span>
          )}
        </span>
      )}

      <span className="mt-auto flex items-center justify-between gap-3 pt-5">
        <span className="flex min-w-0 items-center gap-2">
          <ChainStack chains={card.chains} />
          {card.caseStudyCount > 0 && (
            <span className="truncate text-xs text-ink-400">
              {card.caseStudyCount}{" "}
              {card.caseStudyCount === 1 ? "case study" : "case studies"}
            </span>
          )}
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-ink-300 transition-colors group-hover:text-primary dark:group-hover:text-primary-tint-75">
          {covered ? "Open" : "Request"}
          <PiArrowRight
            size={12}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </span>
      </span>
    </>
  );
}

// A category with a page is a link to it. One that is only in the taxonomy
// opens the request-coverage form instead.
function Card({
  card,
  onRequest,
}: {
  card: ShowcaseCategoryCard;
  onRequest: (requested: ShowcaseCategoryCard) => void;
}) {
  if (card.status === "request") {
    return (
      <button
        type="button"
        onClick={() => onRequest(card)}
        className={CARD_CLASS}
      >
        <CardBody card={card} />
      </button>
    );
  }

  return (
    <Link href={categoryHref(card.slug)} className={CARD_CLASS}>
      <CardBody card={card} />
    </Link>
  );
}

// =====================================
// ⬢  ShowcaseGrid
// =====================================
export function ShowcaseGrid({
  cards,
  taxonomy,
  onRequest,
}: {
  cards: ShowcaseCategoryCard[];
  taxonomy: ShowcaseTaxonomy;
  onRequest: (requested: ShowcaseCategoryCard) => void;
}) {
  if (cards.length === 0) {
    return (
      <p className="py-20 text-center text-[13px] text-ink-400">
        Nothing matches. Clear the filters, or ask for what you were looking
        for.
      </p>
    );
  }

  // Cards arrive in taxonomy order, so each group's cards are already together.
  const groups = cards.reduce<{ id: string; cards: ShowcaseCategoryCard[] }[]>(
    (sections, card) => {
      const last = sections[sections.length - 1];
      if (last?.id === card.group) last.cards.push(card);
      else sections.push({ id: card.group, cards: [card] });
      return sections;
    },
    []
  );

  return (
    <div className="flex flex-col gap-10">
      {groups.map(group => (
        <section key={group.id} aria-label={groupLabel(group.id, taxonomy)}>
          <h2 className="flex items-baseline gap-2 text-sm font-semibold text-ink-100 dark:text-white">
            {groupLabel(group.id, taxonomy)}
            <span className="text-xs font-normal text-ink-300">
              {group.cards.length}
            </span>
          </h2>
          <ul
            className={cn(
              "mt-3 grid gap-3 sm:gap-4",
              "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            )}
          >
            {group.cards.map(card => (
              <li key={card.slug}>
                <Card card={card} onRequest={onRequest} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
