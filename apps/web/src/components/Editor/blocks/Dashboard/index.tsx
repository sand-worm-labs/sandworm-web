/* eslint-disable import/no-cycle */
import type * as Y from "yjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PiPencilSimple } from "react-icons/pi";
import type { BlockType, YBlock, YBlockGroup } from "@sandworm/editor";
import {
  AITasks,
  ExecutionQueue,
  getBlocks,
  getDataframes,
  getLayout,
  switchBlockType,
} from "@sandworm/editor";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isNil } from "ramda";
import { Transition } from "@headlessui/react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { useHotkeys } from "react-hotkeys-hook";
import type { DataFrame } from "@sandworm/types";

import { ChatIcon } from "@/components/Assets/ChatIcon";
import { ClockCountdown } from "@/components/Assets/ClockCountdown";
import type { ApiDocument, UserWorkspaceRole } from "@/types";
import { NEXT_PUBLIC_PUBLIC_URL } from "@/utils/env";
import { ThemeTogggle } from "@/components/Theme/ThemeToggle";
import Layout from "@/components/Visualization/Layout";
import VisualizationBlock from "@/components/Visualization/index";

import type { APIDataSources } from "../../hooks/useDataSources";
import ShareModal from "../ShareModal";
import { useDataSources } from "../../hooks/useDataSources";
import { useLastUpdatedAt, useYDoc, useYDocState } from "../../hooks/useYDocs";
import DashboardNotebookGroupButton from "../DashboarNotebookGroupButton";
import EllipsisDropdown from "../EllipsisDropdown";
import Comments from "../Comments";
import Schedules from "../Schedules";
import LiveButton from "../LiveButton";
import EnvBar from "../EnvBar";
import Files from "../Files";
import EnvironmentPanel from "../EnvironmentPanel";
import EnvVariablesPanel from "../EnvVariablesPanel";
import { PublishBlinkingSignal } from "../BlinkingSignal";
import { Tooltip } from "../ToolTips";
import { SQLExtensionProvider } from "../customBlocks/CodeEditor/sql";
import ScrollBar from "../ScrollBar";
import RichTextBlock from "../customBlocks/richText";
import SQLBlock from "../customBlocks/sql";
import PythonBlock from "../customBlocks/python";
import InputBlock from "../customBlocks/input";
import DateInputBlock from "../customBlocks/dateInput";
import PivotTableBlock from "../customBlocks/pivotTable";
import DropdownInputBlock from "../customBlocks/dropdownInput";
import MarkdownBlock from "../customBlocks/markdown";
import type { SessionUser } from "../../hooks/useAuth";

import DashboardSkeleton from "./DashboardSkeleton";
import DashboardControls from "./DashboardControls";
import DashboardView from "./DashboardView";

// =====================================
// ⬢ Types
// =====================================
export type DashboardMode =
  | {
      _tag: "live";
    }
  | {
      _tag: "editing";
      position: "dashboard" | "sidebar" | "expanded";
    };

export function dashboardModeHasControls(mode: DashboardMode): boolean {
  switch (mode._tag) {
    case "live":
      return false;
    case "editing":
      switch (mode.position) {
        case "sidebar":
        case "dashboard":
          return false;
        case "expanded":
          return true;
        default:
          return false;
      }
    default:
      return false;
  }
}

export type DraggingBlock = {
  id: string;
  type: BlockType;
  width: number;
  height: number;
};

// =====================================
// ⬢ EXPANDED BLOCK VIEW
// =====================================
interface ExpandedBlockViewProps {
  expanded: YBlock;
  document: ApiDocument;
  dataframes: Y.Map<DataFrame>;
  blocks: Y.Map<YBlock>;
  layout: Y.Array<YBlockGroup>;
  dataSources: APIDataSources;
  user: SessionUser;
  executionQueue: ExecutionQueue;
  aiTasks: AITasks;
  onToggleSchemaExplorer: (dataSourceId?: string | null) => void;
}

