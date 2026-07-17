"use client";

import { useState } from "react";

type AccessStatus = "viewing" | "sent" | "pending" | "approved";

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
          x="2"
          y="6"
          width="10"
          height="7"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.2"
          className="text-inputBg"
        />
        <path
          d="M4.5 6V4.5a2.5 2.5 0 015 0V6"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          className="text-inputBg"
        />
        <circle
          cx="7"
          cy="9.5"
          r="1"
          fill="currentColor"
          className="text-inputBg"
        />
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
        className="shrink-0 text-inputBg"
      >
        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
        <path
          d="M4.5 7l2 2 3-3"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (status === "pending") {
    return (
      <span
        className="flex items-center gap-[3px]"
        aria-label="Waiting for approval"
      >
        {[0, 1, 2].map(i => (
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

const LABEL: Record<AccessStatus, string> = {
  viewing: "You're viewing this notebook",
  sent: "Request sent",
  pending: "Waiting for approval",
  approved: "",
};

interface ViewerAccessBarProps {
  onRequestAccess: () => Promise<void>;
  status: AccessStatus;
}

export function ViewerAccessBar({
  onRequestAccess,
  status,
}: ViewerAccessBarProps) {
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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 font-body">
      <div
        className={[
          "flex items-center gap-3 rounded-full px-4 py-2.5 text-sm",
          "bg-base-400 ",
          "border transition-colors duration-300",
          status === "sent" || status === "pending"
            ? "border-violet-500/30"
            : "border-white/[0.06]",
        ].join(" ")}
      >
        <StatusIcon status={status} />

        <span
          className={[
            "tracking-wide transition-colors duration-300 whitespace-nowrap font-body text-[12.5px]",
            status === "sent" ? "text-inputBg" : "",
            status === "pending" ? "text-zinc-600" : "",
            status === "viewing" ? "text-inputBg" : "",
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
              "rounded-full bg-inputBg border border-border",
              "px-3.5 py-1 font-body text-[11.5px] font-medium text-ink-500",
              "transition-colors duration-200",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50",
            ].join(" ")}
          >
            Ask to edit
          </button>
        )}
      </div>
    </div>
  );
}
