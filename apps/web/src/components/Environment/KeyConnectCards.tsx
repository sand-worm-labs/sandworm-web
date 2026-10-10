"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import clsx from "clsx";
import {
  PiArrowUpRight,
  PiArrowsClockwise,
  PiCaretDown,
  PiCheckCircle,
  PiEye,
  PiEyeSlash,
} from "react-icons/pi";

import type { EnvVar } from "@/components/Editor/hooks/useEnvironmentVariables";
import Spin from "@/components/Editor/blocks/Spin";

import { KEY_PROVIDERS, type KeyProvider } from "./ApiKeyNudge";

// =====================================
// ⬢ Checking and showing a key
// =====================================
// A format check only: the browser cannot test a key against Nansen (it does not
// allow this origin), so a wrong key shows up when a notebook first calls the API.
export function validateKey(raw: string): string | null {
  const key = raw.trim();
  if (!key) return "Paste your key first.";
  if (/\s/.test(key)) return "A key has no spaces. Check you copied only the key.";
  if (key.length < 12) return "That looks too short to be a key.";
  return null;
}

// What went wrong, in the server's own words when it gave any (an Apollo error carries
// its message), so a failed save says why instead of just that it failed.
export function failureReason(e: unknown, fallback: string): string {
  const message = e instanceof Error ? e.message.trim() : "";
  return message ? `${fallback} ${message}` : fallback;
}

// Enough to recognise which key it is, never enough to use it.
export const maskKey = (value: string): string =>
  value.length > 8 ? `••••••••${value.slice(-4)}` : "••••••••";

// =====================================
// ⬢ Shared look
// =====================================
const fieldCls =
  "w-full rounded-lg border border-border dark:border-border-tertiary bg-page-surface " +
  "px-3 py-2 text-sm text-ink-500 dark:text-white " +
  "placeholder-ink-300 dark:placeholder-ink-600 " +
  "focus:outline-none focus:ring-0 focus:border-primary disabled:opacity-50";

const ghostBtn =
  "rounded-lg border border-border dark:border-base-710 bg-base-300 dark:bg-base-700 " +
  "px-3 py-1.5 text-sm font-medium text-ink-500 dark:text-ink-200 transition-colors " +
  "hover:bg-base-350 dark:hover:bg-base-710 disabled:opacity-50";

const columnLabel =
  "mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-300 dark:text-ink-600";

// =====================================
// ⬢ Key field: shown or hidden
// =====================================
function KeyInput({
  value,
  onChange,
  label,
  placeholder,
  invalid,
  disabled,
  autoFocus,
  onEnter,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
  invalid: boolean;
  disabled: boolean;
  autoFocus?: boolean;
  // Enter confirms. This is not a <form>, so it must not fall through to the form this
  // sits inside (the editor's panel has its own), which would submit that one instead.
  onEnter?: () => void;
}) {
  const [shown, setShown] = useState(false);
  return (
    <div className="relative min-w-0">
      <input
        type={shown ? "text" : "password"}
        value={value}
        autoComplete="off"
        spellCheck={false}
        autoFocus={autoFocus}
        placeholder={placeholder}
        aria-label={label}
        aria-invalid={invalid ? true : undefined}
        disabled={disabled}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter") {
            e.preventDefault();
            onEnter?.();
          }
        }}
        className={clsx(fieldCls, "pr-9 font-mono", invalid && "border-red-500 focus:border-red-500")}
      />
      <button
        type="button"
        onClick={() => setShown(s => !s)}
        aria-label={shown ? "Hide key" : "Show key"}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-300 transition-colors hover:text-ink-500 dark:hover:text-ink-300"
      >
        {shown ? <PiEyeSlash size={15} /> : <PiEye size={15} />}
      </button>
    </div>
  );
}

// =====================================
// ⬢ A connected provider: its env name, its key masked, and what can be done to it
// =====================================
interface ConnectedRowProps {
  provider: KeyProvider;
  existing: EnvVar;
  saving: boolean;
  isViewer: boolean;
  narrow: boolean;
  onSave: (add: EnvVar[], remove: string[]) => Promise<void>;
  onSaved: () => void;
}

