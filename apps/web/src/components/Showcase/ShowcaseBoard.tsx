// The Showcase index as an airport departures board: one row per category,
// grouped the way a board groups by terminal, with the status where a flight
// would show "On time".
import Link from "next/link";

import {
  categoryHref,
  groupLabel,
  SHOWCASE_STATUS_LABEL,
} from "@/lib/showcase";
import { cn } from "@/lib/utils";
import type {
  ShowcaseCategoryCard,
  ShowcaseCategoryStatus,
  ShowcaseTaxonomy,
} from "@/types";

import { ChainStack } from "./ChainIcon";
import {
  boardClass,
  boardHeadClass,
  boardLabelClass,
  boardRowClass,
  BoardStyles,
  Flap,
} from "./BoardKit";

// =====================================
// ⬢  Constants
// =====================================
const MAX_PROTOCOLS = 4;

// Category, question, covering, chains and place, studies, status.
const ROW_GRID =
  "md:grid md:grid-cols-[minmax(9rem,1fr)_minmax(0,2.3fr)_minmax(0,1.4fr)_8.5rem_3.5rem_6.5rem] md:items-center md:gap-x-6";

const LAMP_CLASS: Record<ShowcaseCategoryStatus, string> = {
  live: "bg-emerald-500 shadow-[0_0_8px] shadow-emerald-500/70",
  building: "bg-amber-500 shadow-[0_0_8px] shadow-amber-500/70",
  request: "bg-ink-300",
};

const STATUS_TEXT_CLASS: Record<ShowcaseCategoryStatus, string> = {
  live: "text-emerald-600 dark:text-emerald-400",
  building: "text-amber-600 dark:text-amber-400",
  request: "text-ink-400",
};

// =====================================
// ⬢  Status
// =====================================
export function BoardStatus({ status }: { status: ShowcaseCategoryStatus }) {
  return (
    <span
      className={cn(
        "font-body-mono inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em]",
        STATUS_TEXT_CLASS[status]
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", LAMP_CLASS[status])} />
      {SHOWCASE_STATUS_LABEL[status]}
    </span>
  );
}

// =====================================
// ⬢  Row
// =====================================
function RowCells({
  card,
  index,
}: {
  card: ShowcaseCategoryCard;
  index: number;
}) {
  const shown = card.protocols.slice(0, MAX_PROTOCOLS);
  const extra = card.protocols.length - shown.length;

  return (
    <>
      <span className="flex items-center justify-between gap-3 md:block">
        <span className="font-body text-[15px] font-bold text-ink-100 dark:text-white group-hover:text-primary dark:group-hover:text-primary-tint-75 transition-colors">
          {card.name}
        </span>
        <span className="md:hidden shrink-0">
          <BoardStatus status={card.status} />
        </span>
      </span>

      <span className="mt-1 md:mt-0 block font-body text-[13px] leading-5 text-ink-400">
        {card.question}
      </span>

      <span className="mt-1.5 md:mt-0 block truncate font-body text-xs text-ink-400">
        {shown.join(", ")}
        {extra > 0 && ` +${extra}`}
      </span>

      <span className="mt-2 md:mt-0 flex items-center gap-2 min-w-0">
        <ChainStack chains={card.chains} />
        {card.countries.length > 0 && (
          <span className="truncate text-[10px] uppercase tracking-[0.12em] text-ink-300">
            {card.countries.join(" · ")}
          </span>
        )}
      </span>

      <span className="hidden md:block text-[13px]">
        {card.caseStudyCount > 0 && (
          <Flap
            text={String(card.caseStudyCount).padStart(2, "0")}
            delay={Math.min(index, 24) * 28}
          />
        )}
      </span>

      <span className="hidden md:flex items-center justify-between gap-2">
        <BoardStatus status={card.status} />
        <span
          aria-hidden="true"
          className="text-primary dark:text-primary-tint-75 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
        >
          →
        </span>
      </span>
    </>
  );
}

// A category with a page is a link to it. One that is only in the taxonomy
// opens the request-coverage form instead.
function Row({
  card,
  index,
  onRequest,
}: {
  card: ShowcaseCategoryCard;
  index: number;
  onRequest: (requested: ShowcaseCategoryCard) => void;
}) {
  const className = cn(
    "board-row block w-full text-left px-4 sm:px-5 py-3.5 md:py-2.5 outline-none focus-visible:bg-inputBg dark:focus-visible:bg-header-surface",
    boardRowClass,
    ROW_GRID
  );
  const style = { animationDelay: `${Math.min(index, 24) * 28}ms` };

  if (card.status === "request") {
    return (
      <button
        type="button"
        onClick={() => onRequest(card)}
        className={className}
        style={style}
      >
        <RowCells card={card} index={index} />
      </button>
    );
  }

  return (
    <Link href={categoryHref(card.slug)} className={className} style={style}>
      <RowCells card={card} index={index} />
    </Link>
  );
}

// =====================================
// ⬢  ShowcaseBoard
// =====================================
export function ShowcaseBoard({
  cards,
  taxonomy,
  onRequest,
}: {
  cards: ShowcaseCategoryCard[];
  taxonomy: ShowcaseTaxonomy;
  onRequest: (requested: ShowcaseCategoryCard) => void;
}) {
  return (
    <div className={cn("font-body-mono", boardClass)}>
      <BoardStyles />

      <div className={cn("hidden px-5 py-2.5", boardHeadClass, ROW_GRID)}>
        <span>Category</span>
        <span>The question</span>
        <span>Covering</span>
        <span>Chains</span>
        <span>Studies</span>
        <span>Status</span>
      </div>

      {cards.length === 0 ? (
        <p className="px-5 py-16 text-center font-body text-[13px] text-ink-400">
          Nothing on the board matches. Clear the filters, or ask for what you
          were looking for.
        </p>
      ) : (
        <ul>
          {cards.map((card, index) => {
            const opensGroup = cards[index - 1]?.group !== card.group;
            return (
              <li key={card.slug}>
                {opensGroup && (
                  <p
                    className={cn(
                      "px-4 sm:px-5 py-1.5 bg-page-surface border-b border-border-secondary dark:border-border-tertiary",
                      boardLabelClass
                    )}
                  >
                    {groupLabel(card.group, taxonomy)}
                  </p>
                )}
                <Row card={card} index={index} onRequest={onRequest} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
