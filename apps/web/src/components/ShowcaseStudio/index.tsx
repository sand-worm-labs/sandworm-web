"use client";

import { useState, type FormEvent } from "react";

import { cn } from "@/lib/utils";

import { CategoriesTab } from "./CategoriesTab";
import { ChainsTab } from "./ChainsTab";
import { inputClass, primaryButton, quietButton } from "./kit";
import { LeadsTab } from "./LeadsTab";
import { NotebooksTab } from "./NotebooksTab";
import { useShowcaseStudio } from "./useShowcaseStudio";

// =====================================
// ⬢  Constants
// =====================================
const TABS = [
  { id: "notebooks", label: "Notebooks" },
  { id: "categories", label: "Categories" },
  { id: "chains", label: "Chains" },
  { id: "leads", label: "Leads" },
] as const;

type TabId = (typeof TABS)[number]["id"];

// =====================================
// ⬢  Gate
// =====================================
function Gate({
  error,
  onSubmit,
}: {
  error: string | null;
  onSubmit: (password: string) => void;
}) {
  const [value, setValue] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (value) onSubmit(value);
  };

  return (
    <form onSubmit={submit} className="mx-auto mt-[18vh] w-full max-w-sm px-4">
      <h1 className="text-xl font-medium text-ink-100 dark:text-white">
        Showcase studio
      </h1>
      <p className="mt-1 text-sm text-ink-300">For the Sandworm team.</p>
      <input
        type="password"
        autoComplete="current-password"
        aria-label="Password"
        className={cn(inputClass, "mt-5")}
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Password"
      />
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      <button type="submit" className={cn(primaryButton, "mt-4 w-full")}>
        Open the studio
      </button>
    </form>
  );
}

// =====================================
// ⬢  ShowcaseStudio
// =====================================
// The team's editor for the Showcase: what is on it, how each notebook appears,
// the categories and chains it is laid out from, and the leads it brings in.
export function ShowcaseStudio() {
  const studio = useShowcaseStudio();
  const [tab, setTab] = useState<TabId>("notebooks");

  if (studio.loading && !studio.overview) {
    return <p className="p-8 text-sm text-ink-300">Loading…</p>;
  }

  if (studio.locked || !studio.overview || !studio.config) {
    return <Gate error={studio.gateError} onSubmit={studio.unlock} />;
  }

  const { overview, config } = studio;

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 pb-24 pt-6 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-medium text-ink-100 dark:text-white">
            Showcase studio
          </h1>
          <p className="text-xs text-ink-300">
            {overview.notebooks.length} notebooks ·{" "}
            {config.taxonomy.categories.length} categories ·{" "}
            {overview.leads.length} leads
          </p>
        </div>
        <button type="button" className={quietButton} onClick={studio.lock}>
          Lock
        </button>
      </header>

      <nav
        className="mt-5 flex gap-1 border-b border-border-secondary dark:border-border-tertiary"
        aria-label="Studio sections"
      >
        {TABS.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            aria-current={tab === item.id ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-sm transition-colors",
              tab === item.id
                ? "border-primary font-medium text-ink-100 dark:text-white"
                : "border-transparent text-ink-400 hover:text-ink-100 dark:hover:text-white"
            )}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <main className="mt-6">
        {tab === "notebooks" && (
          <NotebooksTab
            notebooks={overview.notebooks}
            config={config}
            onSave={studio.saveNotebook}
          />
        )}
        {tab === "categories" && (
          <CategoriesTab
            config={config}
            onSave={studio.saveCategory}
            onDelete={studio.deleteCategory}
          />
        )}
        {tab === "chains" && (
          <ChainsTab config={config} onSave={studio.saveChain} />
        )}
        {tab === "leads" && (
          <LeadsTab
            leads={overview.leads}
            notebooks={overview.notebooks}
            onApprove={studio.approveClaim}
          />
        )}
      </main>
    </div>
  );
}
