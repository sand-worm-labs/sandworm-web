import { Search } from "lucide-react";

export function HeaderSearch() {
  return (
    <div className="relative w-[25rem]">
      <Search
        size={16}
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
      />
      <button
        type="button"
        aria-disabled="true"
        className="flex h-8 w-full items-center rounded-lg border border-transparent bg-base-600 py-1 pl-10 pr-16 text-left text-xs text-ink-300 transition focus:outline-none focus:ring focus:ring-primary md:text-sm dark:border-border-tertiary dark:bg-search-bg dark:text-search-ink dark:[box-shadow:var(--search-shadow)]"
      >
        Search Sandworm
      </button>
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 select-none text-xs font-medium">
        <kbd className="inline-flex min-w-[1.25rem] items-center justify-center rounded border border-border-secondary bg-inputBg px-1 py-0.5 font-body-mono text-[11px] leading-none text-ink-400 dark:border-border-tertiary dark:bg-search-kbd dark:text-search-ink">
          /
        </kbd>
      </div>
    </div>
  );
}
