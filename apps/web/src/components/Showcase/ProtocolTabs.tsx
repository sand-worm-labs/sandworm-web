"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

import { cn } from "@/lib/utils";
import { notebookHref, slugify } from "@/lib/showcase";
import type { ShowcaseTab } from "@/types";

import { PublishedDashboard } from "./PublishedDashboard";

// =====================================
// ⬢  Helpers
// =====================================
// Each tab's place in the address: its label as a slug, with a number added when two labels slug
// alike, and its position when a label slugs to nothing.
function tabKeys(tabs: ShowcaseTab[]): string[] {
  const seen = new Map<string, number>();
  return tabs.map((tab, index) => {
    const base = slugify(tab.label) || `tab-${index + 1}`;
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    return count === 1 ? base : `${base}-${count}`;
  });
}

// =====================================
// ⬢  ProtocolTabs
// =====================================
// The tabs of a protocol's page. They come from the case study's metadata, so adding, renaming or
// reordering one is an edit in the Studio, not in code. Each tab shows one notebook's published
// dashboard; a tab with no notebook yet says so. Only the open tab is mounted, so a page of five
// dashboards loads one.
export function ProtocolTabs({
  tabs,
  protocol,
}: {
  tabs: ShowcaseTab[];
  protocol: string;
}) {
  const searchParams = useSearchParams();
  const requested = searchParams.get("tab");
  const keys = tabKeys(tabs);
  const [activeKey, setActiveKey] = useState(() => {
    return requested && keys.includes(requested) ? requested : (keys[0] ?? "");
  });

  // The address follows the tab so a link opens the same one. It is set on the history directly: a
  // router navigation would ask the server for the whole page again on every switch.
  const select = useCallback((key: string) => {
    setActiveKey(key);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", key);
    window.history.replaceState(null, "", url);
  }, []);

  const activeIndex = Math.max(0, keys.indexOf(activeKey));
  const active = tabs[activeIndex]!;

  return (
    <div>
      <nav
        aria-label={`${protocol} sections`}
        className="sticky top-0 z-10 border-b border-border-secondary dark:border-border-tertiary bg-base-100"
      >
        <div
          role="tablist"
          className="container mx-auto px-4 sm:px-8 flex gap-1 overflow-x-auto"
        >
          {tabs.map((tab, index) => {
            const key = keys[index]!;
            const selected = index === activeIndex;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                id={`protocol-tab-${key}`}
                aria-selected={selected}
                aria-controls="protocol-tabpanel"
                onClick={() => select(key)}
                className={cn(
                  "relative h-11 shrink-0 px-3 text-sm font-medium transition-colors",
                  selected
                    ? "text-ink-100 dark:text-white"
                    : "text-ink-400 hover:text-ink-100 dark:hover:text-white"
                )}
              >
                {tab.label}
                {selected && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary"
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <section
        id="protocol-tabpanel"
        role="tabpanel"
        aria-labelledby={`protocol-tab-${keys[activeIndex]}`}
        className="container mx-auto px-4 sm:px-8 py-6"
      >
        {active.slug ? (
          <>
            <div className="mb-4 flex justify-end">
              <Link
                href={`${notebookHref(active.slug)}/dashboard`}
                className="text-[13px] font-medium text-primary dark:text-primary-tint-75 hover:underline"
              >
                Open full screen →
              </Link>
            </div>
            <PublishedDashboard key={active.slug} slug={active.slug} />
          </>
        ) : (
          <p className="rounded-xl border border-dashed border-border-secondary dark:border-border-tertiary p-6 text-sm text-ink-400">
            {active.label} is being built. It will appear here once its notebook
            is published.
          </p>
        )}
      </section>
    </div>
  );
}
