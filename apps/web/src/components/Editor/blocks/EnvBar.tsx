import {
  PiArrowsClockwise,
  PiCode,
  PiCpuLight,
  PiFolder,
  PiNewspaper,
} from "react-icons/pi";
import Link from "next/link";
import * as dfns from "date-fns";

import type { EnvironmentStatus } from "@/types";

import { useStringQuery } from "../hooks/useQueryArgs";
import { useEnvironmentStatus } from "../hooks/useEnvironmentStatus";

// =====================================
// ⬢ Environment Button
// =====================================
const EnvironmentButton = ({
  name,
  workspaceId,
}: {
  name: string;
  workspaceId: string;
}) => (
  <Link
    href={`/workspace/${workspaceId}/environments/current`}
    className="flex items-center gap-2 px-2.5 py-1.5
      border border-border dark:border-border-tertiary bg-transparent dark:bg-header-surface
      rounded-lg text-sm text-ink-400 dark:text-ink-300
      hover:bg-hover-bg hover:border-primary dark:hover:bg-base-700
      hover:text-ink-500 dark:hover:text-ink-300
      transition-colors duration-100"
  >
    <PiCpuLight size={14} />
    <span>{name}</span>
  </Link>
);

// =====================================
// ⬢ Status Badge
// =====================================

interface DotBadgeProps {
  color: "blue" | "green" | "red" | "yellow" | "gray";
  children: React.ReactNode;
  onRestart?: () => void;
  canRestart?: boolean;
}

const STATUS_COLORS: Record<
  DotBadgeProps["color"],
  { dot: string; text: string; bg: string }
> = {
  blue: {
    dot: "bg-blue-400",
    text: "text-blue-700 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-base-200",
  },
  green: { dot: "bg-green-500", text: "text-green-700", bg: "bg-green-50" },
  red: { dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50" },
  yellow: { dot: "bg-yellow-500", text: "text-yellow-800", bg: "bg-yellow-50" },
  gray: {
    dot: "bg-gray-400",
    text: "text-gray-600",
    bg: "bg-gray-100 dark:bg-base-200",
  },
};

function DotBadge({ color, children, onRestart, canRestart }: DotBadgeProps) {
  const c = STATUS_COLORS[color];
  return (
    <span
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
              onClick={onRestart}
              aria-label="Restart environment"
              className="flex items-center opacity-70 hover:opacity-100 transition-opacity"
            >
              <PiArrowsClockwise size={12} />
            </button>
            <div
              className="pointer-events-none absolute right-0 -top-1 -translate-y-full
              w-max bg-hunter-950 text-white text-[10px] px-2 py-1 rounded-md
              opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Restart environment
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
  onRestart,
  canRestart,
}: {
  loading: boolean;
  status: EnvironmentStatus | null;
  onRestart: () => void;
  canRestart: boolean;
}) {
  if (loading) return <DotBadge color="blue">Loading</DotBadge>;

  switch (status) {
    case "Starting":
      return <DotBadge color="yellow">Starting</DotBadge>;
    case "Running":
      return (
        <DotBadge color="green" onRestart={onRestart} canRestart={canRestart}>
          Running
        </DotBadge>
      );
    case "Stopped":
      return <DotBadge color="gray">Stopped</DotBadge>;
    case "Stopping":
      return <DotBadge color="yellow">Stopping</DotBadge>;
    case "Failing":
      return <DotBadge color="red">Failing</DotBadge>;
    default:
      return <DotBadge color="gray">Stopped</DotBadge>;
  }
}

// =====================================
// ⬢ EnvBar
// =====================================
interface Props {
  onOpenFiles: () => void;
  publishedAt: string | null;
  lastUpdatedAt: string | null;
  isViewer: boolean;
}

function EnvBar(props: Props) {
  const workspaceId = useStringQuery("workspace");
  const { status, loading, restart } = useEnvironmentStatus(workspaceId);

  const publishedAtDisplay = dfns.formatDistanceToNow(
    props.publishedAt ?? new Date()
  );
  const lastUpdatedAt = props.lastUpdatedAt
    ? `Last updated ${dfns.format(props.lastUpdatedAt ?? new Date(), `hh:mm a, do 'of' MMMM yyyy`)}.`
    : "Never executed.";

  return (
    <div
      className="flex items-center justify-between
      border-t border-border-secondary dark:border-base-700
      py-2 px-3 font-body env-bar"
    >
      <div className="flex items-center gap-1.5">
        {props.publishedAt ? (
          <div className="flex items-center gap-1.5 text-sm text-ink-400 dark:text-ink-500">
            <PiNewspaper size={14} />
            <span>{`Saved ${publishedAtDisplay} ago. ${lastUpdatedAt}`}</span>
          </div>
        ) : (
          <>
            <EnvironmentButton name="Python 3.9" workspaceId={workspaceId} />

            {!props.isViewer && (
              <Link
                href={`/workspace/${workspaceId}/environments/current/variables`}
                className="flex items-center gap-2 px-2.5 py-1.5
                  border border-border dark:border-border-tertiary bg-transparent dark:bg-header-surface
                  rounded-lg text-sm text-ink-400 dark:text-ink-300
                  hover:bg-hover-bg hover:border-primary dark:hover:bg-base-700
                  hover:text-ink-500 dark:hover:text-ink-300
                  transition-colors duration-100"
              >
                <PiCode size={14} />
                <span>Env variables</span>
              </Link>
            )}

            {!props.isViewer && (
              <button
                type="button"
                onClick={props.onOpenFiles}
                className="flex items-center gap-2 px-2.5 py-1.5
                  border border-border dark:border-border-tertiary bg-transparent dark:bg-header-surface
                  rounded-lg text-sm text-ink-400 dark:text-ink-300
                  hover:bg-hover-bg hover:border-primary dark:hover:bg-base-700
                  hover:text-ink-500 dark:hover:text-ink-300
                  transition-colors duration-100"
              >
                <PiFolder size={14} />
                <span>Files</span>
              </button>
            )}
          </>
        )}
      </div>

      <StatusBadge
        loading={loading}
        status={status}
        onRestart={restart}
        canRestart={!props.isViewer}
      />
    </div>
  );
}

export default EnvBar;
