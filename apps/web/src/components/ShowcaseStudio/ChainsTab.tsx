"use client";

import { useState } from "react";

import type { ShowcaseConfig } from "@/types";

import {
  attempt,
  Field,
  inputClass,
  Notice,
  primaryButton,
  type NoticeState,
} from "./kit";

// =====================================
// ⬢  Row
// =====================================
function ChainRow({
  name,
  color,
  position,
  onSave,
}: {
  name: string;
  color: string;
  position: number;
  onSave: (input: Record<string, unknown>) => Promise<unknown>;
}) {
  const [draftColor, setDraftColor] = useState(color);
  const [draftPosition, setDraftPosition] = useState(String(position));
  const [notice, setNotice] = useState<NoticeState>(null);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    setNotice(
      await attempt(
        () =>
          onSave({ name, color: draftColor, position: Number(draftPosition) }),
        "Saved"
      )
    );
    setBusy(false);
  };

  return (
    <li className="flex flex-wrap items-center gap-3 px-4 py-3">
      <span className="w-32 truncate text-sm font-medium text-ink-100 dark:text-white">
        {name}
      </span>
      <input
        type="color"
        aria-label={`${name} color`}
        value={/^#[0-9a-f]{6}$/i.test(draftColor) ? draftColor : "#000000"}
        onChange={e => setDraftColor(e.target.value.toUpperCase())}
        className="h-9 w-12 cursor-pointer rounded-lg border border-border-secondary bg-transparent p-1 dark:border-border-tertiary"
      />
      <input
        className={`${inputClass} !w-28 font-body-mono`}
        aria-label={`${name} hex`}
        value={draftColor}
        onChange={e => setDraftColor(e.target.value)}
      />
      <input
        className={`${inputClass} !w-20`}
        aria-label={`${name} position`}
        type="number"
        min={0}
        value={draftPosition}
        onChange={e => setDraftPosition(e.target.value)}
      />
      <button
        type="button"
        className={primaryButton}
        disabled={busy}
        onClick={save}
      >
        Save
      </button>
      <Notice notice={notice} />
    </li>
  );
}

// =====================================
// ⬢  ChainsTab
// =====================================
export function ChainsTab({
  config,
  onSave,
}: {
  config: ShowcaseConfig;
  onSave: (input: Record<string, unknown>) => Promise<unknown>;
}) {
  const [name, setName] = useState("");
  const [notice, setNotice] = useState<NoticeState>(null);

  const { chainOrder } = config.taxonomy;
  const names = [
    ...chainOrder,
    ...Object.keys(config.chains).filter(chain => !chainOrder.includes(chain)),
  ];

  const add = async () => {
    const result = await attempt(
      () =>
        onSave({
          name: name.trim().toLowerCase(),
          color: "#A308F0",
          position: names.length + 1,
        }),
      "Added"
    );
    setNotice(result);
    if (result?.kind === "ok") setName("");
  };

  return (
    <div className="max-w-3xl space-y-5">
      <p className="text-sm text-ink-300">
        The colour each chain wears across the Showcase, and the order its
        filters appear in (lowest first).
      </p>

      <ul className="divide-y divide-border-secondary rounded-xl border border-border-secondary dark:divide-border-tertiary dark:border-border-tertiary">
        {names.map((chain, index) => (
          <ChainRow
            key={chain}
            name={chain}
            color={config.chains[chain]?.color ?? "#A308F0"}
            position={index + 1}
            onSave={onSave}
          />
        ))}
      </ul>

      <div className="flex flex-wrap items-end gap-2">
        <Field label="Add a chain" className="w-56">
          <input
            className={inputClass}
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="arbitrum"
          />
        </Field>
        <button
          type="button"
          className={primaryButton}
          disabled={!name.trim()}
          onClick={add}
        >
          Add
        </button>
        <Notice notice={notice} />
      </div>
    </div>
  );
}
