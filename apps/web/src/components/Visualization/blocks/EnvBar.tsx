import {
  ArrowPathIcon,
  CodeBracketIcon,
  CpuChipIcon,
  FolderIcon,
} from "@heroicons/react/20/solid";
import { NewspaperIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import * as dfns from "date-fns";
import clsx from "clsx";

import type { EnvironmentStatus } from "@/types";

import { useStringQuery } from "../hooks/useQueryArgs";
import { useEnvironmentStatus } from "../hooks/useEnvironmentStatus";

const EnvironmentButton = ({
  name,
  workspaceId,
}: {
  name: string;
  workspaceId: string;
}) => {
  return (
    <Link
      href={`/workspace/${workspaceId}/environments/current`}
      className="border border-border-secondary dark:border-border-tertiary  rounded-sm text-sm px-3 py-1 hover:bg-gray-50 cursor-pointer flex items-center gap-x-2"
    >
      <CpuChipIcon className="h-4 w-4 text-ink-400" />
      <span className="text-ink-400">{name}</span>
    </Link>
  );
};

type BadgeProps = {
  children: React.ReactNode;
};

const LoadingBadge = ({ children }: BadgeProps) => {
  return (
    <span className="inline-flex items-center gap-x-1.5 rounded-full bg-blue-100 dark:bg-base-200 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-400">
      <svg
        className="h-1.5 w-1.5 fill-blue-500"
        viewBox="0 0 6 6"
        aria-hidden="true"
      >
        {" "}
        <circle cx={3} cy={3} r={3} />{" "}
      </svg>
      <span className="text-xs">{children}</span>
    </span>
  );
};

const RedBadge = ({ children }: BadgeProps) => {
  return (
    <span className="inline-flex items-center gap-x-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
      <svg
        className="h-1.5 w-1.5 fill-red-500"
        viewBox="0 0 6 6"
        aria-hidden="true"
      >
        {" "}
        <circle cx={3} cy={3} r={3} />{" "}
      </svg>
      <span className="text-xs">{children}</span>
    </span>
  );
};

const GrayBadge = ({ children }: BadgeProps) => {
  return (
    <span className="inline-flex items-center gap-x-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
      <svg
        className="h-1.5 w-1.5 fill-gray-400"
        viewBox="0 0 6 6"
        aria-hidden="true"
      >
        <circle cx={3} cy={3} r={3} />
      </svg>
      <span className="text-xs">{children}</span>
    </span>
  );
};

const GreenBadge = ({ children }: BadgeProps) => {
  return (
    <span className="inline-flex items-center gap-x-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
      <svg
        className="h-1.5 w-1.5 fill-green-500"
        viewBox="0 0 6 6"
        aria-hidden="true"
      >
        <circle cx={3} cy={3} r={3} />
      </svg>
      <span className="text-xs">{children}</span>
    </span>
  );
};

const YellowBadge = ({ children }: BadgeProps) => {
  return (
    <span className="inline-flex items-center gap-x-1.5 rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
      <svg
        className="h-1.5 w-1.5 fill-yellow-500"
        viewBox="0 0 6 6"
        aria-hidden="true"
      >
        <circle cx={3} cy={3} r={3} />
      </svg>
      <span className="text-xs">{children}</span>
    </span>
  );
};

const StatusBadge = ({
  loading,
  status,
  onRestart,
  canRestart,
}: {
  loading: boolean;
  status: EnvironmentStatus | null;
  onRestart: () => void;
  canRestart: boolean;
}) => {
  if (loading) {
    return <LoadingBadge>Loading</LoadingBadge>;
  }

  switch (status) {
    case "Starting":
      return <YellowBadge>Starting</YellowBadge>;
    case "Running":
      return (
        <GreenBadge>
          <div className="flex items-center gap-x-2">
            <div>Running</div>
            {canRestart && (
              <>
                <div className="w-[1px] h-4 bg-green-700 opacity-50" />
                <div className="flex items-center group relative">
                  <button
                    type="button"
                    onClick={onRestart}
                    className="text-green-700 hover:text-green-900"
                  >
                    <ArrowPathIcon className="h-3 w-3" />
                  </button>
                  <div className="right-0 font-body  pointer-events-none absolute -top-2 -translate-y-full w-max opacity-0 transition-opacity group-hover:opacity-100 bg-hunter-950 text-white text-xs p-2 rounded-md flex items-center justify-center gap-y-1">
                    Restart environment
                  </div>
                </div>
              </>
            )}
          </div>
        </GreenBadge>
      );
    case "Stopped":
      return <GrayBadge>Stopped</GrayBadge>;
    case "Stopping":
      return <YellowBadge>Stopping</YellowBadge>;
    case "Failing":
      return <RedBadge>Failing</RedBadge>;
    default:
      return <GrayBadge>Stopped</GrayBadge>;
  }
};

interface Props {
  onOpenFiles: () => void;
  publishedAt: string | null;
  lastUpdatedAt: string | null;
  isViewer: boolean;
}
function EnvBar(props: Props) {
  const workspaceId = useStringQuery("workspace");
  const { status, loading, restart } = useEnvironmentStatus(workspaceId);

/*   console.dir({ status, loading, restart });
 */  const publishedAtDisplay = dfns.formatDistanceToNow(
    props.publishedAt ?? new Date()
  );

  const lastUpdatedAt = props.lastUpdatedAt
    ? `Last updated at ${dfns.format(
        props.lastUpdatedAt ?? new Date(),
        `hh:mm a, do 'of' MMMM yyyy`
      )}.`
    : "Never executed.";

  return (
    <div
      className={clsx(
        "flex items-center justify-between border-t border-border-secondary dark:border-border-tertiary py-2 px-4 font-body  env-bar ",
        props.publishedAt && "bg-gray-50 dark:bg-base-100 "
      )}
    >
      <div className="flex items-center space-x-2">
        {props.publishedAt ? (
          <div className="flex items-center gap-x-1.5 text-sm text-ink-400 font-medium">
            <NewspaperIcon className="h-4 w-4" />
            <span>{`Saved ${publishedAtDisplay} ago. ${lastUpdatedAt}`}</span>
          </div>
        ) : (
          <>
            <div>
              <EnvironmentButton name="Python 3.9" workspaceId={workspaceId} />
            </div>
            <div className={clsx(props.isViewer ? "hidden" : "")}>
              <Link
                href={`/workspaces/${workspaceId}/environments/current/variables`}
                className="border border-border-secondary dark:border-border-tertiary  rounded-sm text-sm px-3 py-1 hover:bg-gray-50 cursor-pointer flex items-center gap-x-2"
              >
                <CodeBracketIcon className="h-4 w-4 text-ink-400" />
                <span className="text-ink-400">Environment variables</span>
              </Link>
            </div>
            <button
              type="button"
              className={clsx(
                props.isViewer ? "hidden" : "",
                "border border-border-secondary dark:border-border-tertiary  rounded-sm text-sm px-3 py-1 hover:bg-gray-50 cursor-pointer flex items-center gap-x-2"
              )}
              onClick={props.onOpenFiles}
            >
              <FolderIcon className="h-4 w-4 text-ink-400" />
              <span className="text-ink-400">Files</span>
            </button>
          </>
        )}
      </div>
      <div className="flex items-center">
        <StatusBadge
          loading={loading}
          status={status}
          onRestart={restart}
          canRestart={!props.isViewer}
        />
      </div>
    </div>
  );
}

export default EnvBar;
