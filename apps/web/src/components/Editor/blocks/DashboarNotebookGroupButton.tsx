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
    <div className="flex items-center px-1 relative bg-base-600 dark:bg-border-dark py-1 rounded-lg gap-x-1 dark:border dark:border-hover-border">
      <Link
        className={clsx(
          "border border-transparent  flex gap-x-1.5 items-center px-2 py-0.5 text-[0.8rem] disabled:cursor-not-allowed disabled:opacity-50 hover:bg-white dark:hover:bg-white/10 rounded-md font-medium hover:border-primary hover:border hover:text-primary",
          props.current === "notebook"
            ? "bg-white  dark:bg-base-600 dark:text-primary-tint-75 border border-primary dark:border-primary-tint-75 text-primary -mr-px"
            : "bg-transparent text-ink-400 dark:bg-transparent dark:text-ink-400"
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
            "border border-transparent flex gap-x-1.5 items-center px-2 py-0.5 text-[0.8rem] disabled:cursor-not-allowed disabled:opacity-50 hover:bg-white dark:hover:bg-white/10 rounded-md font-medium  hover:border-primary hover:border hover:text-primary",
            props.current === "dashboard"
              ? "bg-white dark:bg-base-600 dark:text-primary-tint-75   border border-primary dark:border-primary-tint-75 text-primary -ml-px"
              : "bg-transparent text-ink-400 dark:bg-transparent dark:text-ink-400"
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
