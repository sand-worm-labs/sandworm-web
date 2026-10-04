import React from "react";
import Link from "next/link";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { PiNotebook, PiSquaresFour } from "react-icons/pi";

import {
  segmentedTabClass,
  segmentedTabsClass,
} from "@/components/SegmentedTabs";

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
    <div className={segmentedTabsClass}>
      <Link
        className={clsx(
          segmentedTabClass(props.current === "notebook"),
          props.current === "notebook" && "-mr-px"
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
            segmentedTabClass(props.current === "dashboard"),
            props.current === "dashboard" && "-ml-px"
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