function ConnectedRow({
  provider,
  existing,
  saving,
  isViewer,
  narrow,
  onSave,
  onSaved,
}: ConnectedRowProps) {
  const [editing, setEditing] = useState(false);
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setEditing(false);
    setConfirmingRemove(false);
    setValue("");
    setError(null);
  };

  const replace = async () => {
    const problem = validateKey(value);
    if (problem) {
      setError(problem);
      return;
    }
    try {
      // Replacing is one call: the old row goes, the new one is added.
      await onSave(
        [{ id: uuidv4(), name: provider.varName, value: value.trim() }],
        [existing.id]
      );
      reset();
      onSaved();
    } catch (e) {
      setError(failureReason(e, "Couldn't save the key."));
    }
  };

  const disconnect = async () => {
    try {
      await onSave([], [existing.id]);
      reset();
      onSaved();
    } catch (e) {
      setError(failureReason(e, "Couldn't remove the key."));
    }
  };

  return (
    <section
      aria-label={`${provider.name} connection`}
      className={clsx(
        "grid gap-x-4 gap-y-2 px-3 py-3 sm:px-4",
        narrow
          ? "grid-cols-1"
          : "sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] sm:items-center"
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-primary-tint-50 text-primary dark:bg-dropdown-bg"
        >
          <PiCheckCircle size={20} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink-100 dark:text-white">
            {provider.name}
          </p>
          <code className="block truncate font-mono text-[0.75rem] text-ink-400 dark:text-ink-200">
            {provider.varName}
          </code>
        </div>
      </div>

      <div className="min-w-0">
        {editing ? (
          <div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="min-w-0 flex-1">
                <KeyInput
                  value={value}
                  onChange={v => {
                    setValue(v);
                    if (error) setError(null);
                  }}
                  label={`${provider.name} API key`}
                  placeholder={`New ${provider.name} key`}
                  invalid={error !== null}
                  disabled={saving}
                  autoFocus
                  onEnter={replace}
                />
              </div>
              <div className="flex flex-none items-center gap-2">
                <button
                  type="button"
                  onClick={replace}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-710 disabled:opacity-60"
                >
                  {saving && <Spin />}
                  Replace key
                </button>
                <button type="button" onClick={reset} className={ghostBtn}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary-tint-50 px-2 py-0.5 text-xs font-medium text-primary-700 dark:bg-dropdown-bg dark:text-primary-300">
              Connected
            </span>
            <span className="font-mono text-sm text-ink-400 dark:text-ink-200">
              {maskKey(existing.value)}
            </span>

            {!isViewer && (
              <span className="flex flex-wrap items-center gap-2 sm:ml-auto">
                {confirmingRemove ? (
                  <>
                    <span className="text-sm text-ink-400 dark:text-ink-200">
                      Remove this key?
                    </span>
                    <button
                      type="button"
                      onClick={disconnect}
                      disabled={saving}
                      className="flex items-center gap-2 rounded-lg bg-error px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                    >
                      {saving && <Spin />}
                      Remove
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingRemove(false)}
                      className={ghostBtn}
                    >
                      Keep it
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      className={ghostBtn}
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingRemove(true)}
                      className={ghostBtn}
                    >
                      Disconnect
                    </button>
                  </>
                )}
              </span>
            )}
          </div>
        )}
        {error && (
          <p role="alert" className="mt-1.5 text-xs text-red-500">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}

// =====================================
// ⬢ The dropdown of services
// =====================================
// Every service is listed, grouped by category when providers have one so a long list
// stays easy to scan. One that is already connected stays visible but cannot be picked.
function ServiceOptions({
  providers,
  connectedIds,
}: {
  providers: KeyProvider[];
  connectedIds: Set<string>;
}) {
  const groups = new Map<string, KeyProvider[]>();
  for (const provider of providers) {
    const key = provider.category ?? "";
    groups.set(key, [...(groups.get(key) ?? []), provider]);
  }
  const option = (p: KeyProvider) => {
    const done = connectedIds.has(p.id);
    return (
      <option key={p.id} value={p.id} disabled={done}>
        {p.name} ({p.varName}){done ? " · connected" : ""}
      </option>
    );
  };
  return (
    <>
      {Array.from(groups.entries()).map(([category, list]) =>
        category ? (
          <optgroup key={category} label={category}>
            {list.map(option)}
          </optgroup>
        ) : (
          list.map(option)
        )
      )}
    </>
  );
}

// =====================================
// ⬢ The whole thing, for the environment page and the editor's panel
// =====================================
interface KeyConnectCardsProps {
  variables: EnvVar[];
  saving: boolean;
  isViewer: boolean;
  loading: boolean;
  onSave: (add: EnvVar[], remove: string[]) => Promise<void>;
  onRestart: () => void;
  // The providers to offer. Defaults to the registry; a test passes its own.
  providers?: KeyProvider[];
  // Stack the two columns: pass it from a narrow container such as the editor's side
  // panel, which a screen-width breakpoint cannot tell apart from a wide page.
  narrow?: boolean;
}

export default function KeyConnectCards({
  variables,
  saving,
  isViewer,
  loading,
  onSave,
  onRestart,
  providers = KEY_PROVIDERS,
  narrow = false,
}: KeyConnectCardsProps) {
  const [selectedId, setSelectedId] = useState("");
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  // A running notebook reads its keys when its kernel starts, so a change needs a restart.
  const [restartAdvised, setRestartAdvised] = useState(false);
  const [restarted, setRestarted] = useState(false);

  if (loading) return null;

  const rows = providers.map(provider => ({
    provider,
    existing: variables.find(v => v.name === provider.varName),
  }));
  const connected = rows.filter(
    (r): r is { provider: KeyProvider; existing: EnvVar } => r.existing !== undefined
  );
  const available = rows.filter(r => !r.existing).map(r => r.provider);
  const selected = available.find(p => p.id === selectedId);

  const advise = () => {
    setRestartAdvised(true);
    setRestarted(false);
  };

  const connect = async () => {
    if (!selected) {
      setError("Choose a service first.");
      return;
    }
    const problem = validateKey(value);
    if (problem) {
      setError(problem);
      return;
    }
    try {
      await onSave(
        [{ id: uuidv4(), name: selected.varName, value: value.trim() }],
        []
      );
      setSelectedId("");
      setValue("");
      setError(null);
      advise();
    } catch (e) {
      setError(failureReason(e, "Couldn't save the key."));
    }
  };

  const twoColumns = !narrow && "sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]";

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-ink-300 dark:text-ink-600">
          Connections
        </h3>
        <span className="text-xs text-ink-300 dark:text-ink-600">
          {connected.length} of {rows.length} connected
        </span>
      </div>

      {/* ── One form for every service: pick it, paste its key ── */}
      {!isViewer && available.length > 0 && (
        <div
          role="group"
          aria-label="Connect a service"
          className="rounded-2xl border border-border p-3 dark:border-border-tertiary sm:p-4"
        >
          <div className={clsx("grid gap-x-4 gap-y-3", twoColumns)}>
            <div className="min-w-0">
              <label htmlFor="connection-service" className={columnLabel}>
                Env name
              </label>
              <div className="relative">
                <select
                  id="connection-service"
                  aria-label="Service"
                  value={selectedId}
                  disabled={saving}
                  onChange={e => {
                    setSelectedId(e.target.value);
                    if (error) setError(null);
                  }}
                  className={clsx(fieldCls, "appearance-none pr-9")}
                >
                  <option value="">Select a service…</option>
                  <ServiceOptions
                    providers={providers}
                    connectedIds={new Set(connected.map(c => c.provider.id))}
                  />
                </select>
                <PiCaretDown
                  aria-hidden="true"
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-300"
                />
              </div>
              {selected && (
                <p className="mt-1.5 flex flex-wrap items-center gap-x-2 text-xs text-ink-400 dark:text-ink-200">
                  <span>{selected.blurb ?? selected.body}</span>
                  <a
                    href={selected.getKeyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-0.5 font-medium text-primary underline underline-offset-2 hover:text-primary-710"
                  >
                    Get a key
                    <PiArrowUpRight size={11} />
                  </a>
                </p>
              )}
            </div>

            <div className="min-w-0">
              <span className={columnLabel}>Key</span>
              <div className={clsx("flex gap-2", narrow ? "flex-col" : "flex-col sm:flex-row")}>
                <div className="min-w-0 flex-1">
                  <KeyInput
                    value={value}
                    onChange={v => {
                      setValue(v);
                      if (error) setError(null);
                    }}
                    label="API key"
                    placeholder={
                      selected ? `Paste your ${selected.name} key` : "Paste your key"
                    }
                    invalid={error !== null}
                    disabled={saving}
                    onEnter={connect}
                  />
                </div>
                <button
                  type="button"
                  onClick={connect}
                  disabled={saving}
                  className="flex flex-none items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-710 disabled:opacity-60"
                >
                  {saving && <Spin />}
                  Connect
                </button>
              </div>
              {error && (
                <p role="alert" className="mt-1.5 text-xs text-red-500">
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {!isViewer && available.length === 0 && (
        <p className="rounded-2xl border border-border px-4 py-3 text-sm text-ink-400 dark:border-border-tertiary dark:text-ink-200">
          Every service is connected.
        </p>
      )}

      {/* ── What is connected ── */}
      {connected.length > 0 && (
        <div className="mt-3 divide-y divide-border overflow-hidden rounded-2xl border border-border dark:divide-border-tertiary dark:border-border-tertiary">
          {connected.map(({ provider, existing }) => (
            <ConnectedRow
              key={provider.id}
              provider={provider}
              existing={existing}
              saving={saving}
              isViewer={isViewer}
              narrow={narrow}
              onSave={onSave}
              onSaved={advise}
            />
          ))}
        </div>
      )}

      {isViewer && connected.length === 0 && (
        <p className="text-sm text-ink-400">No connections yet.</p>
      )}

      {restartAdvised && (
        <div
          role="status"
          className="mt-3 flex flex-col gap-3 rounded-xl border border-border bg-base-300 px-4 py-3 text-sm text-ink-500 dark:border-border-tertiary dark:bg-base-700 dark:text-ink-200 sm:flex-row sm:items-center sm:justify-between"
        >
          <span>
            {restarted
              ? "Restarting. Run your notebook again once the environment is back."
              : "Saved. Notebooks that are already running pick this up after a restart."}
          </span>
          {!restarted && (
            <button
              type="button"
              onClick={() => {
                onRestart();
                setRestarted(true);
              }}
              className="flex flex-none items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-710"
            >
              <PiArrowsClockwise size={15} />
              Restart environment
            </button>
          )}
        </div>
      )}
    </div>
  );
}
