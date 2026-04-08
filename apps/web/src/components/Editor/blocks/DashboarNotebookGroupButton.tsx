import React from "react";
import { Squares2X2Icon, BookOpenIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import clsx from "clsx";
import { useRouter } from "next/navigation";

import { Tooltip } from "./ToolTips";

interface Props {
  workspaceId: string;
  documentId: string;
  current: "notebook" | "dashboard";
  isEditing: boolean;
  isPublished: boolean;
  userRole: string;
}

// =====================================
// ⬢ Dashboard Notebook Group Button
// =====================================
function DashboardNotebookGroupButton(props: Props) {
  const router = useRouter();

  const isDashboardButtonDisabled =
    props.userRole === "viewer" && !props.isPublished;

  return (
    <div className="flex items-center px-2 relative">
      <Link
        className={clsx(
          "flex gap-x-1.5 items-center rounded-l-sm px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50 ring-1 ring-inset ring-gray-300 dark:ring-border-tertiary hover:bg-ceramic-50",
          props.current === "notebook"
            ? "bg-white dark:bg-base-600 dark:text-white text-ink-400  -mr-px"
            : "bg-ceramic-50 text-ink-100 dark:text-ink-400"
        )}
        href={`/workspace/${props.workspaceId}/documents/${
          props.documentId
        }/notebook${props.isEditing ? "/edit" : ""}`}
      >
        <BookOpenIcon className="w-4 h-4" />
        <span>Notebook</span>
      </Link>
      <Tooltip
        title="This page has not been saved"
        message="Ask an editor to save this page to view the dashboard."
        className="flex"
        tooltipClassname="w-56"
        position="bottom"
        active={isDashboardButtonDisabled}
      >
        <button
          type="button"
          id="dashboard-view-button"
          className={clsx(
            "flex gap-x-1.5 items-center rounded-r-sm px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50 ring-1 ring-inset ring-gray-300 hover:bg-ceramic-50 dark:ring-border-tertiary",
            props.current === "dashboard"
              ? "bg-white dark:bg-base-600 dark:text-white text-ink-400 -ml-px"
              : "bg-ceramic-50 text-ink-100 dark:text-ink-400"
          )}
          disabled={isDashboardButtonDisabled}
          onClick={() => {
            router.push(
              `/workspace/${props.workspaceId}/documents/${
                props.documentId
              }/dashboard${props.isEditing ? "/edit" : ""}`
            );
          }}
        >
          <Squares2X2Icon className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
      </Tooltip>
    </div>
  );
}

export default DashboardNotebookGroupButton;
