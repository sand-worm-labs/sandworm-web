"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { signOut } from "next-auth/react";
import { ArrowLeftRight, Check, Loader2 } from "lucide-react";
import clsx from "clsx";
import { PiCheck } from "react-icons/pi";

import { SandwormLogo } from "@/components/Assets";
import { Cautious } from "@/components/Assets/Cautious";
import { CaretUpDown } from "@/components/Assets/CaretUpDown";
import {
  useCurrentWorkspaceInfo,
  useWorkspaces,
} from "@/components/Editor/hooks/useWorkspaces";
import { useSession } from "@/components/Editor/hooks/useAuth";
import { WorkspaceIcon } from "@/components/Settings/WorkspaceIcon";
import { Spinner } from "@/components/Spinner/Spinner";
import { NEXT_PUBLIC_API_URL, PRIVACY_URL, TERMS_URL } from "@/utils/env";

// What the API tells us about the request, after re-validating the URL params.
type AuthorizeContext = {
  clientName: string | null;
  redirectHost: string;
  redirectProtocol: string;
};

const LOOPBACK_HOSTS = ["localhost", "127.0.0.1", "[::1]"];

// ⬢ Consent page for MCP clients (Claude Code, Cursor, ...). The API's
// GET /oauth/authorize validates the request and redirects here; Allow/Cancel
// posts back to /oauth/authorize/confirm, which returns where to send the user.
function AuthorizeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  const { user, loading: sessionLoading } = useSession({
    redirectToLogin: true,
  });
  const [{ data: workspaces, isLoading: workspacesLoading }] = useWorkspaces();
  const { workspaceInfo } = useCurrentWorkspaceInfo(!user);

  const [context, setContext] = useState<AuthorizeContext | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<"allow" | "deny" | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (sessionLoading || !user) return undefined;
    let cancelled = false;
    fetch(`${NEXT_PUBLIC_API_URL()}/oauth/authorize/context?${query}`, {
      credentials: "include",
    })
      .then(async res => {
        const body = await res.json().catch(() => null);
        if (cancelled) return;
        if (!res.ok) {
          setError(body?.error_description || "This request is not valid.");
          return;
        }
        setContext(body as AuthorizeContext);
      })
      .catch(() => {
        if (!cancelled) setError("We couldn't reach Sandworm. Try again.");
      });
    return () => {
      cancelled = true;
    };
  }, [sessionLoading, user, query]);

  // Default the picker to the workspace the user last used.
  useEffect(() => {
    if (selectedId || !workspaceInfo?.id) return;
    setSelectedId(workspaceInfo.id);
  }, [selectedId, workspaceInfo?.id]);

  const clientName = context?.clientName || "This app";
  const isRiskyRedirect = useMemo(() => {
    if (!context) return false;
    const hostname = context.redirectHost.replace(/:\d+$/, "");
    return (
      context.redirectProtocol === "http:" && !LOOPBACK_HOSTS.includes(hostname)
    );
  }, [context]);

  const submit = async (decision: "allow" | "deny") => {
    setSubmitting(decision);
    try {
      const res = await fetch(
        `${NEXT_PUBLIC_API_URL()}/oauth/authorize/confirm`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...Object.fromEntries(searchParams.entries()),
            decision,
            workspace_id: decision === "allow" ? selectedId : undefined,
          }),
        }
      );
      if (res.status === 401) {
        // Session expired while this page was open: sign in, then come back.
        router.replace(
          `/signin?callback=${encodeURIComponent(`/oauth/authorize?${query}`)}`
        );
        return;
      }
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.redirectTo) {
        setError(body?.error_description || "Something went wrong.");
        setSubmitting(null);
        return;
      }
      setDone(true);
      window.location.href = body.redirectTo;
    } catch {
      setError("We couldn't reach Sandworm. Try again.");
      setSubmitting(null);
    }
  };

  if (sessionLoading || !user || (!context && !error)) {
    return (
      <Screen>
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </Screen>
    );
  }

  if (error && !context) {
    return (
      <Screen>
        <div className="max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-xl bg-primary-tint-100 dark:bg-base-100 flex items-center justify-center mb-4">
            <Cautious />
          </div>
          <h1 className="text-xl font-medium font-body text-ink-100 dark:text-white">
            Can&apos;t connect this app
          </h1>
          <p className="text-ink-300 font-body font-medium">{error}</p>
        </div>
      </Screen>
    );
  }

  if (done) {
    return (
      <Screen>
        <div className="max-w-md w-full text-center space-y-2">
          <Loader2 className="w-6 h-6 mx-auto text-primary animate-spin" />
          <h1 className="text-xl font-medium font-body text-ink-100 dark:text-white pt-2">
            Returning to {clientName}
          </h1>
          <p className="text-ink-300 font-body font-medium text-sm">
            You can close this tab once {clientName} is connected.
          </p>
        </div>
      </Screen>
    );
  }

  const list = workspaces ?? [];

  return (
    <Screen>
      <div className="w-full max-w-md rounded-2xl border border-border-secondary dark:border-border-tertiary bg-base-100 p-6 sm:p-8">
        <div className="flex items-center justify-center gap-3">
          <SandwormLogo width="48" height="48" />
          <ArrowLeftRight className="w-4 h-4 text-ink-400" />
          <div
            aria-hidden
            className="w-12 h-12 rounded-xl bg-base-400 dark:bg-white text-white dark:text-black flex items-center justify-center text-lg font-medium font-body"
          >
            {clientName.charAt(0).toUpperCase()}
          </div>
        </div>

        <h1 className="mt-5 text-center text-xl font-medium font-body text-ink-100 dark:text-white">
          Connect {clientName} to Sandworm
        </h1>
        <p className="mt-1 text-center text-sm font-medium font-body text-ink-200">
          Signed in as {user.email || user.name}.{" "}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: window.location.href })}
            className="text-accent dark:text-primary hover:underline"
          >
            Not you?
          </button>
        </p>

        <section className="mt-6">
          <h2 className="text-sm font-medium font-body text-ink-100 dark:text-white">
            Default workspace
          </h2>
          <div className="mt-2">
            {workspacesLoading && list.length === 0 ? (
              <div className="h-12 rounded-[10px] bg-base-300 dark:bg-base-700 animate-pulse" />
            ) : (
              <WorkspacePicker
                workspaces={list}
                selectedId={selectedId}
                onChange={setSelectedId}
              />
            )}
          </div>
          <p className="mt-2 text-xs font-body text-ink-400">
            Used when {clientName} doesn&apos;t name a workspace.
          </p>
        </section>

        <section className="mt-6">
          <h2 className="text-sm font-medium font-body text-ink-100 dark:text-white">
            {clientName} will be able to
          </h2>
          <ul className="mt-2 space-y-2">
            {[
              "Create, edit and run notebooks",
              "Read your data source schemas and run results",
              "Upload files and publish notebooks",
            ].map(item => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm font-body text-ink-200"
              >
                <Check className="w-4 h-4 mt-0.5 shrink-0 text-accent dark:text-primary" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs font-body text-ink-400">
            It acts with your access, across all your workspaces.
          </p>
        </section>

        <p
          className={clsx(
            "mt-6 text-xs font-body",
            isRiskyRedirect
              ? "rounded-lg border border-red-200 bg-red-50 p-3 text-error"
              : "text-ink-400"
          )}
        >
          {isRiskyRedirect
            ? `Unencrypted redirect to ${context!.redirectHost}. Only continue if you trust this address.`
            : `You'll be sent back to ${context!.redirectHost}.`}
        </p>

        {error && (
          <p className="mt-3 w-full text-sm bg-red-50 text-error border border-red-200 rounded-md p-3">
            {error}
          </p>
        )}

        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            disabled={submitting !== null || !selectedId}
            onClick={() => submit("allow")}
            className="w-full rounded-3xl bg-base-400 hover:opacity-85 dark:bg-white dark:text-black px-4 py-3.5 text-white font-medium disabled:bg-disabled text-sm font-body flex items-center justify-center gap-2"
          >
            {submitting === "allow" && <Spinner />}
            Allow access
          </button>
          <button
            type="button"
            disabled={submitting !== null}
            onClick={() => submit("deny")}
            className="w-full rounded-3xl border border-border dark:border-border-tertiary px-4 py-3.5 text-ink-100 dark:text-white font-medium text-sm font-body hover:bg-dropdown-hover disabled:opacity-60"
          >
            Cancel
          </button>
        </div>

        <p className="mt-5 text-center text-xs text-ink-400 font-body">
          By continuing you agree to our{" "}
          <a href={TERMS_URL()} className="underline">
            Terms
          </a>{" "}
          and{" "}
          <a href={PRIVACY_URL()} className="underline">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </Screen>
  );
}

