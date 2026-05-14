import dynamic from "next/dynamic";
import { useCallback, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isNil } from "ramda";
import Link from "next/link";
import { EyeIcon, PencilIcon } from "@heroicons/react/24/outline";
import { BookUpIcon } from "lucide-react";
import clsx from "clsx";
import { AITasks, ExecutionQueue } from "@sandworm/editor";
import { useHotkeys } from "react-hotkeys-hook";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/20/solid";
import { PiPencilSimple, PiFloppyDisk } from "react-icons/pi";

import type { ApiDocument } from "@/types";
import { widthClasses } from "@/components/Editor/constants";
import { DataExplorerContent } from "@/components/ExplorerPanels/DataExplorerContent";
import { MiniChat } from "@/components/Chats/MiniChat";
import { ClockCountdown } from "@/components/Assets/ClockCountdown";
import { ChatIcon } from "@/components/Assets/ChatIcon";
import { PencilSimple } from "@/components/Assets/PencilSimple";
import { NEXT_PUBLIC_PUBLIC_URL } from "@/utils/env";

import { useDataSources } from "../hooks/useDataSources";
import { useDocuments } from "../hooks/useDocuments";
import useFullScreenDocument from "../hooks/useFullScreenDocument";
import type { SessionUser } from "../hooks/useAuth";
import Layout from "../../Visualization/Layout";
import { useYDoc } from "../hooks/useYDocs";
import useDocument from "../hooks/useDocument";
import { RightSidebarPanel } from "../RightSidebarPanel";

import Comments from "./Comments";
import Schedules from "./Schedules";
import Snapshots from "./Snapshots";
import DashboardNotebookGroupButton from "./DashboarNotebookGroupButton";
import EllipsisDropdown from "./EllipsisDropdown";
import LiveButton from "./LiveButton";
import Files from "./Files";
import { PublishBlinkingSignal } from "./BlinkingSignal";
import ShortcutsModal from "./ShortcutsModal";
import ReusableComponents from "./ReusableComponents";
import PageSettingsPanel from "./PageSettingsPanel";
import { Tooltip, TooltipV2 } from "./ToolTips";
import { ContentSkeleton, TitleSkeleton } from "./ContentSkeleton";
import ShareModal from "./ShareModal";

// this is needed because this component only works with the browser
const V2Editor = dynamic(() => import("@/components/Editor"), {
  ssr: false,
});

interface Props {
  workspaceId: string;
  documentId: string;
  user: SessionUser;
  isApp: boolean;
}

