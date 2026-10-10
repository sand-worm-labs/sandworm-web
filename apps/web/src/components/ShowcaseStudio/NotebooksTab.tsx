"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  categoryHref,
  notebookHref,
  projectHref,
  slugify,
} from "@/lib/showcase";
import { cn } from "@/lib/utils";
import type { ShowcaseConfig, ShowcaseKind } from "@/types";

import {
  attempt,
  dangerButton,
  Field,
  inputClass,
  Notice,
  primaryButton,
  quietButton,
  textareaClass,
  type NoticeState,
} from "./kit";
import {
  formProblems,
  toForm,
  toShowcase,
  type NotebookForm,
} from "./studioForms";
import type { StudioNotebook } from "./useShowcaseStudio";

// =====================================
// ⬢  Constants
// =====================================
const KINDS: { id: ShowcaseKind; label: string; help: string }[] = [
  {
    id: "case_study",
    label: "On-chain analysis",
    help: "A deep on-chain analysis of one protocol",
  },
  {
    id: "category",
    label: "Category",
    help: "The notebook that leads a category",
  },
  {
    id: "working",
    label: "Working",
    help: "The working notebook behind an analysis",
  },
];

type Filter = "all" | "published" | "draft" | "unfiled";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "published", label: "Published" },
  { id: "draft", label: "Drafts" },
  { id: "unfiled", label: "Not filed" },
];

function matches(notebook: StudioNotebook, filter: Filter) {
  const status = notebook.showcase?.status;
  if (filter === "published") return status === "published";
  if (filter === "draft") return status === "draft";
  if (filter === "unfiled") return !notebook.showcase;
  return true;
}

