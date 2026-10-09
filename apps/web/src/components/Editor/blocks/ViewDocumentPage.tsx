import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { List } from "immutable";
import clsx from "clsx";
import { getBlocks } from "@sandworm/editor";
import { PiCircleNotch, PiPencilSimple, PiPlayFill } from "react-icons/pi";
import { toast } from "sonner";

import type { APIDataSource } from "@/types";
import { ThemeTogggle } from "@/components/Theme/ThemeToggle";
import { EmptyState } from "@/components/EmptyState";
import { tintPillDarkClassName } from "@/styles/interactive";

import type { SessionUser } from "../hooks/useAuth";
import Layout from "../../Visualization/Layout";
import useDocument from "../hooks/useDocument";
import useFullScreenDocument from "../hooks/useFullScreenDocument";
import useUpgradeGate from "../hooks/useUpgradeGate";
import { useViewYDoc } from "../hooks/useViewYDoc";
import ViewSwitcher from "../ViewSwitcher";
import type { NotebookView } from "../ViewSwitcher";
import { ContentSkeleton, TitleSkeleton } from "../ContentSkeleton";

import DashboardNotebookGroupButton from "./DashboarNotebookGroupButton";
import UpgradePlanModal from "./UpgradePlanModal";

function Placeholder() {
  return (
    <div className="flex-1 min-w-0 h-full overflow-hidden flex justify-center">
      <div className=" px-12 py-12 w-full">
        <div className="px-5">
          <TitleSkeleton visible />
        </div>

        <ContentSkeleton visible />
      </div>
    </div>
  );
}

// this is needed because this component only works with the browser
const PublicEditor = dynamic(() => import("@/components/Editor/PublicEditor"), {
  ssr: false,
  loading: Placeholder,
});

const EMPTY_DATA_SOURCES: List<APIDataSource> = List();

interface Props {
  workspaceId: string;
  documentId: string;
  user: SessionUser;
}

