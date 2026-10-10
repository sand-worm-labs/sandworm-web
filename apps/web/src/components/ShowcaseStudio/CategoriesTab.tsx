"use client";

import { useState } from "react";

import { slugify } from "@/lib/showcase";
import { cn } from "@/lib/utils";
import type { ShowcaseConfig, ShowcaseTaxonomyEntry } from "@/types";

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
import { parseList } from "./studioForms";

// =====================================
// ⬢  Types
// =====================================
type CategoryForm = {
  slug: string;
  name: string;
  groupId: string;
  question: string;
  metricSpec: string;
  protocols: string;
  chains: string;
};

const EMPTY: CategoryForm = {
  slug: "",
  name: "",
  groupId: "",
  question: "",
  metricSpec: "",
  protocols: "",
  chains: "",
};

const fromEntry = (entry: ShowcaseTaxonomyEntry): CategoryForm => ({
  slug: entry.slug,
  name: entry.name,
  groupId: entry.group,
  question: entry.question,
  metricSpec: entry.metricSpec ?? "",
  protocols: (entry.protocols ?? []).join(", "),
  chains: (entry.chains ?? []).join(", "),
});

// =====================================
// ⬢  Editor
// =====================================
function CategoryEditor({
  initial,
  isNew,
  config,
  onSave,
  onDelete,
  onDone,
}: {
  initial: CategoryForm;
  isNew: boolean;
  config: ShowcaseConfig;
  onSave: (input: Record<string, unknown>) => Promise<unknown>;
  onDelete: (slug: string) => Promise<unknown>;
  onDone: () => void;
}) {
  const [form, setForm] = useState(initial);
  const [notice, setNotice] = useState<NoticeState>(null);
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof CategoryForm>(key: K, value: CategoryForm[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const save = async () => {
    setBusy(true);
    setNotice(
      await attempt(
        () =>
          onSave({
            slug: form.slug,
            name: form.name,
            groupId: form.groupId,
            question: form.question,
            metricSpec: form.metricSpec,
            protocols: parseList(form.protocols),
            chains: parseList(form.chains),
          }),
        "Saved"
      )
    );
    setBusy(false);
  };

  const remove = async () => {
    setBusy(true);
    const result = await attempt(() => onDelete(form.slug), "Deleted");
    setBusy(false);
    if (result?.kind === "ok") onDone();
    else setNotice(result);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name">
          <input
            className={inputClass}
            value={form.name}
            onChange={e => {
              set("name", e.target.value);
              if (isNew) set("slug", slugify(e.target.value));
            }}
          />
        </Field>
        <Field
          label="Slug"
          hint={isNew ? "Used in the page address" : "Fixed once created"}
        >
          <input
            className={inputClass}
            value={form.slug}
            disabled={!isNew}
            onChange={e => set("slug", e.target.value)}
          />
        </Field>
        <Field label="Group">
          <select
            className={inputClass}
            value={form.groupId}
            onChange={e => set("groupId", e.target.value)}
          >
            <option value="">Choose…</option>
            {config.taxonomy.groups.map(group => (
              <option key={group.id} value={group.id}>
                {group.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Metric spec" hint="Optional">
          <input
            className={inputClass}
            value={form.metricSpec}
            onChange={e => set("metricSpec", e.target.value)}
          />
        </Field>
      </div>

      <Field label="The question it answers">
        <textarea
          className={textareaClass}
          rows={2}
          value={form.question}
          onChange={e => set("question", e.target.value)}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Protocols we plan to cover" hint="Comma separated">
          <textarea
            className={textareaClass}
            rows={2}
            value={form.protocols}
            onChange={e => set("protocols", e.target.value)}
          />
        </Field>
        <Field label="Chains" hint="Comma separated">
          <textarea
            className={textareaClass}
            rows={2}
            value={form.chains}
            onChange={e => set("chains", e.target.value)}
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={primaryButton}
          disabled={busy || !form.slug || !form.name || !form.groupId}
          onClick={save}
        >
          {isNew ? "Create category" : "Save"}
        </button>
        <button type="button" className={quietButton} onClick={onDone}>
          Close
        </button>
        {!isNew && (
          <button
            type="button"
            className={dangerButton}
            disabled={busy}
            onClick={remove}
          >
            Delete
          </button>
        )}
        <Notice notice={notice} />
      </div>
    </div>
  );
}

// =====================================
// ⬢  CategoriesTab
// =====================================
export function CategoriesTab({
  config,
  onSave,
  onDelete,
}: {
  config: ShowcaseConfig;
  onSave: (input: Record<string, unknown>) => Promise<unknown>;
  onDelete: (slug: string) => Promise<unknown>;
}) {
  // `null` is nothing open; a category with no slug is a new one.
  const [open, setOpen] = useState<CategoryForm | null>(null);
  const groups = new Map(config.taxonomy.groups.map(g => [g.id, g.label]));

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <div className="min-w-0">
        <button
          type="button"
          className={cn(primaryButton, "mb-3 w-full")}
          onClick={() => setOpen(EMPTY)}
        >
          New category
        </button>
        <ul className="max-h-[70vh] divide-y divide-border-secondary overflow-y-auto rounded-xl border border-border-secondary dark:divide-border-tertiary dark:border-border-tertiary">
          {config.taxonomy.categories.map(category => (
            <li key={category.slug}>
              <button
                type="button"
                onClick={() => setOpen(fromEntry(category))}
                className={cn(
                  "block w-full px-4 py-3 text-left transition-colors hover:bg-inputBg dark:hover:bg-header-surface",
                  open?.slug === category.slug &&
                    "bg-inputBg dark:bg-header-surface"
                )}
              >
                <span className="block truncate text-sm font-medium text-ink-100 dark:text-white">
                  {category.name}
                </span>
                <span className="mt-0.5 block text-xs text-ink-300">
                  {groups.get(category.group) ?? category.group}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="min-w-0 rounded-xl border border-border-secondary p-5 dark:border-border-tertiary">
        {open ? (
          <CategoryEditor
            key={open.slug || "new"}
            initial={open}
            isNew={
              !open.slug ||
              !config.taxonomy.categories.some(c => c.slug === open.slug)
            }
            config={config}
            onSave={onSave}
            onDelete={onDelete}
            onDone={() => setOpen(null)}
          />
        ) : (
          <p className="text-sm text-ink-300">
            Pick a category to edit it, or make a new one. A category with
            notebooks filed under it cannot be deleted.
          </p>
        )}
      </div>
    </div>
  );
}
