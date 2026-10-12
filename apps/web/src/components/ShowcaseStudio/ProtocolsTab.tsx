"use client";

import { useMemo, useRef, useState } from "react";

import { ProtocolLogo } from "@/components/Showcase/ProtocolLogo";
import { slugify } from "@/lib/showcase";
import type { ProtocolLinkKey, ProtocolLinks, ShowcaseConfig } from "@/types";

import {
  attempt,
  dangerButton,
  Field,
  inputClass,
  Notice,
  primaryButton,
  quietButton,
  type NoticeState,
} from "./kit";
import { toLogoPng } from "./logoImage";
import type { StudioLogo } from "./useShowcaseStudio";

// =====================================
// ⬢  Links
// =====================================
const LINK_FIELDS: { key: ProtocolLinkKey; label: string; hint: string }[] = [
  { key: "website", label: "Website", hint: "aave.com" },
  { key: "twitter", label: "X", hint: "@aave" },
  { key: "github", label: "GitHub", hint: "aave" },
  { key: "discord", label: "Discord", hint: "invite code or link" },
  { key: "telegram", label: "Telegram", hint: "aave" },
];

// A protocol's links: a URL or just a handle, whichever is quicker to type. The API stores a
// full URL, and an empty field removes that link.
function LinksForm({
  name,
  links,
  onSave,
}: {
  name: string;
  links: ProtocolLinks | undefined;
  onSave: (next: Record<string, string>) => Promise<unknown>;
}) {
  const [draft, setDraft] = useState<Record<string, string>>({ ...links });
  const [notice, setNotice] = useState<NoticeState>(null);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    setNotice(await attempt(() => onSave(draft), "Saved"));
    setBusy(false);
  };

  return (
    <div className="basis-full space-y-3 pt-1">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {LINK_FIELDS.map(({ key, label, hint }) => (
          <Field key={key} label={label}>
            <input
              className={inputClass}
              value={draft[key] ?? ""}
              placeholder={hint}
              aria-label={`${label} link for ${name}`}
              onChange={e =>
                setDraft(prev => ({ ...prev, [key]: e.target.value }))
              }
            />
          </Field>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className={primaryButton}
          disabled={busy}
          onClick={save}
        >
          Save links
        </button>
        <Notice notice={notice} />
      </div>
    </div>
  );
}

// =====================================
// ⬢  Row
// =====================================
function ProtocolRow({
  name,
  slug,
  logo,
  links,
  onSave,
  onDelete,
  onSaveLinks,
}: {
  name: string;
  slug: string;
  logo: StudioLogo | undefined;
  links: ProtocolLinks | undefined;
  onSave: (id: string, title: string, imageBase64: string) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
  onSaveLinks: (
    id: string,
    title: string,
    next: Record<string, string>
  ) => Promise<unknown>;
}) {
  const [showLinks, setShowLinks] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<NoticeState>(null);
  const [busy, setBusy] = useState(false);

  const upload = async (file: File) => {
    setBusy(true);
    setNotice(
      await attempt(
        async () => onSave(slug, name, await toLogoPng(file)),
        "Uploaded"
      )
    );
    setBusy(false);
    // The same file can then be picked again.
    if (input.current) input.current.value = "";
  };

  const remove = async () => {
    setBusy(true);
    setNotice(await attempt(() => onDelete(slug), "Removed"));
    setBusy(false);
  };

  return (
    <li className="flex flex-wrap items-center gap-3 px-4 py-3">
      <ProtocolLogo
        name={name}
        version={logo?.etag}
        className="h-10 w-10 rounded-lg bg-primary/10 text-base text-primary dark:bg-pill-bg dark:text-white"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink-100 dark:text-white">
          {name}
        </p>
        <p className="text-xs text-ink-300">
          {logo ? "Logo uploaded" : "DefiLlama icon, if it has one"} ·{" "}
          {Object.keys(links ?? {}).length} links · {slug}
        </p>
      </div>
      <Notice notice={notice} />
      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="sr-only"
        aria-label={`Logo file for ${name}`}
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) upload(file);
        }}
      />
      <button
        type="button"
        className={quietButton}
        disabled={busy}
        onClick={() => input.current?.click()}
      >
        {logo ? "Replace" : "Upload"}
      </button>
      <button
        type="button"
        className={quietButton}
        aria-expanded={showLinks}
        onClick={() => setShowLinks(open => !open)}
      >
        Links
      </button>
      {logo && (
        <button
          type="button"
          className={dangerButton}
          disabled={busy}
          onClick={remove}
        >
          Remove
        </button>
      )}
      {showLinks && (
        <LinksForm
          name={name}
          links={links}
          onSave={next => onSaveLinks(slug, name, next)}
        />
      )}
    </li>
  );
}

