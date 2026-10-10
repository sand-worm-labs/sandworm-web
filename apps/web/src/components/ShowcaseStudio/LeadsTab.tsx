"use client";

import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";

import { attempt, Notice, quietButton, type NoticeState } from "./kit";
import type { StudioLead, StudioNotebook } from "./useShowcaseStudio";

// =====================================
// ⬢  Constants
// =====================================
const KIND_LABEL: Record<StudioLead["kind"], string> = {
  coverage: "Coverage",
  report: "Report",
  claim: "Claim",
};

type Filter = "all" | StudioLead["kind"];

// =====================================
// ⬢  Utils
// =====================================
const when = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

// Where the lead came from, in a few words.
const sourceOf = (lead: StudioLead) =>
  [lead.source?.utm_source, lead.source?.utm_campaign]
    .filter(Boolean)
    .join(" / ");

// =====================================
// ⬢  LeadsTab
// =====================================
export function LeadsTab({
  leads,
  notebooks,
  onApprove,
}: {
  leads: StudioLead[];
  notebooks: StudioNotebook[];
  onApprove: (leadId: string) => Promise<unknown>;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [notice, setNotice] = useState<NoticeState>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const claimed = useMemo(
    () =>
      new Set(
        notebooks
          .filter(notebook => notebook.showcase?.claimed)
          .map(notebook => notebook.slug)
      ),
    [notebooks]
  );
  const visible = leads.filter(
    lead => filter === "all" || lead.kind === filter
  );

  const approve = async (lead: StudioLead) => {
    setBusyId(lead.id);
    setNotice(
      await attempt(() => onApprove(lead.id), `Approved ${lead.protocol}`)
    );
    setBusyId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-1.5">
        {(["all", "coverage", "report", "claim"] as const).map(item => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            aria-pressed={filter === item}
            className={cn(
              "h-7 rounded-full border px-3 text-xs capitalize transition-colors",
              filter === item
                ? "border-ink-100 bg-ink-100 text-white dark:border-white dark:bg-white dark:text-ink-100"
                : "border-border-secondary dark:border-border-tertiary text-ink-400 hover:text-ink-100 dark:hover:text-white"
            )}
          >
            {item}
          </button>
        ))}
        <span className="ml-2 text-xs text-ink-300">
          {visible.length} leads
        </span>
        <Notice notice={notice} />
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-ink-300">No leads yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border-secondary dark:border-border-tertiary">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border-secondary text-xs uppercase tracking-wide text-ink-300 dark:border-border-tertiary">
              <tr>
                <th className="px-4 py-2 font-medium">When</th>
                <th className="px-4 py-2 font-medium">Ask</th>
                <th className="px-4 py-2 font-medium">Protocol</th>
                <th className="px-4 py-2 font-medium">Who</th>
                <th className="px-4 py-2 font-medium">From</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border-secondary dark:divide-border-tertiary">
              {visible.map(lead => {
                const done =
                  !!lead.notebookSlug && claimed.has(lead.notebookSlug);
                return (
                  <tr
                    key={lead.id}
                    className="align-top text-ink-100 dark:text-white"
                  >
                    <td className="px-4 py-3 text-ink-400">
                      {when(lead.createdAt)}
                    </td>
                    <td className="px-4 py-3">{KIND_LABEL[lead.kind]}</td>
                    <td className="px-4 py-3">
                      {lead.protocol}
                      {lead.category && (
                        <span className="block text-xs text-ink-300">
                          {lead.category}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {lead.email ? (
                        <a
                          href={`mailto:${lead.email}`}
                          className="hover:text-primary"
                        >
                          {lead.email}
                        </a>
                      ) : (
                        <span className="text-ink-300">No email</span>
                      )}
                      <span className="block text-xs text-ink-300">
                        {[lead.company, lead.role].filter(Boolean).join(" · ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-300">
                      {sourceOf(lead) || "Direct"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {lead.kind === "claim" &&
                        lead.notebookSlug &&
                        (done ? (
                          <span className="text-xs text-emerald-600 dark:text-emerald-400">
                            Approved
                          </span>
                        ) : (
                          <button
                            type="button"
                            className={quietButton}
                            disabled={busyId === lead.id}
                            onClick={() => approve(lead)}
                          >
                            Approve claim
                          </button>
                        ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