function ExpandedBlockView(props: ExpandedBlockViewProps) {
  return switchBlockType(props.expanded, {
    onVisualization: block => (
      <VisualizationBlock
        document={props.document}
        dataframes={props.dataframes}
        block={block}
        blocks={props.blocks}
        dragPreview={null}
        isEditable
        onAddGroupedBlock={() => {}}
        dashboardMode={{ _tag: "editing", position: "expanded" }}
        isPublicMode={false}
        hasMultipleTabs={false}
        isBlockHiddenInPublished={false}
        onToggleIsBlockHiddenInPublished={() => {}}
        isCursorWithin={false}
        isCursorInserting={false}
        userId={props.user.id}
        executionQueue={props.executionQueue}
        isFullScreen
      />
    ),
    onRichText: block => (
      <RichTextBlock
        block={block}
        belongsToMultiTabGroup={false}
        isEditable
        dragPreview={null}
        dashboardMode={{ _tag: "editing", position: "expanded" }}
        isCursorWithin={false}
        isCursorInserting={false}
      />
    ),
    onMarkdown: block => (
      <MarkdownBlock
        block={block}
        document={props.document}
        belongsToMultiTabGroup={false}
        isEditable
        dragPreview={null}
        dashboardMode={{ _tag: "editing", position: "expanded" }}
        isCursorWithin={false}
        isCursorInserting={false}
        workspaceId={props.document.workspaceId}
      />
    ),
    onSQL: block => (
      <SQLBlock
        block={block}
        blocks={props.blocks}
        layout={props.layout}
        document={props.document}
        dataSources={props.dataSources}
        isEditable
        dragPreview={null}
        dashboardMode={{ _tag: "editing", position: "expanded" }}
        isPublicMode={false}
        hasMultipleTabs={false}
        isBlockHiddenInPublished={false}
        onToggleIsBlockHiddenInPublished={() => {}}
        onSchemaExplorer={props.onToggleSchemaExplorer}
        insertBelow={() => {}}
        userId={props.user.id}
        executionQueue={props.executionQueue}
        aiTasks={props.aiTasks}
        isFullScreen
      />
    ),
    onPython: block => (
      <PythonBlock
        document={props.document}
        block={block}
        blocks={props.blocks}
        isEditable
        dragPreview={null}
        isPDF={false}
        dashboardMode={{ _tag: "editing", position: "expanded" }}
        isPublicMode={false}
        hasMultipleTabs={false}
        isBlockHiddenInPublished={false}
        onToggleIsBlockHiddenInPublished={() => {}}
        userId={props.user.id}
        executionQueue={props.executionQueue}
        aiTasks={props.aiTasks}
        isFullScreen
      />
    ),
    onInput: block => (
      <InputBlock
        block={block}
        blocks={props.blocks}
        dragPreview={null}
        belongsToMultiTabGroup={false}
        isEditable
        isApp={false}
        dashboardMode={{ _tag: "editing", position: "expanded" }}
        isCursorWithin={false}
        isCursorInserting={false}
        userId={props.user.id}
        workspaceId={props.document.workspaceId}
        executionQueue={props.executionQueue}
      />
    ),
    onDropdownInput: block => (
      <DropdownInputBlock
        block={block}
        blocks={props.blocks}
        dragPreview={null}
        belongsToMultiTabGroup={false}
        isEditable
        isApp={false}
        dashboardMode={{ _tag: "editing", position: "expanded" }}
        dataframes={props.dataframes}
        isCursorWithin={false}
        isCursorInserting={false}
        userId={props.user.id}
        workspaceId={props.document.workspaceId}
        executionQueue={props.executionQueue}
      />
    ),
    onDateInput: block => (
      <DateInputBlock
        block={block}
        blocks={props.blocks}
        workspaceId={props.document.workspaceId}
        dragPreview={null}
        belongsToMultiTabGroup={false}
        isEditable
        isApp={false}
        dashboardMode={{ _tag: "editing", position: "expanded" }}
        isCursorWithin={false}
        isCursorInserting={false}
        userId={props.user.id}
        executionQueue={props.executionQueue}
      />
    ),
    onFileUpload: () => null,
    onDashboardHeader: () => null,
    onPivotTable: block => (
      <PivotTableBlock
        workspaceId={props.document.workspaceId}
        dataframes={props.dataframes}
        block={block}
        blocks={props.blocks}
        dragPreview={null}
        isEditable
        onAddGroupedBlock={() => {}}
        dashboardMode={{ _tag: "editing", position: "expanded" }}
        hasMultipleTabs={false}
        isBlockHiddenInPublished={false}
        onToggleIsBlockHiddenInPublished={() => {}}
        isCursorWithin={false}
        isCursorInserting={false}
        userId={props.user.id}
        executionQueue={props.executionQueue}
        isFullScreen
      />
    ),
    onVisualizationV2: () => null,
    onPowerToolbox: () => null,
  });
}

