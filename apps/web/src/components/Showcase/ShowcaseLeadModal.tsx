"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@sandworm/ui/components/dialog";
import { useEffect, useState } from "react";

import { useShowcaseLead } from "@/hooks/useShowcaseLead";
import type { ShowcaseLeadKind, ShowcaseLeadTarget } from "@/types";

// =====================================
// ⬢  Constants
// =====================================
// Each kind of request asks its own question; the form is otherwise the same.
const COPY: Record<
  ShowcaseLeadKind,
  { title: string; description: string; submit: string; done: string }
> = {
  coverage: {
    title: "Request coverage",
    description:
      "Tell us which protocol to cover. We rank only what we can attribute on-chain with confidence, so a contract address helps.",
    submit: "Request coverage",
    done: "Got it. We will tell you when it is covered.",
  },
  report: {
    title: "Get this for your protocol",
    description:
      "We build the same page for your protocol, from your on-chain data. Tell us who you are and we will be in touch.",
    submit: "Request a report",
    done: "Got it. We will be in touch about your report.",
  },
  claim: {
    title: "Claim this page",
    description:
      "Work at this protocol? Claim the page to correct anything we got wrong, add context, and get the numbers behind it for your team.",
    submit: "Claim this page",
    done: "Got it. We will verify you and get back to you.",
  },
};

const inputClass =
  "w-full h-9 rounded-lg px-3 text-sm bg-inputBg dark:bg-header-surface border border-hover-border dark:border-border-dark text-ink-100 dark:text-white placeholder:text-ink-300 outline-none focus:border-primary";

// =====================================
// ⬢  Types
// =====================================
interface ShowcaseLeadModalProps {
  // What is being asked for. Null keeps the modal closed.
  target: ShowcaseLeadTarget | null;
  onClose: () => void;
}

// =====================================
// ⬢  ShowcaseLeadModal
// =====================================
export function ShowcaseLeadModal({ target, onClose }: ShowcaseLeadModalProps) {
  // State
  const [protocol, setProtocol] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const { submit, reset, loading, sent, error } = useShowcaseLead();

  // Derived
  const kind = target?.kind ?? "coverage";
  const copy = COPY[kind];
  const isClaim = kind === "claim";
  const protocolLocked = isClaim && !!target?.protocol;

  // A new target starts a new form.
  useEffect(() => {
    if (!target) return;
    setProtocol(target.protocol ?? "");
    reset();
  }, [target, reset]);

  // Handlers
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) return;
    submit({
      kind,
      category: target.category,
      notebookSlug: target.notebookSlug,
      protocol: protocol.trim(),
      email: email.trim() || undefined,
      company: company.trim() || undefined,
      role: role.trim() || undefined,
    });
  };

  return (
    <Dialog open={target !== null} onOpenChange={open => !open && onClose()}>
      <DialogContent className="bg-base-100 font-body border border-border-secondary dark:border-border-tertiary rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-ink-100 dark:text-white">
            {copy.title}
          </DialogTitle>
          <DialogDescription className="text-ink-400">
            {sent ? copy.done : copy.description}
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg px-4 text-sm font-medium bg-primary text-white hover:bg-primary-710 justify-self-end"
          >
            Done
          </button>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <input
              required
              disabled={protocolLocked}
              value={protocol}
              onChange={e => setProtocol(e.target.value)}
              placeholder="Protocol name or contract address"
              aria-label="Protocol name or contract address"
              className={`${inputClass} disabled:opacity-60`}
            />
            <input
              type="email"
              required={kind !== "coverage"}
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={
                kind === "coverage" ? "Work email (optional)" : "Work email"
              }
              aria-label="Work email"
              className={inputClass}
            />
            <input
              value={company}
              onChange={e => setCompany(e.target.value)}
              placeholder="Protocol or company"
              aria-label="Protocol or company"
              className={inputClass}
            />
            {isClaim && (
              <input
                value={role}
                onChange={e => setRole(e.target.value)}
                placeholder="Your role there"
                aria-label="Your role there"
                className={inputClass}
              />
            )}

            {error && <p className="text-xs text-error">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="h-9 rounded-lg px-4 text-sm font-medium bg-primary text-white hover:bg-primary-710 disabled:opacity-50 self-end"
            >
              {loading ? "Sending…" : copy.submit}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
