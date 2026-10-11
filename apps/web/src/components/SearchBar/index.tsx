"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  CornerDownLeft,
  Search,
} from "lucide-react";
import clsx from "clsx";

import type { SearchEntryType, SearchHit } from "@/lib/search/types";
import { searchClient, useSearch } from "@/lib/search/useSearch";

import { CATEGORIES } from "./searchData";

// =====================================
// ⬢ Constants
// =====================================
const CATEGORY = Object.fromEntries(CATEGORIES.map(c => [c.id, c])) as Record<
  SearchEntryType,
  (typeof CATEGORIES)[number]
>;

type Row = { category: SearchEntryType; item: SearchHit };

// A notebook and its dashboard share an id, so a row is told apart by its kind too.
const rowKey = (category: SearchEntryType, id: string) => `${category}:${id}`;

// The result icon as the search always drew it: the category's icon in a small bordered
// box, in the link colour.
function ResultIcon({ category }: { category: SearchEntryType }) {
  const Icon = CATEGORY[category].icon;
  return (
    <span className="border border-border-quiet p-1 rounded-md dark:border-border-tertiary">
      <Icon size={18} className="text-link" />
    </span>
  );
}

const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="inline-flex min-w-[1.25rem] items-center justify-center rounded border border-border-secondary dark:border-border-tertiary bg-inputBg dark:bg-header-surface px-1 py-0.5 text-[11px] leading-none text-ink-400 font-body-mono">
    {children}
  </kbd>
);

