"use client";

import { useCallback, useEffect, useState } from "react";
import { PiArrowUpRight, PiKey } from "react-icons/pi";

import type { EnvVar } from "@/components/Editor/hooks/useEnvironmentVariables";

// =====================================
// ⬢ The keys a workspace is asked for
// =====================================
// Sandworm supplies one key to every notebook, Etherscan, because its calldata tool
// uses it. These are the workspace's own: saved here, they reach its notebooks.
export interface KeyProvider {
  id: string;
  name: string;
  varName: string;
  title: string;
  body: string;
  getKeyUrl: string;
  // For the connections list, which holds many providers: one line on what the key
  // gives a notebook, and a group to search by. Optional so a provider can be added
  // with just the fields above.
  blurb?: string;
  category?: string;
}

export const KEY_PROVIDERS: KeyProvider[] = [
  {
    id: "nansen",
    name: "Nansen",
    varName: "NANSEN_API_KEY",
    title: "Nansen is waiting for its key",
    body: "It has been standing there since you opened this page. Add the key and your notebooks can pull smart-money flows, wallet labels, token screeners and PnL leaderboards.",
    getKeyUrl: "https://app.nansen.ai",
    blurb:
      "Smart-money flows, wallet labels and PnL, token screeners and Hyperliquid perps.",
    category: "Onchain data",
  },
  {
    id: "avacloud",
    name: "AvaCloud",
    varName: "AVACLOUD_API_KEY",
    title: "AvaCloud is waiting for its key",
    body: "Avalanche data works without it, but then it shares a rate-limited pool. A free key gives your notebooks their own limits.",
    getKeyUrl: "https://app.avacloud.io",
    blurb: "Your own rate limits for Avalanche data, instead of a shared pool.",
    category: "Onchain data",
  },
];

// =====================================
// ⬢ When to show one
// =====================================
// It nags until the key is there: saved on the workspace, or typed into a new row
// that has not been saved yet. A viewer cannot add variables, so is not nagged.
export function shouldShowKeyNudge(
  provider: Pick<KeyProvider, "varName">,
  {
    variables,
    added,
    loading,
    isViewer,
    dismissed,
  }: {
    variables: Pick<EnvVar, "name">[];
    added: Pick<EnvVar, "name">[];
    loading: boolean;
    isViewer: boolean;
    dismissed: boolean | null;
  }
): boolean {
  if (loading || isViewer || dismissed !== false) {
    return false;
  }
  return ![...variables, ...added].some(v => v.name === provider.varName);
}

// "Not now" is remembered per workspace and provider, in the browser. Storage can
// be unavailable (private windows, blocked site data): then it just comes back.
export const keyNudgeDismissedKey = (workspaceId: string, providerId: string) =>
  `sandworm:key-nudge:${providerId}:dismissed:${workspaceId}`;

export function useKeyNudgeDismissed(workspaceId: string, providerId: string) {
  // null until the browser has been asked, so a returning visitor never sees it
  // flash up and vanish.
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      setDismissed(
        window.localStorage.getItem(
          keyNudgeDismissedKey(workspaceId, providerId)
        ) === "true"
      );
    } catch {
      setDismissed(false);
    }
  }, [workspaceId, providerId]);

  const dismiss = useCallback(() => {
    setDismissed(true);
    try {
      window.localStorage.setItem(
        keyNudgeDismissedKey(workspaceId, providerId),
        "true"
      );
    } catch {
      // Hidden for this visit already.
    }
  }, [workspaceId, providerId]);

  return [dismissed, dismiss] as const;
}

// =====================================
// ⬢ One nudge
// =====================================
interface ApiKeyNudgeProps {
  provider: KeyProvider;
  onAddKey: () => void;
  onDismiss: () => void;
}

export default function ApiKeyNudge({
  provider,
  onAddKey,
  onDismiss,
}: ApiKeyNudgeProps) {
  return (
    <section
      aria-label={`${provider.name} key missing`}
      className="relative mb-4 overflow-hidden rounded-2xl border border-primary/50
        bg-primary-tint-50 dark:bg-dropdown-bg dark:border-primary/60
        px-5 py-4 sm:px-6 sm:py-5
        shadow-[0_0_0_4px_rgba(163,8,240,0.10)] dark:shadow-[0_0_0_4px_rgba(163,8,240,0.18)]"
    >
      {/* Only the glow pulses, so the text stays still and readable. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-primary/50 motion-safe:animate-pulse"
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* A key that will not stop blinking */}
        <div className="relative flex h-12 w-12 flex-none items-center justify-center">
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-primary/30 motion-safe:animate-ping"
          />
          <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
            <PiKey size={22} />
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-bold uppercase tracking-wide text-primary-700 dark:text-primary-300">
            {provider.title}
          </h3>
          <p className="mt-1 text-sm text-ink-400 dark:text-ink-200">
            {provider.body}{" "}
            <code className="rounded-md border border-border bg-white px-1.5 py-0.5 font-mono text-[0.8125em] text-ink-500 dark:border-border-tertiary dark:bg-page-surface dark:text-ink-200">
              {provider.varName}
            </code>
          </p>
        </div>

        <div className="flex flex-none flex-wrap items-center gap-2 sm:flex-col sm:items-stretch">
          <button
            type="button"
            onClick={onAddKey}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2
              text-sm font-medium text-white transition-colors duration-100 hover:bg-primary-710"
          >
            <PiKey size={15} />
            Add {provider.name} key
          </button>
          <div className="flex items-center justify-center gap-3 text-xs">
            <a
              href={provider.getKeyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-0.5 font-medium text-primary underline underline-offset-2 hover:text-primary-710"
            >
              Get a key
              <PiArrowUpRight size={12} />
            </a>
            <button
              type="button"
              onClick={onDismiss}
              className="text-ink-300 transition-colors hover:text-ink-100 dark:hover:text-white"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// =====================================
// ⬢ All of them, for the environment page
// =====================================
interface ApiKeyNudgesProps {
  workspaceId: string;
  variables: Pick<EnvVar, "name">[];
  added: Pick<EnvVar, "name">[];
  loading: boolean;
  isViewer: boolean;
  onAddKey: (varName: string) => void;
}

function ProviderNudge({
  provider,
  workspaceId,
  variables,
  added,
  loading,
  isViewer,
  onAddKey,
}: ApiKeyNudgesProps & { provider: KeyProvider }) {
  const [dismissed, dismiss] = useKeyNudgeDismissed(workspaceId, provider.id);

  if (
    !shouldShowKeyNudge(provider, {
      variables,
      added,
      loading,
      isViewer,
      dismissed,
    })
  ) {
    return null;
  }

  return (
    <ApiKeyNudge
      provider={provider}
      onAddKey={() => onAddKey(provider.varName)}
      onDismiss={dismiss}
    />
  );
}

export function ApiKeyNudges(props: ApiKeyNudgesProps) {
  return (
    <>
      {KEY_PROVIDERS.map(provider => (
        <ProviderNudge key={provider.id} provider={provider} {...props} />
      ))}
    </>
  );
}
