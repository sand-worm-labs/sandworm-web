"use client";

import { useMemo, useRef, useState } from "react";

import { ProtocolLogo } from "@/components/Showcase/ProtocolLogo";
import { slugify } from "@/lib/showcase";
import type { ShowcaseConfig } from "@/types";

import {
  attempt,
  dangerButton,
  inputClass,
  Notice,
  quietButton,
  type NoticeState,
} from "./kit";
import { toLogoPng } from "./logoImage";
import type { StudioLogo } from "./useShowcaseStudio";

// =====================================
// ⬢  Row
// =====================================
function LogoRow({
  name,
  slug,
  logo,
  onSave,
  onDelete,
}: {
  name: string;
  slug: string;
  logo: StudioLogo | undefined;
  onSave: (id: string, title: string, imageBase64: string) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
}) {
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
          {logo ? "Uploaded" : "DefiLlama icon, if it has one"} · {slug}
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
    </li>
  );
}

// =====================================
// ⬢  LogosTab
// =====================================
// Protocol logos: every protocol the categories list, and any logo uploaded for one they
// do not. A protocol with no upload shows DefiLlama's icon where there is one.
export function LogosTab({
  config,
  logos,
  onSave,
  onDelete,
}: {
  config: ShowcaseConfig;
  logos: StudioLogo[];
  onSave: (slug: string, name: string, imageBase64: string) => Promise<unknown>;
  onDelete: (slug: string) => Promise<unknown>;
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
        Any PNG, JPEG, WebP or SVG: it is resized to 256px here before it is
        sent. A new protocol needs nothing until its logo is missing.
      </p>

      <ul className="divide-y divide-border-secondary rounded-xl border border-border-secondary dark:divide-border-tertiary dark:border-border-tertiary">
        {shown.map(entry => (
          <LogoRow
            key={entry.slug}
            name={entry.name}
            slug={entry.slug}
            logo={uploaded.get(entry.slug)}
            onSave={onSave}
            onDelete={onDelete}
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