// =====================================
// ⬢ Search Bar
// =====================================
// The header's search: a field that opens a command palette in the middle of the screen.
// It lists protocols, chains and more from the search API; choosing a kind (a chip, or
// "View all") puts it in the field as a pill and narrows the list to it. Choosing a result
// goes to its page.
export const SearchBar = ({
  onSelect,
}: {
  // Called instead of going to the result's page, for a place that wants to handle it.
  onSelect?: (category: SearchEntryType, item: SearchHit) => void;
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<SearchEntryType | null>(null);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const [shortcut, setShortcut] = useState("Ctrl K");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (/Mac|iPhone|iPad/.test(navigator.platform)) setShortcut("⌘K");
  }, []);

  // Ctrl or Cmd + K opens it from anywhere.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(current => !current);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const reset = useCallback(() => {
    setCategory(null);
    setQuery("");
    setHighlight(0);
  }, []);
  const openPalette = () => {
    reset();
    setOpen(true);
  };
  const close = useCallback(() => setOpen(false), []);
  const chooseCategory = (next: SearchEntryType | null) => {
    setCategory(next);
    setQuery("");
    setHighlight(0);
  };

  // What is on screen: a few results of each kind, or one kind in full. The hook debounces
  // the typing, cancels answers nobody wants any more, and keeps the last answer up while
  // the next loads.
  const { groups, loading, failed, canLoadMore, loadMore } = useSearch({
    query,
    type: category,
    enabled: open,
  });
  const rows: Row[] = useMemo(
    () =>
      groups.flatMap(group =>
        group.items.map(item => ({ category: group.type, item }))
      ),
    [groups]
  );
  const indexOf = useMemo(
    () => new Map(rows.map((row, i) => [rowKey(row.category, row.item.id), i])),
    [rows]
  );
  const inCategory = category ? groups[0] : undefined;

  useEffect(() => setHighlight(0), [query, category]);
  // Clicking a chip, "View all" or the back arrow moves focus onto that button, which is
  // then gone: keep the cursor in the field so typing and Backspace carry on.
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [category, open]);
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-row="${highlight}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [highlight]);

  const choose = (row: Row) => {
    close();
    if (onSelect) onSelect(row.category, row.item);
    // Results are paths in this app; anything else is not followed.
    else if (row.item.url.startsWith("/")) router.push(row.item.url);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight(current => (rows.length ? (current + 1) % rows.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight(current =>
        rows.length ? (current - 1 + rows.length) % rows.length : 0
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const row = rows[Math.min(highlight, rows.length - 1)];
      if (row) choose(row);
    } else if (e.key === "Backspace" && !query && category) {
      // Backspace on an empty field takes the pill off, like the back arrow.
      chooseCategory(null);
    }
  };

  // Escape steps back out of a category first, then closes.
  const onDialogClose = () => {
    if (category) chooseCategory(null);
    else close();
  };

  const placeholder = category
    ? `Search ${CATEGORY[category].label.toLowerCase()}`
    : "Search protocols, chains, notebooks…";
  const PillIcon = category ? CATEGORY[category].icon : null;

  return (
    <>
      {/* The field in the header: opens the palette. */}
      <div className="relative w-[25rem]">
        <Search
          size={16}
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 dark:text-ink-400"
        />
        <button
          type="button"
          onClick={openPalette}
          // The first screen is the same for everyone: have it ready before the click.
          onMouseEnter={() => searchClient.prefetch({ q: "" })}
          onFocus={() => searchClient.prefetch({ q: "" })}
          aria-haspopup="dialog"
          className="flex h-8 w-full items-center rounded-lg border border-transparent dark:border-border-tertiary bg-base-600 dark:bg-base-400 py-1 pl-10 pr-16 text-left text-xs md:text-sm text-ink-300 transition focus:outline-none focus:ring focus:ring-primary"
        >
          Search Sandworm
        </button>
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 select-none text-xs font-medium text-text-gray">
          <Kbd>{shortcut}</Kbd>
        </div>
      </div>

      <Transition show={open}>
        <Dialog onClose={onDialogClose} className="relative z-[1000]">
          <TransitionChild
            enter="transition-opacity ease-out duration-100"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-in duration-75"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
          </TransitionChild>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <TransitionChild
              enter="transition ease-out duration-100"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              {/* A fixed height, so the palette does not jump as the list changes. */}
              <DialogPanel className="flex h-[min(620px,82vh)] w-full max-w-[720px] flex-col overflow-hidden rounded-2xl border border-border-secondary dark:border-border-tertiary bg-base-100 dark:bg-search-modal-bg font-body shadow-xl">
                {/* Field: back arrow and category pill, then the text. */}
                <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border-secondary dark:border-border-tertiary px-5">
                  {category ? (
                    <button
                      type="button"
                      onClick={() => chooseCategory(null)}
                      aria-label="Back to all results"
                      className="shrink-0 rounded-md p-1 text-primary hover:bg-inputBg dark:hover:bg-header-surface"
                    >
                      <ArrowLeft size={18} />
                    </button>
                  ) : (
                    <Search
                      size={16}
                      className="h-4 w-4 shrink-0 text-ink-400 dark:text-ink-400"
                    />
                  )}
                  {category && PillIcon && (
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border-secondary dark:border-border-tertiary bg-inputBg dark:bg-header-surface px-2.5 py-1 text-sm text-ink-100 dark:text-white">
                      <PillIcon size={14} className="text-ink-400" />
                      {CATEGORY[category].label}
                    </span>
                  )}
                  <input
                    ref={inputRef}
                    data-autofocus
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder={placeholder}
                    aria-label="Search"
                    className="min-w-0 flex-1 bg-transparent text-sm text-ink-100 dark:text-white placeholder:text-ink-300 outline-none"
                  />
                </div>

                {/* Categories, until one is chosen. */}
                {!category && (
                  <div className="flex shrink-0 gap-2 overflow-x-auto border-b border-border-secondary dark:border-border-tertiary px-5 py-3">
                    <span className="rounded-md bg-primary px-3 py-0.5 text-[0.75rem] font-medium text-white">
                      All
                    </span>
                    {CATEGORIES.map(c => (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => chooseCategory(c.id)}
                        className="shrink-0 rounded-md border border-border-secondary dark:border-border-tertiary px-3 py-0.5 text-[0.75rem] font-medium text-ink-100 dark:text-gray-300 transition-colors hover:bg-inputBg dark:hover:bg-header-surface"
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* A thin bar while a new answer loads: no layout change, no empty flash. */}
                <div
                  aria-hidden="true"
                  className={clsx(
                    "h-0.5 w-full shrink-0 transition-opacity",
                    loading
                      ? "animate-pulse bg-primary/60 opacity-100"
                      : "opacity-0"
                  )}
                />

                {/* Results */}
                <div
                  ref={listRef}
                  aria-busy={loading}
                  className="min-h-0 flex-1 overflow-y-auto py-2"
                >
                  {rows.length === 0 && failed && (
                    <p className="px-5 py-10 text-center text-sm text-ink-400">
                      Search is not available right now. Try again in a moment.
                    </p>
                  )}
                  {rows.length === 0 && !failed && loading && (
                    <p className="px-5 py-10 text-center text-sm text-ink-400">
                      Searching…
                    </p>
                  )}
                  {rows.length === 0 && !failed && !loading && (
                    <p className="px-5 py-10 text-center text-sm text-ink-400">
                      {query.trim()
                        ? `Nothing matches “${query.trim()}”.`
                        : "Nothing to show yet."}
                    </p>
                  )}
                  {groups.map(group => {
                    const meta = CATEGORY[group.type];
                    return (
                      <div key={group.type} className="pb-2">
                        {!category && (
                          <div className="flex items-center justify-between px-5 pb-1 pt-2">
                            <span className="text-[0.7rem] font-semibold uppercase tracking-wide text-ink-400">
                              {meta.label}
                            </span>
                            {group.total > group.items.length && (
                              <button
                                type="button"
                                onClick={() => chooseCategory(group.type)}
                                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                              >
                                View all
                                <ArrowRight size={12} />
                              </button>
                            )}
                          </div>
                        )}
                        {group.items.map(item => {
                          const index =
                            indexOf.get(rowKey(group.type, item.id)) ?? -1;
                          const active = index === highlight;
                          return (
                            <button
                              type="button"
                              key={rowKey(group.type, item.id)}
                              data-row={index}
                              onMouseEnter={() => setHighlight(index)}
                              onClick={() =>
                                choose({ category: group.type, item })
                              }
                              className={clsx(
                                "flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors",
                                active && "bg-inputBg dark:bg-header-surface"
                              )}
                            >
                              <ResultIcon category={group.type} />
                              <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink-100 dark:text-white">
                                {item.title}
                              </span>
                              <span
                                className={clsx(
                                  "shrink-0 text-ink-300",
                                  !active && "invisible"
                                )}
                              >
                                <CornerDownLeft size={14} />
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                  {canLoadMore && inCategory && (
                    <button
                      type="button"
                      onClick={loadMore}
                      className="mx-5 mb-2 mt-1 text-xs font-medium text-primary hover:underline"
                    >
                      Show more ({inCategory.total - inCategory.items.length}{" "}
                      left)
                    </button>
                  )}
                </div>

                {/* Keys */}
                <div className="flex shrink-0 items-center gap-5 border-t border-border-secondary dark:border-border-tertiary px-5 py-3 text-xs text-ink-400">
                  <span className="flex items-center gap-1.5">
                    <Kbd>esc</Kbd>
                    {category ? "back" : "close"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Kbd>
                      <ChevronUp size={12} />
                    </Kbd>
                    <Kbd>
                      <ChevronDown size={12} />
                    </Kbd>
                    navigate
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Kbd>
                      <CornerDownLeft size={12} />
                    </Kbd>
                    select
                  </span>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};
