import { PiArrowsClockwise, PiNewspaper } from "react-icons/pi";
import * as dfns from "date-fns";

import type { EnvironmentStatus } from "@/types";

import { useStringQuery } from "../hooks/useQueryArgs";
import {
  useEnvironmentStatus,
  useIsBrowserRuntime,
} from "../hooks/useEnvironmentStatus";

// =====================================
// ⬢ Status Badge
// =====================================

interface DotBadgeProps {
  color: "blue" | "green" | "red" | "yellow" | "gray";
  children: React.ReactNode;
  onRestart?: () => void;
  canRestart?: boolean;
  // What restarting does, for the button's tooltip.
  restartLabel?: string;
  // Shown on hover over the whole badge, e.g. why it's failing.
  title?: string;
}

const STATUS_COLORS: Record<
  DotBadgeProps["color"],
  { dot: string; text: string; bg: string }
> = {
  blue: {
    dot: "bg-blue-400",
    text: "text-blue-700 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-500/10",
  },
  green: {
    dot: "bg-green-500",
    text: "text-green-700 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-500/10",
  },
  red: {
    dot: "bg-red-500",
    text: "text-red-700 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-500/10",
  },
  yellow: {
    dot: "bg-yellow-500",
    text: "text-yellow-800 dark:text-yellow-400",
    bg: "bg-yellow-50 dark:bg-yellow-500/10",
  },
  gray: {
    dot: "bg-gray-400",
    text: "text-gray-600 dark:text-gray-400",
    bg: "bg-gray-100 dark:bg-header-surface",
  },
};

function DotBadge({
  color,
  children,
  onRestart,
  canRestart,
  restartLabel = "Restart environment",
  title,
}: DotBadgeProps) {
  const c = STATUS_COLORS[color];
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1
        text-xs font-medium ${c.bg} ${c.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      {children}
      {canRestart && onRestart && (
        <>
          <span className="w-px h-3 bg-current opacity-30" />
          <div className="relative group">
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onRestart();
              }}
              aria-label={restartLabel}
              className="flex items-center opacity-70 hover:opacity-100 transition-opacity"
            >
              <PiArrowsClockwise size={12} />
            </button>
            <div
              className="pointer-events-none absolute right-0 -top-1 -translate-y-full
              w-max bg-hunter-950 text-white text-[10px] px-2 py-1 rounded-md
              opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {restartLabel}
            </div>
          </div>
        </>
      )}
    </span>
  );
}

function StatusBadge({
  loading,
  status,
  where,
  error,
  onRestart,
  canRestart,
}: {
  loading: boolean;
  status: EnvironmentStatus | null;
  // Where the notebook runs, so the status always says which it is.
  where: "Cloud" | "Browser";
  error: string | null;
  onRestart: () => void;
  canRestart: boolean;
}) {
  if (loading) return <DotBadge color="blue">{where} · Loading</DotBadge>;

  // Restarting is offered wherever it can help: while running, and above all
  // once it has failed or stopped, when it's the only way back.
  const restartable = {
    onRestart,
    canRestart,
    restartLabel:
      where === "Browser"
        ? "Restart Python. Clears variables, then re-runs the notebook"
        : "Restart environment",
  };

  switch (status) {
    case "Starting":
      return <DotBadge color="yellow">{where} · Starting</DotBadge>;
    case "Running":
      return (
        <DotBadge color="green" {...restartable}>
          {where} · Running
        </DotBadge>
      );
    case "Stopping":
      return <DotBadge color="yellow">{where} · Stopping</DotBadge>;
    case "Failing":
      return (
        <DotBadge color="red" title={error ?? undefined} {...restartable}>
          {where} · Failing
        </DotBadge>
      );
    case "Stopped":
    default:
      return (
        <DotBadge color="gray" {...restartable}>
          {where} · Stopped
        </DotBadge>
      );
  }
}

// =====================================
// ⬢ EnvBar
// =====================================
interface Props {
  publishedAt: string | null;
  lastUpdatedAt: string | null;
  isViewer: boolean;
}

function EnvBar(props: Props) {
  const workspaceId = useStringQuery("workspace");
  const { status, loading, error, restart } = useEnvironmentStatus(workspaceId);
  const where = useIsBrowserRuntime() ? "Browser" : "Cloud";

  const publishedAtDisplay = dfns.formatDistanceToNow(
    props.publishedAt ?? new Date()
  );
  const lastUpdatedAt = props.lastUpdatedAt
    ? `Last updated ${dfns.format(props.lastUpdatedAt ?? new Date(), `hh:mm a, do 'of' MMMM yyyy`)}.`
    : "Never executed.";

  return (
    <div
      className="flex items-center justify-between
      border-none border-border-secondary dark:border-base-700
      py-2 px-3 font-body env-bar"
    >
      <div className="flex items-center gap-1.5">
        {props.publishedAt && (
          <div className="flex items-center gap-1.5 text-sm text-ink-400 dark:text-ink-500">
            <PiNewspaper size={14} />
            <span>{`Saved ${publishedAtDisplay} ago. ${lastUpdatedAt}`}</span>
          </div>
        )}
      </div>

      <StatusBadge
        loading={loading}
        status={status}
        where={where}
        error={error}
        onRestart={restart}
        // The browser kernel belongs to this tab, so anyone can restart their
        // own; the cloud environment is shared, so viewers can't.
        canRestart={where === "Browser" || !props.isViewer}
      />
    </div>
  );
}

export default EnvBar;
