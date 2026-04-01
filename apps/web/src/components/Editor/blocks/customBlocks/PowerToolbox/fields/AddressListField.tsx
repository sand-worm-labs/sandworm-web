"use client";

import { useState, useRef, useCallback } from "react";
import clsx from "clsx";
import type { ParamDefinition } from "@sandworm/editor";

import { FieldLabel, FieldError } from "./AddressField";

// ─── Validation ───────────────────────────────────────────────────────────────

function isValidEntry(value: string, isUid: boolean): boolean {
  if (isUid) return /^0x[0-9a-fA-F]{64}$/.test(value);
  return /^0x[0-9a-fA-F]{40}$/.test(value);
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface AddressListFieldProps {
  param: ParamDefinition;
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AddressListField({
  param,
  value,
  onChange,
  error,
}: AddressListFieldProps) {
  const [draft, setDraft] = useState("");
  const [draftError, setDraftError] = useState<string | undefined>();
  const inputRef = useRef<HTMLInputElement>(null);

  const isUid = param.type === "schema_uid";

  const addEntry = useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed) return;

    if (!isValidEntry(trimmed, isUid)) {
      setDraftError(
        isUid
          ? "Must be a 66-char hex string"
          : "Must be a valid EVM address (0x + 40 chars)"
      );
      return;
    }

    if (value.includes(trimmed)) {
      setDraftError("Already added");
      return;
    }

    onChange([...value, trimmed]);
    setDraft("");
    setDraftError(undefined);
    inputRef.current?.focus();
  }, [draft, isUid, value, onChange]);

  const removeEntry = useCallback(
    (index: number) => {
      onChange(value.filter((_, i) => i !== index));
    },
    [value, onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addEntry();
      }
      if (e.key === "Backspace" && draft === "" && value.length > 0) {
        removeEntry(value.length - 1);
      }
    },
    [addEntry, draft, value, removeEntry]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const pasted = e.clipboardData.getData("text");
      // Support pasting newline or comma separated lists
      const entries = pasted
        .split(/[\n,\s]+/)
        .map(s => s.trim())
        .filter(Boolean);

      if (entries.length > 1) {
        e.preventDefault();
        const valid = entries.filter(s => isValidEntry(s, isUid));
        const unique = valid.filter(s => !value.includes(s));
        if (unique.length > 0) {
          onChange([...value, ...unique]);
        }
      }
    },
    [isUid, value, onChange]
  );

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel param={param} />

      {/* Tag container */}
      <div
        className={clsx(
          "min-h-[80px] rounded-lg border transition-colors",
          "bg-white/[0.03] p-2 flex flex-wrap gap-1.5",
          "cursor-text",
          error
            ? "border-error/40"
            : "border-border-tertiary focus-within:border-[#A308F0]/40"
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Existing entries as pills */}
        {value.map((entry, i) => (
          <EntryPill
            key={entry}
            value={entry}
            onRemove={() => removeEntry(i)}
          />
        ))}

        {/* Draft input */}
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={e => {
            setDraft(e.target.value);
            setDraftError(undefined);
          }}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={() => {
            if (draft.trim()) addEntry();
          }}
          placeholder={
            value.length === 0
              ? (param.placeholder ?? "0x... then press Enter")
              : "Add another..."
          }
          spellCheck={false}
          autoComplete="off"
          className={clsx(
            "flex-1 min-w-[180px] bg-transparent outline-none",
            "text-xs  text-ink-100 ",
            "placeholder:text-ink-400"
          )}
        />
      </div>

      {/* Draft validation error */}
      {draftError && <FieldError message={draftError} />}
      {error && !draftError && <FieldError message={error} />}

      {/* Count + paste hint */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-ink-400   ">
          {value.length === 0
            ? "Press Enter after each address"
            : `${value.length} address${value.length !== 1 ? "es" : ""} — paste multiple separated by newlines`}
        </p>
        {value.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-[11px] text-ink-400    hover:text-error   transition-colors"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Entry pill ───────────────────────────────────────────────────────────────

function EntryPill({
  value,
  onRemove,
}: {
  value: string;
  onRemove: () => void;
}) {
  // Truncate long addresses to first 6 + last 4 chars
  const display =
    value.length > 12 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value;

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 px-2 py-1 rounded-md",
        "bg-[#A308F0]/10 border border-[#A308F0]/20",
        "text-[11px]  text-[#A308F0]/80",
        "max-w-[160px]"
      )}
      title={value}
    >
      <span className="truncate">{display}</span>
      <button
        type="button"
        onClick={e => {
          e.stopPropagation();
          onRemove();
        }}
        className="shrink-0 text-[#A308F0]/40 hover:text-[#A308F0]/80 transition-colors leading-none"
        aria-label={`Remove ${value}`}
      >
        ×
      </button>
    </span>
  );
}