// =====================================
// ⬢  Editor
// =====================================
function NotebookEditor({
  notebook,
  config,
  onSave,
}: {
  notebook: StudioNotebook;
  config: ShowcaseConfig;
  onSave: (
    documentId: string,
    showcase: Record<string, unknown> | null
  ) => Promise<unknown>;
}) {
  // State
  const [form, setForm] = useState<NotebookForm>(() =>
    toForm(notebook.showcase)
  );
  const [notice, setNotice] = useState<NoticeState>(null);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof NotebookForm>(key: K, value: NotebookForm[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  // Derived
  const problems = formProblems(form);
  const isFiled = !!notebook.showcase;
  const isPublic = notebook.visibility === "PUBLIC" && !!notebook.publishedAt;

  // Handlers
  const run = async (
    showcase: Record<string, unknown> | null,
    done: string
  ) => {
    setSaving(true);
    setNotice(await attempt(() => onSave(notebook.id, showcase), done));
    setSaving(false);
  };

  const save = (status: NotebookForm["status"]) => {
    const next = { ...form, status };
    setForm(next);
    return run(
      toShowcase(next),
      status === "published" ? "Published on the Showcase" : "Saved"
    );
  };

  const remove = async () => {
    await run(null, "Taken off the Showcase");
    setForm(toForm(null));
  };

  const livePath = notebook.showcase
    ? notebook.showcase.kind === "case_study"
      ? projectHref(
          notebook.showcase.category,
          slugify(notebook.showcase.protocol ?? notebook.slug)
        )
      : categoryHref(notebook.showcase.category)
    : null;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-medium text-ink-100 dark:text-white">
          {notebook.title}
        </h2>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-ink-300">
          <Link
            href={notebookHref(notebook.slug)}
            target="_blank"
            className="hover:text-primary"
          >
            Open notebook
          </Link>
          {livePath && notebook.showcase?.status === "published" && (
            <Link
              href={livePath}
              target="_blank"
              className="hover:text-primary"
            >
              View on the Showcase
            </Link>
          )}
        </p>
        {!isPublic && (
          <p className="mt-2 rounded-lg border border-amber-300 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
            This notebook is not published and public, so it stays off the
            Showcase whatever is set here.
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Kind" hint={KINDS.find(k => k.id === form.kind)?.help}>
          <select
            className={inputClass}
            value={form.kind}
            onChange={e => set("kind", e.target.value as ShowcaseKind)}
          >
            {KINDS.map(kind => (
              <option key={kind.id} value={kind.id}>
                {kind.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Category">
          <select
            className={inputClass}
            value={form.category}
            onChange={e => set("category", e.target.value)}
          >
            <option value="">Choose…</option>
            {config.taxonomy.categories.map(category => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>

        {form.kind === "case_study" && (
          <Field label="Protocol">
            <input
              className={inputClass}
              value={form.protocol}
              onChange={e => set("protocol", e.target.value)}
              placeholder="Paj"
            />
          </Field>
        )}

        {form.kind === "working" && (
          <Field label="Analysis slug" hint="The analysis this belongs to">
            <input
              className={inputClass}
              value={form.parentCaseStudy}
              onChange={e => set("parentCaseStudy", e.target.value)}
            />
          </Field>
        )}

        <Field label="Chains" hint="Comma separated">
          <input
            className={inputClass}
            value={form.chains}
            onChange={e => set("chains", e.target.value)}
            placeholder="solana, base"
          />
        </Field>

        <Field label="Country">
          <input
            className={inputClass}
            value={form.country}
            onChange={e => set("country", e.target.value)}
          />
        </Field>

        <Field label="Data as of">
          <input
            className={inputClass}
            value={form.dataAsOf}
            onChange={e => set("dataAsOf", e.target.value)}
            placeholder="2026-10-01"
          />
        </Field>
      </div>

      <Field
        label="Headline stats"
        hint="One per line, up to 4: Label | value. Add | cell to pull the value from a notebook cell."
      >
        <textarea
          className={textareaClass}
          rows={4}
          value={form.heroStats}
          onChange={e => set("heroStats", e.target.value)}
          placeholder={"Volume | $4.2M\nActive users | 12k"}
        />
      </Field>

      {form.kind === "case_study" && (
        <label className="flex items-center gap-2 text-sm text-ink-100 dark:text-white">
          <input
            type="checkbox"
            checked={form.claimed}
            onChange={e => set("claimed", e.target.checked)}
          />
          Claimed by the protocol&apos;s team
        </label>
      )}

      {problems.length > 0 && (
        <ul className="text-xs text-amber-700 dark:text-amber-400">
          {problems.map(problem => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={primaryButton}
          disabled={saving || problems.length > 0}
          onClick={() => save("published")}
        >
          {form.status === "published" && isFiled
            ? "Save and keep published"
            : "Publish"}
        </button>
        <button
          type="button"
          className={quietButton}
          disabled={saving || problems.length > 0}
          onClick={() => save("draft")}
        >
          Save as draft
        </button>
        {isFiled && (
          <button
            type="button"
            className={dangerButton}
            disabled={saving}
            onClick={remove}
          >
            Remove from Showcase
          </button>
        )}
        <Notice notice={notice} />
      </div>
    </div>
  );
}

// =====================================
// ⬢  NotebooksTab
// =====================================
export function NotebooksTab({
  notebooks,
  config,
  onSave,
}: {
  notebooks: StudioNotebook[];
  config: ShowcaseConfig;
  onSave: (
    documentId: string,
    showcase: Record<string, unknown> | null
  ) => Promise<unknown>;
}) {
  // State
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Derived
  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return notebooks.filter(
      notebook =>
        matches(notebook, filter) &&
        (!needle ||
          notebook.title.toLowerCase().includes(needle) ||
          (notebook.showcase?.protocol ?? "").toLowerCase().includes(needle))
    );
  }, [notebooks, filter, search]);
  const selected = notebooks.find(notebook => notebook.id === selectedId);

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <div className="min-w-0">
        <input
          type="search"
          className={inputClass}
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search notebooks"
          aria-label="Search notebooks"
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {FILTERS.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              aria-pressed={filter === item.id}
              className={cn(
                "h-7 rounded-full border px-3 text-xs transition-colors",
                filter === item.id
                  ? "border-ink-100 bg-ink-100 text-white dark:border-white dark:bg-white dark:text-ink-100"
                  : "border-border-secondary dark:border-border-tertiary text-ink-400 hover:text-ink-100 dark:hover:text-white"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <ul className="mt-3 max-h-[70vh] divide-y divide-border-secondary overflow-y-auto rounded-xl border border-border-secondary dark:divide-border-tertiary dark:border-border-tertiary">
          {visible.length === 0 && (
            <li className="p-4 text-sm text-ink-300">Nothing here.</li>
          )}
          {visible.map(notebook => {
            const status = notebook.showcase?.status;
            return (
              <li key={notebook.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(notebook.id)}
                  className={cn(
                    "block w-full px-4 py-3 text-left transition-colors hover:bg-inputBg dark:hover:bg-header-surface",
                    notebook.id === selectedId &&
                      "bg-inputBg dark:bg-header-surface"
                  )}
                >
                  <span className="block truncate text-sm font-medium text-ink-100 dark:text-white">
                    {notebook.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-ink-300">
                    {notebook.showcase
                      ? `${notebook.showcase.kind.replace("_", " ")} · ${notebook.showcase.protocol ?? notebook.showcase.category} · ${status}`
                      : "Not on the Showcase"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="min-w-0 rounded-xl border border-border-secondary p-5 dark:border-border-tertiary">
        {selected ? (
          <NotebookEditor
            key={selected.id}
            notebook={selected}
            config={config}
            onSave={onSave}
          />
        ) : (
          <p className="text-sm text-ink-300">
            Pick a notebook to file it on the Showcase, edit how it appears, or
            take it off.
          </p>
        )}
      </div>
    </div>
  );
}