// "PRO" -> "Pro Plan", like the plan line under the workspace in Notion's picker.
const planLabel = (plan: unknown) => {
  const value = String(plan ?? "").toLowerCase();
  return value
    ? `${value.charAt(0).toUpperCase()}${value.slice(1)} Plan`
    : null;
};

type PickerWorkspace = {
  id: string;
  name: string;
  icon?: string | null;
  plan?: unknown;
};

// Dropdown in the style of the sidebar WorkspaceSwitcher (same trigger and row
// look) but selection only: no settings or "create workspace" actions, which
// don't belong on a consent screen.
function WorkspacePicker({
  workspaces,
  selectedId,
  onChange,
}: {
  workspaces: PickerWorkspace[];
  selectedId: string | null;
  onChange: (id: string) => void;
}) {
  const selected = workspaces.find(w => w.id === selectedId) ?? workspaces[0];
  if (!selected) return null;

  const triggerBody = (
    <>
      <WorkspaceIcon icon={selected.icon} size={28} className="rounded-lg" />
      <span className="flex-1 min-w-0 text-left">
        <span className="block text-sm font-medium font-body text-ink-100 dark:text-white truncate capitalize">
          {selected.name}
        </span>
        {planLabel(selected.plan) && (
          <span className="block text-xs font-body text-ink-400 truncate">
            {planLabel(selected.plan)}
          </span>
        )}
      </span>
    </>
  );
  const triggerClass =
    "w-full flex items-center gap-3 px-3 py-2 rounded-[10px] border border-border-secondary dark:border-border-tertiary bg-base-100";

  // Nothing to choose between: show it, but not as a control.
  if (workspaces.length === 1) {
    return <div className={triggerClass}>{triggerBody}</div>;
  }

  return (
    <Listbox value={selected.id} onChange={onChange}>
      <div className="relative">
        <ListboxButton
          className={clsx(
            triggerClass,
            "focus:outline-none focus:ring-2 focus:ring-primary/40"
          )}
        >
          {triggerBody}
          <CaretUpDown className="text-[#1C3B5A] dark:text-white" />
        </ListboxButton>
        <ListboxOptions
          transition
          className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-60 overflow-auto py-1.5 rounded-xl border border-border-secondary dark:border-border-tertiary bg-white dark:bg-dropdown-bg shadow-lg focus:outline-none transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
        >
          {workspaces.map(workspace => (
            <ListboxOption
              key={workspace.id}
              value={workspace.id}
              className="flex items-center gap-2.5 mx-1.5 px-2 py-1.5 rounded-[10px] border border-transparent cursor-pointer transition-colors duration-100 data-[focus]:bg-hover-bg dark:data-[focus]:bg-dropdown-hover data-[focus]:border-hover-border"
            >
              <WorkspaceIcon
                icon={workspace.icon}
                size={24}
                className="rounded-lg"
              />
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-medium font-body text-ink-100 dark:text-white truncate capitalize">
                  {workspace.name}
                </span>
                {planLabel(workspace.plan) && (
                  <span className="block text-xs font-body text-ink-400 truncate">
                    {planLabel(workspace.plan)}
                  </span>
                )}
              </span>
              {workspace.id === selected.id && (
                <span
                  className="shrink-0 w-5 h-5 rounded-full border border-accent-violet flex items-center justify-center"
                  aria-hidden
                >
                  <PiCheck size={12} className="text-accent-violet" />
                </span>
              )}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-page-surface">
      {children}
    </div>
  );
}

export default function AuthorizePage() {
  return (
    <Suspense
      fallback={
        <Screen>
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </Screen>
      }
    >
      <AuthorizeContent />
    </Suspense>
  );
}
