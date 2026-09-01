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
    <div className="flex items-center shrink-0 whitespace-nowrap px-0.5 relative bg-base-600 py-0.5 rounded-md gap-x-1.5">
      <Link
        className={clsx(
          "border border-transparent  flex gap-x-1.5 items-center w-fit shrink-0 whitespace-nowrap px-1.5 py-1 text-[0.8rem] disabled:cursor-not-allowed disabled:opacity-50 hover:bg-white dark:hover:bg-white/10 rounded font-medium hover:border-primary hover:border hover:text-primary",
          props.current === "notebook"
            ? "bg-white  dark:bg-base-600 dark:text-[#9D8FF0] border border-primary text-primary -mr-px outline outline-1 outline-primary outline-offset-1"
            : "bg-transparent text-ink-400 dark:bg-transparent dark:text-ink-400"
        )}
        href={`/workspace/${props.workspaceId}/documents/${props.documentId}/notebook${props.isEditing ? "/edit" : ""}`}
      >
        <PiNotebook className="w-4 h-4 shrink-0" />
        <span className="whitespace-nowrap shrink-0">Notebook</span>
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
            "border border-transparent flex gap-x-1.5 items-center w-fit shrink-0 whitespace-nowrap px-1.5 py-1 text-[0.8rem] disabled:cursor-not-allowed disabled:opacity-50 hover:bg-white dark:hover:bg-white/10 rounded font-medium  hover:border-primary hover:border hover:text-primary",
            props.current === "dashboard"
              ? "bg-white dark:bg-base-600 dark:text-[#9D8FF0]   border border-primary text-primary -ml-px outline outline-1 outline-primary outline-offset-1"
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
          <span className="whitespace-nowrap shrink-0">Dashboard</span>
        </button>
      </Tooltip>
    </div>
  );
}

export default DashboardNotebookGroupButton;
