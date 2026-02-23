"use client";

import { useState } from "react";

type AccessStatus = "viewing" | "sent" | "pending" | "approved";

interface ViewerAccessBarProps {
  /** Called when the user clicks "Request access". Wire up your API/WebSocket call here. */
  onRequestAccess: () => Promise<void>;
  /** Drive the status externally (e.g. from a WebSocket event). */
  status: AccessStatus;
}

export function ViewerAccessBar({ onRequestAccess, status }: ViewerAccessBarProps) {
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    if (loading || status !== "viewing") return;
    setLoading(true);
    try {
      await onRequestAccess();
    } finally {
      setLoading(false);
    }
  };

  if (status === "approved") return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div
        className={[
          "flex items-center gap-3 rounded-full px-4 py-2.5 text-sm",
          "bg-[#16161d] shadow-[0_4px_24px_rgba(0,0,0,0.5)]",
          "border transition-colors duration-300",
          status === "sent" || status === "pending"
            ? "border-violet-500/30"
            : "border-white/[0.06]",
        ].join(" ")}
      >
        <StatusIcon status={status} />

        <span
          className={[
            "tracking-wide transition-colors duration-300 whitespace-nowrap font-mono text-[12.5px]",
            status === "sent" ? "text-violet-400" : "",
            status === "pending" ? "text-zinc-600" : "",
            status === "viewing" ? "text-zinc-500" : "",
          ].join(" ")}
        >
          {LABEL[status]}
        </span>

        {status === "viewing" && (
          <button
            type="button"
            onClick={handleRequest}
            disabled={loading}
            className={[
              "rounded-full border border-violet-500/30 bg-violet-500/10",
              "px-3.5 py-1 font-mono text-[11.5px] font-medium text-violet-400",
              "transition-colors duration-200",
              "hover:bg-violet-500/20 hover:border-violet-500/60",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50",
            ].join(" ")}
          >
            Request access
          </button>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusIcon({ status }: { status: AccessStatus }) {
  if (status === "viewing") {
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect
          x="2" y="6" width="10" height="7" rx="1.5"
          stroke="currentColor" strokeWidth="1.2"
          className="text-zinc-600"
        />
        <path
          d="M4.5 6V4.5a2.5 2.5 0 015 0V6"
          stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"
          className="text-zinc-600"
        />
        <circle cx="7" cy="9.5" r="1" fill="currentColor" className="text-zinc-600" />
      </svg>
    );
  }

  if (status === "sent") {
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden="true"
        className="shrink-0 text-violet-400"
      >
        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
        <path
          d="M4.5 7l2 2 3-3"
          stroke="currentColor" strokeWidth="1.3"
          strokeLinecap="round" strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (status === "pending") {
    return (
      <span className="flex items-center gap-[3px]" aria-label="Waiting for approval">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{ animationDelay: `${i * 0.18}s` }}
            className="h-1 w-1 rounded-full bg-zinc-600 animate-pulse"
          />
        ))}
      </span>
    );
  }

  return null;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const LABEL: Record<AccessStatus, string> = {
  viewing: "You're viewing this notebook",
  sent: "Request sent",
  pending: "Waiting for approval",
  approved: "",
};