function PrivateDocumentPageInner(
  props: Props & {
    document: ApiDocument;
    publish: () => Promise<void>;
    publishing: boolean;
  }
) {
  const documentTitle = useMemo(
    () => props.document.title || "Untitled",
    [props.document.title]
  );

  const [selectedSidebar, setSelectedSidebar] = useState<
    | { _tag: "comments" }
    | { _tag: "schedules" }
    | { _tag: "snapshots" }
    | { _tag: "files" }
    | { _tag: "schemaExplorer"; dataSourceId: string | null }
    | { _tag: "shortcuts" }
    | { _tag: "reusableComponents" }
    | { _tag: "pageSettings" }
    | { _tag: "chat" }
    | null
  >(null);

  const [{ datasources: dataSources }] = useDataSources(props.workspaceId);

  const onHideSidebar = useCallback(() => {
    setSelectedSidebar(null);
  }, [setSelectedSidebar]);

  const onToggleComments = useCallback(() => {
    setSelectedSidebar(v =>
      v?._tag === "comments" ? null : { _tag: "comments" }
    );
  }, [setSelectedSidebar]);

  const onToggleShortcuts = useCallback(() => {
    setSelectedSidebar(v =>
      v?._tag === "shortcuts" ? null : { _tag: "shortcuts" }
    );
  }, [setSelectedSidebar]);

  const onToggleReusableComponents = useCallback(() => {
    setSelectedSidebar(v =>
      v?._tag === "reusableComponents" ? null : { _tag: "reusableComponents" }
    );
  }, [setSelectedSidebar]);

  const onToggleSchemaExplorerEllipsis = useCallback(() => {
    setSelectedSidebar(v =>
      v?._tag === "schemaExplorer"
        ? null
        : { _tag: "schemaExplorer", dataSourceId: null }
    );
  }, [setSelectedSidebar]);

  const onToggleSchemaExplorerSQLBlock = useCallback(
    (dataSourceId?: string | null) => {
      setSelectedSidebar(v =>
        v?._tag === "schemaExplorer" && v.dataSourceId === dataSourceId
          ? null
          : { _tag: "schemaExplorer", dataSourceId: dataSourceId ?? null }
      );
    },
    [setSelectedSidebar]
  );

  const onToggleSchedules = useCallback(() => {
    setSelectedSidebar(v =>
      v?._tag === "schedules" ? null : { _tag: "schedules" }
    );
  }, [setSelectedSidebar]);

  const onToggleSnapshots = useCallback(() => {
    setSelectedSidebar(v =>
      v?._tag === "snapshots" ? null : { _tag: "snapshots" }
    );
  }, [setSelectedSidebar]);

  const onToggleFiles = useCallback(() => {
    setSelectedSidebar(v => (v?._tag === "files" ? null : { _tag: "files" }));
  }, [setSelectedSidebar]);

  const onTogglePageSettings = useCallback(() => {
    setSelectedSidebar(v =>
      v?._tag === "pageSettings" ? null : { _tag: "pageSettings" }
    );
  }, [setSelectedSidebar]);

  const onToggleChat = useCallback(() => {
    setSelectedSidebar(v => (v?._tag === "chat" ? null : { _tag: "chat" }));
  }, []);

  const router = useRouter();

  const roleEntry = props?.user?.role?.find(
    entry => props.workspaceId in entry
  );
  const isViewer = roleEntry?.[props.workspaceId] === "viewer";
  const role =
    props?.user?.role?.find(r => r[props.workspaceId])?.[props.workspaceId] ??
    "viewer";

  const isDeleted = !isNil(props.document.deletedAt);

  const [isFullScreen, { toggle: onToggleFullScreen }] = useFullScreenDocument(
    props.document.id
  );

  const [, { restoreDocument }] = useDocuments(props.workspaceId);
  const onRestoreDocument = useCallback(() => {
    restoreDocument(props.documentId);
  }, [props.documentId, restoreDocument]);

  const clock = useMemo(() => {
    if (!props.isApp) {
      return props.document.clock ?? 0;
    }

    return (
      props.document?.userAppClock?.[props.user.id] ??
      props.document?.appClock ??
      0
    );
  }, [
    props.isApp,
    props.document.clock,
    props.document.userAppClock,
    props.document.appClock,
    props.user.id,
  ]);

  console.log("[YDoc Debug]", {
    mode: props.isApp ? "VIEW" : "EDIT",
    workspaceId: props.document.workspaceId,
    documentId: props.document.id,
    userId: props.user.id,
    clock,
    rawClock: props.document.clock,
    appClock: props.document.appClock,
    userAppClock: props.document?.userAppClock?.[props.user.id],
    publishedAt: props.document.publishedAt,
    isApp: props.isApp,
  });

  const { yDoc, provider, syncing, isDirty, undo, redo } = useYDoc(
    props.document.workspaceId,
    props.document.id,
    props.isApp,
    clock,
    props.user.id,
    props.document.publishedAt,
    true,
    null
  );

  useEffect(() => {
    console.log("[YDoc Sync]", {
      mode: props.isApp ? "VIEW" : "EDIT",
      syncing,
      isDirty,
      hasProvider: !!provider,
      hasYDoc: !!yDoc,
    });
  }, [syncing, isDirty, provider, yDoc]);

  useHotkeys("mod+z", undo);
  useHotkeys("mod+shift+z", redo);

  const executionQueue = useMemo(
    () =>
      ExecutionQueue.fromYjs(yDoc, {
        skipDependencyCheck: !props.document.runUnexecutedBlocks,
      }),
    [yDoc, props.document.runUnexecutedBlocks]
  );
  const aiTasks = useMemo(() => AITasks.fromYjs(yDoc), [yDoc]);

  // ⬢ Public document
  // =====================================
  const onPublish = useCallback(async () => {
    if (props.publishing) {
      return;
    }

    await props.publish();
    router.push(
      `/workspace/${props.document.workspaceId}/documents/${props.document.id}/notebook`
    );
  }, [
    props.publishing,
    props.publish,
    props.document.workspaceId,
    props.document.id,
    router,
  ]);

  const onGoToApp = useCallback(() => {
    router.push(
      `/workspace/${props.document.workspaceId}/documents/${props.document.id}/notebook`
    );
  }, [router]);

  const handleVisibilityChange = useCallback(
    async (visibility: "WORKSPACE" | "LINK" | "PUBLIC") => {
      console.log(visibility);
    },
    []
  );

  // ⬢ Sidebar content for NotebookPanel
  // =====================================
  const sidebarContent = useMemo(
    () => (
      <>
        <div className="flex flex-col">
          <TooltipV2 active title="Comments" position="left">
            {ref => (
              <button
                ref={ref as React.RefObject<HTMLButtonElement>}
                type="button"
                onClick={onToggleComments}
                className="w-full flex items-center justify-center rounded-xl px-0.5 py-1.5 text-sm hover:bg-[#F1F2F4] dark:bg-base-500 dark:hover:bg-base-200 dark:text-ink-100 h-full bg-white mb-1.5"
              >
                <ChatIcon size={22} />
              </button>
            )}
          </TooltipV2>

          {/* Schedules Button - Only show if not viewer and not deleted */}
          {!isViewer && !isDeleted && (
            <TooltipV2 active title="Schedules" position="left">
              {ref => (
                <button
                  ref={ref as React.RefObject<HTMLButtonElement>}
                  type="button"
                  onClick={onToggleSchedules}
                  className="w-full flex items-center justify-center rounded-xl px-0.5 py-1.5 text-sm hover:bg-[#F1F2F4] dark:bg-base-500 h-full bg-white mb-1.5 dark:text-ink-100"
                >
                  <ClockCountdown size={22} />
                </button>
              )}
            </TooltipV2>
          )}

          {/* Horizontal Toggle Button */}
          {onToggleFullScreen && (
            <TooltipV2
              active
              title={
                isFullScreen ? "Shrink horizontally" : "Stretch horizontally"
              }
              position="left"
            >
              {ref => (
                <button
                  ref={ref as React.RefObject<HTMLButtonElement>}
                  type="button"
                  onClick={onToggleFullScreen}
                  className="flex items-center justify-center rounded-none px-3 py-3 text-sm text-ink-400 dark:text-ink-100 hover:bg-gray-100 dark:bg-base-500 h-full bg-white w-full items-center"
                >
                  <div className="flex items-center">
                    {isFullScreen ? (
                      <>
                        <ArrowRightIcon className="h-3 w-3" />
                        <ArrowLeftIcon className="h-3 w-3" />
                      </>
                    ) : (
                      <>
                        <ArrowLeftIcon className="h-3 w-3" />
                        <ArrowRightIcon className="h-3 w-3" />
                      </>
                    )}
                  </div>
                </button>
              )}
            </TooltipV2>
          )}
        </div>

        <ShareModal
          link={`${NEXT_PUBLIC_PUBLIC_URL()}/workspace/${props.workspaceId}/documents/${props.documentId}/notebook`}
          initialVisibility="WORKSPACE"
          onVisibilityChange={handleVisibilityChange}
        />
        <EllipsisDropdown
          onToggleSchedules={onToggleSchedules}
          onToggleSnapshots={onToggleSnapshots}
          onToggleComments={onToggleComments}
          onToggleFullScreen={onToggleFullScreen}
          onToggleFiles={onToggleFiles}
          onToggleSchemaExplorer={onToggleSchemaExplorerEllipsis}
          onToggleReusableComponents={onToggleReusableComponents}
          onToggleShortcuts={onToggleShortcuts}
          onTogglePageSettings={onTogglePageSettings}
          isViewer={isViewer}
          isDeleted={isDeleted}
          isFullScreen={isFullScreen}
        />
      </>
    ),
    [
      onToggleSchedules,
      onToggleSnapshots,
      onToggleComments,
      onToggleFullScreen,
      onToggleFiles,
      onToggleSchemaExplorerEllipsis,
      onToggleReusableComponents,
      onToggleShortcuts,
      onTogglePageSettings,
      isViewer,
      isDeleted,
      isFullScreen,
      props.workspaceId,
      props.documentId,
      handleVisibilityChange,
    ]
  );

  const topBarContent = (
    <div className="flex items-center w-full justify-between gap-x-6">
      <div className="w-full overflow-hidden flex items-center gap-x-1.5 text-sm text-ink-400 dark:text-ink-400  font-body">
        {props.isApp || isViewer ? (
          <EyeIcon className="w-4 h-4" />
        ) : (
          <PencilSimple className="w-4 h-4" />
        )}
        <span className="w-full truncate">
          <span className="font-semibold">
            {props.isApp || isViewer ? (
              <span className="text-ink-400">Viewing</span>
            ) : (
              "Editing"
            )}
          </span>{" "}
          {documentTitle}
        </span>
      </div>
      <DashboardNotebookGroupButton
        workspaceId={props.workspaceId}
        documentId={props.documentId}
        current="notebook"
        isEditing={!props.isApp}
        userRole={role}
        isPublished={props.document.publishedAt !== null}
      />

      <div className="w-full justify-end flex items-center gap-x-2 h-[30px]">
        {!props.isApp && (
          <LiveButton
            onClick={onGoToApp}
            disabled={props.document.publishedAt === null}
            tooltipActive={props.document.publishedAt === null}
          />
        )}

        {isViewer ? null : props.isApp ? (
          <Link
            className="flex items-center gap-1.5
          rounded-lg px-3 py-1 text-sm font-body
          bg-white dark:bg-base-100 dark:text-ink-100
          border border-border-secondary dark:border-border-tertiary
          hover:bg-[#F1F3F4] dark:hover:bg-[#2A2A28]
          disabled:cursor-not-allowed disabled:opacity-50"
            href={`/workspace/${props.document.workspaceId}/documents/${props.document.id}/notebook/edit`}
          >
            <PiPencilSimple size={16} />
            <span>Edit</span>
          </Link>
        ) : (
          <Tooltip
            title="Click to save"
            message="This notebook has unsaved changes."
            active={props.document.publishedAt !== null && isDirty}
            position="bottom"
            tooltipClassname="w-40"
          >
            <button
              type="button"
              className="flex items-center gap-1.5
    rounded-lg px-3 py-1 text-sm font-body
    bg-primary text-white
    hover:bg-primary-300
    disabled:cursor-not-allowed disabled:opacity-50
    border-none relative group"
              onClick={onPublish}
              disabled={props.publishing}
            >
              <PiFloppyDisk
                size={16}
                weight="regular"
                className="rotate-0 group-hover:-rotate-12 transition-transform duration-300"
              />
              <span>Save</span>
              {isDirty && props.document.publishedAt && (
                <PublishBlinkingSignal />
              )}
            </button>
          </Tooltip>
        )}
      </div>
    </div>
  );

  return (
    <Layout
      topBarClassname={props.isApp ? "bg-base-100 " : undefined}
      topBarContent={topBarContent}
      sidebarContent={sidebarContent}
      onToggleChat={onToggleChat}
      isViewer={props.isApp || isViewer}
    >
      <div className="flex-1 min-w-0 flex overflow-hidden">
        <V2Editor
          key={selectedSidebar?._tag}
          document={props.document}
          dataSources={dataSources}
          isPublicViewer={false}
          isDeleted={isDeleted}
          onRestoreDocument={onRestoreDocument}
          isEditable={!props.isApp && !isViewer}
          isPDF={false}
          isApp={props.isApp}
          userId={props.user.id}
          role={role}
          isFullScreen={isFullScreen}
          yDoc={yDoc}
          executionQueue={executionQueue}
          aiTasks={aiTasks}
          provider={provider}
          isSyncing={syncing}
          onOpenFiles={onToggleFiles}
          onSchemaExplorer={onToggleSchemaExplorerSQLBlock}
        />

        <RightSidebarPanel visible={selectedSidebar !== null}>
          <Comments
            workspaceId={props.workspaceId}
            documentId={props.documentId}
            visible={selectedSidebar?._tag === "comments"}
            onHide={onHideSidebar}
          />

          <ShortcutsModal
            visible={selectedSidebar?._tag === "shortcuts"}
            onHide={onHideSidebar}
          />

          {!isViewer && !isDeleted && (
            <>
              <Schedules
                workspaceId={props.workspaceId}
                documentId={props.documentId}
                isPublished={props.document.publishedAt !== null}
                visible={selectedSidebar?._tag === "schedules"}
                onHide={onHideSidebar}
                onPublish={onPublish}
                publishing={props.publishing}
              />
              <Snapshots
                visible={selectedSidebar?._tag === "snapshots"}
                onHide={onHideSidebar}
              />
              <Files
                workspaceId={props.workspaceId}
                visible={selectedSidebar?._tag === "files"}
                onHide={onHideSidebar}
                userId={props.user.id}
                yDoc={yDoc}
                executionQueue={executionQueue}
              />
              <ReusableComponents
                workspaceId={props.workspaceId}
                documentId={props.documentId}
                visible={selectedSidebar?._tag === "reusableComponents"}
                onHide={onHideSidebar}
                yDoc={yDoc}
              />
              <PageSettingsPanel
                workspaceId={props.workspaceId}
                documentId={props.documentId}
                visible={selectedSidebar?._tag === "pageSettings"}
                onHide={onHideSidebar}
              />
              <DataExplorerContent
                visible={selectedSidebar?._tag === "schemaExplorer"}
                mode="sidebar"
                showDragHandle={false}
              />
              <MiniChat
                visible={selectedSidebar?._tag === "chat"}
                onClose={onHideSidebar}
                yDoc={yDoc}
              />
            </>
          )}
        </RightSidebarPanel>
      </div>
    </Layout>
  );
}

export default function PrivateDocumentPage(props: Props) {
  const [{ document, publishing }, { publish }] = useDocument(
    props.workspaceId,
    props.documentId
  );

  useEffect(() => {
    console.log(document, "doc");
  }, [document]);

  if (!document) {
    return (
      <Layout>
        <div className="w-full flex justify-center">
          <div className={clsx(widthClasses, "py-20")}>
            <TitleSkeleton visible />
            <ContentSkeleton visible />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <PrivateDocumentPageInner
      {...props}
      document={document}
      publish={publish}
      publishing={publishing}
    />
  );
}
