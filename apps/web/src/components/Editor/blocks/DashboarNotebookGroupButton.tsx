import React from "react";
import Link from "next/link";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { PiNotebook, PiSquaresFour } from "react-icons/pi";

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
          "flex gap-x-1.5 items-center rounded-l-sm px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50 ring-1 ring-inset ring-gray-300 dark:ring-border-tertiary hover:bg-[#F5F3FF]",
          props.current === "notebook"
            ? "bg-accent/10 dark:bg-base-600 dark:text-[#9D8FF0] text-accent -mr-px"
            : "bg-white text-ink-400 dark:bg-transparent dark:text-ink-400"
        )}
        href={`/workspace/${props.workspaceId}/documents/${props.documentId}/notebook${props.isEditing ? "/edit" : ""}`}
      >
        <PiNotebook className="w-4 h-4 shrink-0" />
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
            "flex gap-x-1.5 items-center rounded-r-sm px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50 ring-1 ring-inset ring-gray-300 hover:bg-[#F5F3FF] dark:ring-border-tertiary",
            props.current === "dashboard"
              ? "bg-accent/10 dark:bg-base-600 dark:text-[#9D8FF0] text-accent -ml-px"
              : "bg-white text-ink-400 dark:bg-transparent dark:text-ink-400"
          )}
          disabled={isDashboardButtonDisabled}
          onClick={() => {
            router.push(
              `/workspace/${props.workspaceId}/documents/${props.documentId}/dashboard${props.isEditing ? "/edit" : ""}`
            );
          }}
        >
          <PiSquaresFour className="w-4 h-4 shrink-0" />
          <span>Dashboard</span>
        </button>
      </Tooltip>
    </div>
  );
}

export default DashboardNotebookGroupButton;