// =====================================
// ⬢  ProtocolsTab
// =====================================
// Protocol logos and links: every protocol the categories list, and any logo uploaded for one
// they do not. A protocol with no upload shows DefiLlama's icon where there is one; its links
// show as icons under its description.
export function ProtocolsTab({
  config,
  logos,
  onSave,
  onDelete,
  onSaveLinks,
}: {
  config: ShowcaseConfig;
  logos: StudioLogo[];
  onSave: (slug: string, name: string, imageBase64: string) => Promise<unknown>;
  onDelete: (slug: string) => Promise<unknown>;
  onSaveLinks: (
    slug: string,
    name: string,
    links: Record<string, string>
  ) => Promise<unknown>;
}) {
  const [query, setQuery] = useState("");
  const [onlyMissing, setOnlyMissing] = useState(false);

  const uploaded = useMemo(
    () => new Map(logos.map(entry => [entry.slug, entry])),
    [logos]
  );

  const protocols = useMemo(() => {
    const listed = config.taxonomy.categories.flatMap(category =>
      (category.protocols ?? []).map(title => ({
        slug: slugify(title),
        name: title,
      }))
    );
    const extra = logos.map(({ slug: id, name: title }) => ({
      slug: id,
      name: title,
    }));
    // The categories' spelling wins; the uploads add what no category lists.
    const bySlug = new Map(
      [...extra, ...listed].map(entry => [entry.slug, entry])
    );
    return Array.from(bySlug.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [config, logos]);

  const shown = protocols.filter(
    entry =>
      (!onlyMissing || !uploaded.has(entry.slug)) &&
      `${entry.name} ${entry.slug}`
        .toLowerCase()
        .includes(query.trim().toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          className={`${inputClass} max-w-xs`}
          placeholder="Search protocols"
          aria-label="Search protocols"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm text-ink-400">
          <input
            type="checkbox"
            checked={onlyMissing}
            onChange={e => setOnlyMissing(e.target.checked)}
          />
          Without an upload
        </label>
        <p className="text-xs text-ink-300">
          {uploaded.size} uploaded · {protocols.length} protocols
        </p>
      </div>

      <p className="max-w-2xl text-xs text-ink-300">
        Logos: any PNG, JPEG, WebP or SVG, resized to 256px here before it is
        sent. Links: a full address or just the handle; an empty box removes
        that link.
      </p>

      <ul className="divide-y divide-border-secondary rounded-xl border border-border-secondary dark:divide-border-tertiary dark:border-border-tertiary">
        {shown.map(entry => (
          <ProtocolRow
            key={entry.slug}
            name={entry.name}
            slug={entry.slug}
            logo={uploaded.get(entry.slug)}
            links={config.protocolLinks?.[entry.slug]}
            onSave={onSave}
            onDelete={onDelete}
            onSaveLinks={onSaveLinks}
          />
        ))}
        {shown.length === 0 && (
          <li className="px-4 py-6 text-sm text-ink-300">
            No protocol matches.
          </li>
        )}
      </ul>
    </div>
  );
}