// =====================================
// ⬢ ViewDocumentPage
// =====================================
// The saved notebook, read-only: results and a Run button to refresh them.
// Rendered from a snapshot fetched over HTTP, like the public page — no
// collaboration socket, no execution queue on the client.
export default function ViewDocumentPage(props: Props) {
  const [{ document }] = useDocument(props.workspaceId, props.documentId);
  const { yDoc, isSyncing, running, progress, error, run } = useViewYDoc(
    props.workspaceId,
    props.documentId
  );
  const [view, setView] = useState<NotebookView>("report");
  const [isFullScreen] = useFullScreenDocument(props.documentId);
  const gate = useUpgradeGate(props.workspaceId);

  const role =
    props.user.role?.find(r => r[props.workspaceId])?.[props.workspaceId] ??
    "viewer";

  // A failed first load takes over the page; a failed run only needs saying.
  const loaded = !isSyncing;
  useEffect(() => {
    if (error && loaded) {
      toast.error(error);
    }
  }, [error, loaded]);

  const onRun = useCallback(() => {
    // Only SQL blocks have a dataSourceId.
    const dataSourceIds: (string | null | undefined)[] = [];
    getBlocks(yDoc).forEach(block => {
      dataSourceIds.push(
        block.getAttribute("dataSourceId" as never) as unknown as string | null
      );
    });

    if (gate.check(dataSourceIds)) {
      run();
    }
  }, [yDoc, gate, run]);

  const hasContent = useMemo(
    () => loaded && getBlocks(yDoc).size > 0,
    [loaded, yDoc]
  );

  // Same place and look as the editor's Run button: beside the title.
  const runButton = (
    <button
      type="button"
      onClick={onRun}
      disabled={!hasContent || running}
      className={clsx(
        "relative flex-shrink-0",
        "flex items-center gap-1.5 px-4 py-1.5",
        "rounded-lg text-sm font-medium font-body",
        "transition-all duration-150 shadow-[0px_7.5px_8px_0px_rgba(132,151,195,0.04)]",
        "run-all-gradient-border",
        {
          "is-running": running,
          "bg-base-300 dark:bg-base-700 text-ink-300 dark:text-ink-600 cursor-not-allowed":
            !hasContent || running,
          [`bg-base-200 text-ink-100 border border-border hover:bg-base-400 hover:text-white hover:border-transparent dark:hover:bg-base-400 dark:hover:text-white ${tintPillDarkClassName}`]:
            hasContent && !running,
        }
      )}
    >
      {running ? (
        <>
          <PiCircleNotch size={14} className="animate-spin" />
          {progress
            ? `Running (${progress.completed}/${progress.total})`
            : "Running"}
        </>
      ) : (
        <>
          <PiPlayFill size={14} />
          Run
        </>
      )}
    </button>
  );

  // Report or Query view, then Run: beside the title, out of the top bar.
  const titleAction = (
    <div className="flex items-center gap-x-2 flex-shrink-0">
      <ViewSwitcher view={view} onChange={setView} />
      {runButton}
    </div>
  );

  // The same top bar as the dashboard and the notebook editor.
  const topBarContent = (
    <div className="flex items-center w-full justify-between gap-x-6">
      <div className="w-full min-w-0 overflow-hidden flex items-center gap-x-1.5 text-[13px] text-ink-400 dark:text-ink-400  font-body ">
        <span className="w-full min-w-0 flex gap-x-2 items-center ">
          <span className="font-normal bg-base-600 rounded-full px-3 py-0.5 text-ink-100 border border-border-secondary flex gap-x-2 w-[90px] shrink-0 items-center  ">
            <span className="relative flex items-center justify-center w-[10px] h-[10px]">
              <span className="absolute inline-flex w-full h-full rounded-full bg-primary/15" />
              <span className="absolute inline-flex w-full h-full animate-[ping_1.8s_cubic-bezier(0,0,0.2,1)_infinite] rounded-full bg-primary/30" />
              <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-primary" />
            </span>
            <span className="text-ink-100">Viewing</span>
          </span>{" "}
          <span className="text-ink-400 truncate min-w-0">
            / {document?.title || "Untitled"}
          </span>
        </span>
      </div>
      <DashboardNotebookGroupButton
        workspaceId={props.workspaceId}
        documentId={props.documentId}
        current="notebook"
        isEditing={false}
        userRole={role}
        isPublished
      />

      <div className="w-full justify-end flex items-center gap-x-0.5 h-[30px]">
        <ThemeTogggle iconSize={18} />

        <div className="ml-1 mr-3 h-5 w-px bg-[#E8E8EA] dark:bg-border-tertiary" />

        {role !== "viewer" && (
          <Link
            className="h-[30px] flex items-center gap-1.5
          rounded-lg px-3 text-sm font-body font-medium
          bg-transparent text-primary dark:text-primary-tint-75
          disabled:cursor-not-allowed disabled:opacity-50
          border-[1.5px] border-primary dark:border-hover-border"
            href={`/workspace/${props.workspaceId}/documents/${props.documentId}/notebook/edit`}
          >
            <PiPencilSimple size={16} />
            <span>Edit</span>
          </Link>
        )}
      </div>
    </div>
  );

  let content: React.ReactNode;
  if (error && !hasContent) {
    content = (
      <EmptyState
        heading="Oops"
        title="Couldn't load this notebook"
        subtitle={error}
        showGoBack
      />
    );
  } else if (isSyncing || !document) {
    content = <Placeholder />;
  } else {
    content = (
      <PublicEditor
        document={document}
        dataSources={EMPTY_DATA_SOURCES}
        isApp
        isPDF={false}
        isFullScreen={isFullScreen}
        yDoc={yDoc}
        isSyncing={false}
        isQueryView={view === "query"}
        hideHero
        titleAction={titleAction}
      />
    );
  }

  return (
    <Layout
      topBarClassname="bg-base-100 "
      topBarContent={topBarContent}
      isViewer
    >
      <UpgradePlanModal
        visible={gate.message !== null}
        onHide={gate.onHide}
        message={gate.message ?? ""}
        workspaceId={props.workspaceId}
      />
      <div className="flex-1 min-w-0 flex overflow-hidden">{content}</div>
    </Layout>
  );
}