// =====================================
// ⬢ DASHBOARD CONTENT
// =====================================
function DashboardContent(
  props: Props & {
    yDoc: Y.Doc;
    executionQueue: ExecutionQueue;
    aiTasks: AITasks;
    onToggleSchemaExplorer: (dataSourceId?: string | null) => void;
  }
) {
  const [{ datasources: dataSources }] = useDataSources(
    props.document.workspaceId
  );
  const [draggingBlock, setDraggingBlock] = useState<DraggingBlock | null>(
    null
  );
  const [latestBlockId, setLatestBlockId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<YBlock | null>(null);
  const { state: blocks } = useYDocState(props.yDoc, getBlocks);
  const { state: layout } = useYDocState(props.yDoc, getLayout);
  const { state: dataframes } = useYDocState(props.yDoc, getDataframes);

  const onDragStart = useCallback((newDraggingBlock: DraggingBlock) => {
    setDraggingBlock(newDraggingBlock);
  }, []);

  const onAddBlock = useCallback(
    (blockId: string) => {
      setLatestBlockId(blockId);
    },
    [setLatestBlockId]
  );

  useEffect(() => {
    if (!expanded) {
      return () => {};
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setExpanded(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [expanded]);

  const [isControlsOpen, setIsControlsOpen] = useState(true);
  const onOpenControls = useCallback(() => {
    setIsControlsOpen(true);
  }, []);
  const onCloseControls = useCallback(() => {
    setIsControlsOpen(false);
  }, []);

  return (
    <>
      <div className="flex h-[calc(100%-47px)] min-h-0 overflow-hidden">
        <DashboardView
          className={clsx(
            "flex-1 min-h-0 h-full",
            props.isEditing && isControlsOpen && "w-[calc(100%-400px)]"
          )}
          document={props.document}
          dataSources={dataSources}
          yDoc={props.yDoc}
          draggingBlock={draggingBlock}
          latestBlockId={latestBlockId}
          isEditing={props.isEditing}
          userRole={props.role}
          userId={props.user.id}
          executionQueue={props.executionQueue}
          aiTasks={props.aiTasks}
          onExpand={setExpanded}
        />
        {props.isEditing && (
          <DashboardControls
            document={props.document}
            dataSources={dataSources}
            yDoc={props.yDoc}
            onDragStart={onDragStart}
            onAddBlock={onAddBlock}
            userId={props.user.id}
            executionQueue={props.executionQueue}
            aiTasks={props.aiTasks}
            onExpand={setExpanded}
            isOpen={isControlsOpen}
            onOpen={onOpenControls}
            onClose={onCloseControls}
          />
        )}
      </div>
      {createPortal(
        <Transition
          as="div"
          className="fixed inset-0 z-[99] flex items-center justify-center py-8"
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
          show={expanded !== null}
        >
          {expanded ? (
            <button
              type="button"
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setExpanded(null)}
            />
          ) : null}

          {expanded ? (
            <ScrollBar className="bg-base-100 px-16 py-12 rounded-xl shadow-md max-h-[90vh] min-w-[940px] 2xl:w-[1280px] 3xl:w-[1536px]">
              <ExpandedBlockView
                expanded={expanded}
                document={props.document}
                dataframes={dataframes.value}
                blocks={blocks.value}
                layout={layout.value}
                dataSources={dataSources}
                user={props.user}
                executionQueue={props.executionQueue}
                aiTasks={props.aiTasks}
                onToggleSchemaExplorer={props.onToggleSchemaExplorer}
              />
            </ScrollBar>
          ) : null}
        </Transition>,
        document.body
      )}
    </>
  );
}

interface Props {
  document: ApiDocument;
  user: SessionUser;
  role: UserWorkspaceRole;
  isEditing: boolean;
  // eslint-disable-next-line react/no-unused-prop-types
  publishing: boolean;
  // eslint-disable-next-line react/no-unused-prop-types
  publish: () => Promise<void>;
}

// =====================================
// ⬢ Main Dashboard Component
// =====================================
export default function Dashboard(props: Props) {
  const clock = useMemo(() => {
    if (props.isEditing) {
      return props.document?.clock ?? 0;
    }

    return (
      props.document?.userAppClock?.[props.user.id] ??
      props.document?.appClock ??
      0
    );
  }, [
    props.isEditing,
    props.document?.clock,
    props.document?.userAppClock,
    props.user,
  ]);

  const { yDoc, syncing, isDirty, undo, redo } = useYDoc(
    props.document.workspaceId,
    props.document.id,
    !props.isEditing,
    clock,
    props.user.id,
    props.document.publishedAt,
    true,
    null,
    props.user.token
  );

  useHotkeys("mod+z", undo);
  useHotkeys("mod+shift+z", redo);

  const executionQueue = useMemo(
    () =>
      ExecutionQueue.fromYjs(yDoc, {
        skipDependencyCheck: !props.document.runUnexecutedBlocks,
      }),
    [yDoc]
  );
  const aiTasks = useMemo(() => AITasks.fromYjs(yDoc), [yDoc]);

  const router = useRouter();

  const roleEntry = props?.user?.role?.find(
    entry => props.document.workspaceId in entry
  );
  const isViewer = roleEntry?.[props.document.workspaceId] === "viewer";

  const onPublish = useCallback(async () => {
    if (props.publishing) {
      return;
    }

    await props.publish();
    router.push(
      `/workspace/${props.document.workspaceId}/documents/${props.document.id}/dashboard`
    );
  }, [props.publish, props.publishing]);

  const documentTitle = useMemo(
    () => props.document.title || "Untitled",
    [props.document.title]
  );

  const [selectedSidebar, setSelectedSidebar] = useState<
    | { _tag: "comments" }
    | { _tag: "schedules" }
    | { _tag: "files" }
    | { _tag: "schemaExplorer"; dataSourceId: string | null }
    | { _tag: "shortcuts" }
    | { _tag: "reusableComponents" }
    | { _tag: "pageSettings" }
    | { _tag: "environment" }
    | { _tag: "envVariables" }
    | null
  >(null);

  const onHideSidebar = useCallback(() => {
    setSelectedSidebar(null);
  }, [setSelectedSidebar]);

  const onToggleComments = useCallback(() => {
    setSelectedSidebar(v =>
      v?._tag === "comments" ? null : { _tag: "comments" }
    );
  }, [setSelectedSidebar]);

  const onToggleSchedules = useCallback(() => {
    setSelectedSidebar(v =>
      v?._tag === "schedules" ? null : { _tag: "schedules" }
    );
  }, [setSelectedSidebar]);

  const onToggleFiles = useCallback(() => {
    setSelectedSidebar(v => (v?._tag === "files" ? null : { _tag: "files" }));
  }, [setSelectedSidebar]);

  const onToggleEnvironment = useCallback(() => {
    setSelectedSidebar(v =>
      v?._tag === "environment" ? null : { _tag: "environment" }
    );
  }, [setSelectedSidebar]);

  const onToggleEnvVariables = useCallback(() => {
    setSelectedSidebar(v =>
      v?._tag === "envVariables" ? null : { _tag: "envVariables" }
    );
  }, [setSelectedSidebar]);

  const onToggleSchemaExplorer = useCallback(
    (dataSourceId?: string | null) => {
      setSelectedSidebar(v =>
        v?._tag === "schemaExplorer" && v.dataSourceId === dataSourceId
          ? null
          : { _tag: "schemaExplorer", dataSourceId: dataSourceId ?? null }
      );
    },
    [setSelectedSidebar]
  );

  const isDeleted = !isNil(props.document.deletedAt);

  const handleVisibilityChange = useCallback(
    async (visibility: "private" | "team" | "community") => {
      console.log("Visibility changed to:", visibility);
    },
    []
  );

  const onGoToApp = useCallback(() => {
    router.push(
      `/workspace/${props.document.workspaceId}/documents/${props.document.id}/dashboard`
    );
  }, [router]);

  // =====================================
  // ⬢ Sidebar Content
  // =====================================
  const sidebarContent = useMemo(
    () => (
      <>
        <div className="flex flex-col">
          <button
            type="button"
            onClick={onToggleComments}
            className="flex items-center justify-center rounded-xl px-0.5 py-1.5 text-sm  hover:bg-hover-bg dark:bg-base-500 dark:hover:bg-base-200 dark:text-ink-100  h-full bg-white mb-1.5"
            title="Comments"
          >
            <ChatIcon size={22} />
          </button>

          {!isViewer && !isDeleted && (
            <button
              type="button"
              onClick={onToggleSchedules}
              className="flex items-center justify-center rounded-xl px-0.5 py-1.5 text-sm  hover:bg-hover-bg dark:bg-base-500  h-full bg-white mb-1.5 dark:text-ink-100"
              title="Schedules"
            >
              <ClockCountdown size={22} />
            </button>
          )}
        </div>

        <ShareModal
          link={`${NEXT_PUBLIC_PUBLIC_URL()}/workspace/${props.document.workspaceId}/documents/${props.document.id}/notebook${props.document.shareLinksWithoutSidebar ? "?sidebar=hidden" : ""}`}
          initialVisibility="private"
          onVisibilityChange={handleVisibilityChange}
        />
        <EllipsisDropdown
          onToggleSchedules={onToggleSchedules}
          onToggleComments={onToggleComments}
          onToggleFiles={onToggleFiles}
          onToggleEnvironment={onToggleEnvironment}
          onToggleEnvVariables={onToggleEnvVariables}
          onToggleSchemaExplorer={onToggleSchemaExplorer}
          isViewer={props.role === "viewer"}
          isDeleted={isDeleted}
          isFullScreen={false}
        />
      </>
    ),
    [
      onToggleSchedules,
      onToggleComments,
      onToggleFiles,
      onToggleEnvironment,
      onToggleEnvVariables,
      isDeleted,
    ]
  );

  const isDashboardViewer = props.role === "viewer";

  const topBarContent = (
    <div className="flex items-center w-full justify-between gap-x-6">
      <div className="w-full min-w-0 overflow-hidden flex items-center gap-x-1.5 text-[13px] text-ink-400 dark:text-ink-400 font-body ">
        <span className="w-full min-w-0 flex gap-x-2 items-center ">
          <span className="font-normal bg-base-600 rounded-full px-3 py-0.5 text-ink-100 border border-border-secondary flex gap-x-2 w-[90px] shrink-0 items-center  ">
            <span className="relative flex items-center justify-center w-[10px] h-[10px]">
              <span className="absolute inline-flex w-full h-full rounded-full bg-primary/15" />
              <span className="absolute inline-flex w-full h-full animate-[ping_1.8s_cubic-bezier(0,0,0.2,1)_infinite] rounded-full bg-primary/30" />
              <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-primary" />
            </span>
            {!props.isEditing || isDashboardViewer ? (
              <span className="text-ink-100">Viewing</span>
            ) : (
              "Editing"
            )}
          </span>{" "}
          <span className="text-ink-400 truncate min-w-0">
            / {documentTitle}
          </span>
        </span>
      </div>
      <DashboardNotebookGroupButton
        workspaceId={props.document.workspaceId}
        documentId={props.document.id}
        current="dashboard"
        isEditing={props.isEditing}
        userRole={props.role}
        isPublished={props.document.publishedAt !== null}
      />
      <div className="w-full justify-end flex items-center gap-x-0.5 h-[30px]">
        {props.isEditing && (
          <LiveButton
            onClick={onGoToApp}
            disabled={!props.document.publishedAt}
            tooltipActive={!props.document.publishedAt}
          />
        )}
        <ThemeTogggle iconSize={18} />

        <div className="ml-1 mr-3 h-5 w-px bg-[#E8E8EA] dark:bg-border-tertiary" />

        {props.role !== "viewer" && props.isEditing && (
          <Tooltip
            title="Click to save"
            message="This dashboard has unsaved changes."
            active={props.document.publishedAt !== null && isDirty}
            position="bottom"
            tooltipClassname="w-40"
          >
            <button
              type="button"
              id="dashboard-publish-button"
              className="flex items-center gap-1.5
    rounded-lg px-3 py-1 text-sm font-body
    bg-transparent text-primary dark:text-primary-tint-75
    hover:bg-primary-300
    disabled:cursor-not-allowed disabled:opacity-50
    border-[1.5px] border-primary dark:border-hover-border relative group font-medium"
              onClick={onPublish}
              disabled={props.publishing}
            >
              <span
                className="inline-flex items-center gap-[2px] font-body font-medium leading-none
    text-primary dark:text-primary-tint-75 border border-primary dark:border-hover-border rounded-sm
    px-1 py-0.5 text-[12px] tracking-tight
    group-hover:scale-95 transition-transform duration-300"
              >
                ⌘ S
              </span>
              <span>Save</span>
              {isDirty && props.document.publishedAt && (
                <PublishBlinkingSignal />
              )}
            </button>
          </Tooltip>
        )}
        {!props.isEditing && props.role !== "viewer" && (
          <Link
            className="flex items-center gap-1.5
          rounded-lg px-3 py-1 text-sm font-body
          bg-white dark:bg-base-100 dark:text-ink-100
          border border-primary dark:border-border-tertiary
          hover:bg-base-300 dark:hover:bg-base-700
          disabled:cursor-not-allowed disabled:opacity-50"
            href={`/workspace/${props.document.workspaceId}/documents/${props.document.id}/dashboard/edit`}
          >
            <PiPencilSimple size={16} />
            <span>Edit</span>
          </Link>
        )}
      </div>
    </div>
  );

  const lastUpdatedAt = useLastUpdatedAt(yDoc);

  if (props.publishing) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium animate-pulse">
            Publishing changes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Layout
      topBarClassname={!props.isEditing ? "dark:bg-base-100 " : undefined}
      topBarContent={topBarContent}
      sidebarContent={sidebarContent}
    >
      <div className="w-full flex relative subpixel-antialiased bg-dashboard-gray flex-1 min-w-0">
        <div className="w-full flex flex-col relative">
          {syncing ? (
            <DashboardSkeleton />
          ) : (
            <SQLExtensionProvider workspaceId={props.document.workspaceId}>
              <DashboardContent
                {...props}
                isEditing={props.isEditing}
                yDoc={yDoc}
                executionQueue={executionQueue}
                aiTasks={aiTasks}
                onToggleSchemaExplorer={onToggleSchemaExplorer}
              />
            </SQLExtensionProvider>
          )}
        </div>

        <div className="w-full fixed bottom-0 bg-white dark:bg-base-100  z-20">
          <EnvBar
            onOpenFiles={onToggleFiles}
            onOpenEnvironment={onToggleEnvironment}
            onOpenEnvVariables={onToggleEnvVariables}
            publishedAt={!props.isEditing ? props.document.publishedAt : null}
            lastUpdatedAt={lastUpdatedAt}
            isViewer={props.role === "viewer"}
          />
        </div>

        <Comments
          workspaceId={props.document.workspaceId}
          documentId={props.document.id}
          visible={selectedSidebar?._tag === "comments"}
          onHide={onHideSidebar}
        />
        <EnvironmentPanel
          visible={selectedSidebar?._tag === "environment"}
          onHide={onHideSidebar}
        />
        {props.role !== "viewer" && !isDeleted && (
          <>
            <EnvVariablesPanel
              workspaceId={props.document.workspaceId}
              visible={selectedSidebar?._tag === "envVariables"}
              onHide={onHideSidebar}
            />
            <Schedules
              workspaceId={props.document.workspaceId}
              documentId={props.document.id}
              isPublished={props.document.publishedAt !== null}
              visible={selectedSidebar?._tag === "schedules"}
              onHide={onHideSidebar}
              onPublish={onPublish}
              publishing={props.publishing}
            />
            <Files
              workspaceId={props.document.workspaceId}
              visible={selectedSidebar?._tag === "files"}
              onHide={onHideSidebar}
              userId={props.user.id}
              yDoc={yDoc}
              executionQueue={executionQueue}
            />
          </>
        )}
      </div>
    </Layout>
  );
}
