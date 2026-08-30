import {
  PiPlayFill,
  PiStop,
  PiClock,
  PiCpu,
  PiDatabase,
  PiCode,
  PiTrash,
  PiCopy,
  PiCheckCircleLight,
} from "react-icons/pi";
import { CopyToClipboard } from "react-copy-to-clipboard";
import type { RefObject } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type * as Y from "yjs";
import {
  type YBlockGroup,
  type YBlock,
  type ExecutionQueue,
  type AITasks,
  type AddBlockGroupBlock,
  type SQLBlock,
  setTitle,
  toggleSQLEditWithAIPromptOpen,
  isSQLBlockEditWithAIPromptOpen,
  closeSQLEditWithAIPrompt,
  updateYText,
  BlockType,
  addGroupedBlock,
  getSQLAttributes,
  createComponentState,
  isExecutionStatusLoading,
  getSQLCodeFormatted,
} from "@sandworm/editor";
import clsx from "clsx";
import type { ConnectDragPreview } from "react-dnd";
import { useRouter } from "next/navigation";
import type { TableSort } from "@sandworm/types";
import { exhaustiveCheck } from "@sandworm/types";
import { head } from "ramda";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { Transition } from "@headlessui/react";
import { useTheme } from "next-themes";
import { HiVariable } from "react-icons/hi2";

import type { ApiDocument, ApiWorkspace } from "@/types";
import useSideBar from "@/components/Editor/hooks/useSideBar";
import { Shimmer } from "@/components/Skeletons";

import { TooltipV2 } from "../../ToolTips";
import type { DashboardMode } from "../../Dashboard";
import { dashboardModeHasControls } from "../../Dashboard/dashboard-types";
import HeaderSelect from "../../HeaderSelect";
import { useEnvironmentStatus } from "../../../hooks/useEnvironmentStatus";
import {
  LoadingEnvText,
  RunningQueryText,
  QuerySucceededText,
  ExecutionFailedText,
} from "../../ExecutionStatusText";
import LargeSpinner from "../../LargeSpinner";
import type { APIDataSources } from "../../../hooks/useDataSources";
import useEditorAwareness from "../../../hooks/useEditorAwareness";
import { useWorkspaces } from "../../../hooks/useWorkspaces";
import { SaveReusableComponentButton } from "../../ReusableComponents";
import { BlockTypePill } from "../../BlockTypePill";
import { useReusableComponents } from "../../../hooks/useReusableComponents";
import { useBlockExecutions } from "../../../hooks/useBlockExecution";
import { useAITaskActions, useAITasks } from "../../../hooks/useAITasks";
import CodeEditor from "../CodeEditor";
import type { CodeEditorRef } from "../CodeEditor";
import HiddenInPublishedButton from "../../HiddenInPublishedButton";
import ApproveDiffButons from "../../ApproveDiffButtons";
import EditWithAIForm from "../../EditWithAIForm";
import { RunningBorderBar } from "../../RunningBorderBar";

import { DataSourceIcon } from "./dataSourceIcons";
import DataframeNameInput from "./DataframeNameInput";
import SQLResult from "./SQLResult";

// =====================================
// ⬢ Types
// =====================================
interface Props {
  block: Y.XmlElement<SQLBlock>;
  layout: Y.Array<YBlockGroup>;
  blocks: Y.Map<YBlock>;
  dataSources: APIDataSources;
  document: ApiDocument;
  isEditable: boolean;
  isPublicMode: boolean;
  dragPreview: ConnectDragPreview | null;
  dashboardMode: DashboardMode | null;
  hasMultipleTabs: boolean;
  isBlockHiddenInPublished: boolean;
  onToggleIsBlockHiddenInPublished: (blockId: string) => void;
  onSchemaExplorer: (dataSourceId: string | null) => void;
  insertBelow: () => void;
  executionQueue: ExecutionQueue;
  userId: string | null;
  aiTasks: AITasks;
  isFullScreen: boolean;
  onDeleteBlock: () => void;
}

// =====================================
// ⬢ ToolTip Content
// =====================================
function AIEditTooltipContent({
  tooltipRef,
  hasOaiKey,
}: {
  tooltipRef: RefObject<HTMLDivElement>;
  hasOaiKey: boolean;
}) {
  return (
    <div
      ref={tooltipRef}
      className={clsx(
        "font-body pointer-events-none absolute opacity-0 transition-opacity group-hover:opacity-100 bg-hunter-950 text-white text-xs p-2 rounded-md flex flex-col items-center justify-center gap-y-1 z-30",
        hasOaiKey ? "w-32" : "w-40"
      )}
    >
      <span className="text-center">
        {hasOaiKey ? " AI edit form" : "Missing AI API key"}
      </span>
      <span className="inline-flex gap-x-1 items-center text-ink-400">
        {hasOaiKey ? (
          <>
            <span>⌘</span>
            <span>+</span>
            <span>e</span>
          </>
        ) : (
          <span>Admins can add an AI key in settings.</span>
        )}
      </span>
    </div>
  );
}

function countSQLLines(source: Y.Text): number {
  const text = source.toString().trim();
  if (!text) return 0;
  return text.split("\n").length;
}

function CollapsedCodeSummary({
  lineCount,
  showOutputHidden,
}: {
  lineCount: number;
  showOutputHidden: boolean;
}) {
  return (
    <div className="flex items-center gap-x-2 px-4 py-1.5 text-xs bg-inputBg dark:bg-base-200 border-t border-hover-border dark:border-border-tertiary">
      <span className="italic text-ink-400">{lineCount} lines hidden</span>
      {showOutputHidden && (
        <>
          <span className="text-ink-300">·</span>
          <span className="text-ink-400">Output hidden</span>
        </>
      )}
    </div>
  );
}

function HatchBackground() {
  return (
    <div
      className="border border-[#E7E1F0] h-2"
      style={{
        backgroundColor: "white",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Crect width='8' height='8' fill='white'/%3E%3Cline x1='0' y1='8' x2='8' y2='0' stroke='%23E7E1F0' stroke-width='1'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

// =====================================
// ⬢  Run Query Tooltip Content
// =====================================
function RunQueryTooltipContent({
  tooltipRef,
}: {
  tooltipRef: RefObject<HTMLDivElement>;
}) {
  return (
    <div
      className="font-body pointer-events-none w-max bg-hunter-950 text-white text-xs p-2 rounded-md flex flex-col gap-y-1"
      ref={tooltipRef}
    >
      <span>Run code</span>
      <span className="inline-flex gap-x-1 items-center text-ink-400">
        <span>⌘</span>
        <span>+</span>
        <span>Enter</span>
      </span>
    </div>
  );
}

const renderRunQueryTooltip = (ref: RefObject<HTMLDivElement>) => (
  <RunQueryTooltipContent tooltipRef={ref} />
);

const CopyToClipboardFixed = CopyToClipboard as unknown as React.ComponentType<{
  text: string;
  onCopy: () => void;
  children: React.ReactNode;
}>;

// =====================================
// ⬢ Main Component
// =====================================
function SQLBlock(props: Props) {
  const [workspaces] = useWorkspaces();
  const { api: sidebarApi } = useSideBar();

  const currentWorkspace: ApiWorkspace | undefined = useMemo(() => {
    if (!props.document) return undefined;
    return workspaces.data.find(w => w.id === props.document.workspaceId);
  }, [workspaces.data, props.document?.workspaceId]);
  const { resolvedTheme } = useTheme();
  const { editSqlWithAi } = useAITaskActions();
  const { fixSqlWithAi } = useAITaskActions();

  const hasOaiKey = useMemo(() => {
    return currentWorkspace?.secrets?.hasAiModelApiKey ?? false;
  }, [currentWorkspace]);

  const [localResultHidden, setLocalResultHidden] = useState<boolean | null>(
    null
  );

  const toggleResultHidden = useCallback(() => {
    if (props.isEditable) {
      props.block.doc?.transact(() => {
        const currentIsResultHidden =
          props.block.getAttribute("isResultHidden");
        props.block.setAttribute("isResultHidden", !currentIsResultHidden);
      });
    } else {
      setLocalResultHidden(prev => {
        const blockResultHidden = props.block.getAttribute("isResultHidden");
        return prev === null ? !blockResultHidden : !prev;
      });
    }
  }, [props.block, props.isEditable]);

  const [localCodeHidden, setLocalCodeHidden] = useState<boolean | null>(null);

  const toggleCodeHidden = useCallback(() => {
    if (props.isEditable) {
      props.block.doc?.transact(() => {
        const currentIsCodeHidden = props.block.getAttribute("isCodeHidden");
        props.block.setAttribute("isCodeHidden", !currentIsCodeHidden);
      });
    } else {
      setLocalCodeHidden(prev => {
        const blockCodeHidden = props.block.getAttribute("isCodeHidden");
        return prev === null ? !blockCodeHidden : !prev;
      });
    }
  }, [props.block, props.isEditable]);

  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const onSQLSelectionChanged = useCallback((code: string | null) => {
    setSelectedCode(code);
  }, []);

  // ⬢  block attributes
  // =====================================
  const {
    dataframeName,
    id: blockId,
    title,
    result,
    page,
    dashboardPage,
    isCodeHidden: isCodeHiddenProp,
    isResultHidden: isResultHiddenProp,
    editWithAIPrompt,
    aiSuggestions,
    dataSourceId,
    isFileDataSource,
    componentId,
    sort,
    dashboardPageSize,
  } = getSQLAttributes(props.block, props.blocks);

  const isCodeHidden =
    (!props.dashboardMode || !dashboardModeHasControls(props.dashboardMode)) &&
    (props.isEditable
      ? isCodeHiddenProp
      : localCodeHidden === null
        ? isCodeHiddenProp
        : localCodeHidden);

  const isResultHidden =
    (!props.dashboardMode || !dashboardModeHasControls(props.dashboardMode)) &&
    (props.isEditable
      ? isResultHiddenProp
      : localResultHidden === null
        ? isResultHiddenProp
        : localResultHidden);

  const { startedAt: environmentStartedAt } = useEnvironmentStatus(
    props.document.workspaceId
  );

  // ⬢  Run handler
  // =====================================
  const onRun = useCallback(() => {
    props.executionQueue.enqueueBlock(
      blockId,
      props.userId,
      environmentStartedAt,
      {
        _tag: "sql",
        isSuggestion: false,
        selectedCode,
      }
    );
  }, [
    props.executionQueue,
    blockId,
    props.userId,
    environmentStartedAt,
    selectedCode,
  ]);

  const onTry = useCallback(() => {
    props.executionQueue.enqueueBlock(
      blockId,
      props.userId,
      environmentStartedAt,
      {
        _tag: "sql",
        isSuggestion: true,
        selectedCode,
      }
    );
  }, [
    props.executionQueue,
    blockId,
    props.userId,
    environmentStartedAt,
    selectedCode,
  ]);

  const executions = useBlockExecutions(
    props.executionQueue,
    props.block,
    "sql"
  );
  const execution = head(executions) ?? null;
  const status = execution?.item.getStatus() ?? { _tag: "idle" };

  const pageExecutions = useBlockExecutions(
    props.executionQueue,
    props.block,
    "sql-load-page"
  );
  const pageExecution = head(pageExecutions);
  const pageStatus = pageExecution?.item.getStatus()._tag ?? "idle";

  const loadingPage = isExecutionStatusLoading(pageStatus);

  const statusIsDisabled: boolean = (() => {
    switch (status._tag) {
      case "idle":
      case "completed":
      case "unknown":
        return false;
      case "running":
      case "enqueued":
      case "aborting":
        return true;
      default:
        return false;
    }
  })();

  const onToggleEditWithAIPromptOpen = useCallback(() => {
    if (!hasOaiKey) {
      return;
    }

    toggleSQLEditWithAIPromptOpen(props.block);
  }, [props.block, hasOaiKey]);

  const dataSource = useMemo(
    () => props.dataSources.find(d => d.data.id === dataSourceId),
    [props.dataSources, dataSourceId]
  );

  // ⬢  Reusable components
  // =====================================
  const [
    { data: components },
    { create: createReusableComponent, update: updateReusableComponent },
  ] = useReusableComponents(props.document.workspaceId);

  const component = useMemo(
    () => components.find(c => c.id === componentId),
    [components, componentId]
  );

  // ⬢  AI Task
  // =====================================
  const editAITasks = useAITasks(props.aiTasks, props.block, "edit-sql");
  const fixAITasks = useAITasks(props.aiTasks, props.block, "fix-sql");
  const aiTask = useMemo(
    () => head(editAITasks.concat(fixAITasks)) ?? null,
    [editAITasks, fixAITasks]
  );

  const isAIEditing =
    aiTask?.getMetadata()._tag === "edit-sql"
      ? isExecutionStatusLoading(aiTask.getStatus()._tag)
      : false;
  const isAIFixing =
    aiTask?.getMetadata()._tag === "fix-sql"
      ? isExecutionStatusLoading(aiTask.getStatus()._tag)
      : false;

  const [editorState, editorAPI] = useEditorAwareness();

  const onCloseEditWithAIPrompt = useCallback(() => {
    if (aiTask?.getMetadata()._tag === "edit-sql") {
      aiTask.setAborting();
    }

    closeSQLEditWithAIPrompt(props.block, false);
    editorAPI.insert(blockId, { scrollIntoView: false });
  }, [props.block, editorAPI.insert, blockId, aiTask]);

  const onChangeDataSource = useCallback(
    (value: string) => {
      if (value === "duckdb") {
        props.block.setAttribute("dataSourceId", null);
        props.block.setAttribute("isFileDataSource", true);
      } else {
        props.block.setAttribute("dataSourceId", value);
        props.block.setAttribute("isFileDataSource", false);
      }
    },
    [props.block]
  );

  const { status: envStatus, loading: envLoading } = useEnvironmentStatus(
    props.document.workspaceId
  );

  const onChangeTitle = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(props.block, e.target.value);
    },
    [props.block]
  );

  const onRunAbort = useCallback(() => {
    switch (status._tag) {
      case "enqueued":
        execution?.batch.removeItem(blockId);
        break;
      case "running":
        execution?.item.setAborting();
        break;
      case "idle":
      case "completed":
      case "unknown":
        onRun();
        break;
      case "aborting":
        break;
      default:
        exhaustiveCheck(status);
    }
  }, [status, execution, onRun, blockId]);

  const { source, configuration } = getSQLAttributes(props.block, props.blocks);
  console.log(configuration);
  const lastQuery = props.block.getAttribute("lastQuery");
  const startQueryTime = props.block.getAttribute("startQueryTime");
  const lastQueryTime = props.block.getAttribute("lastQueryTime");
  const queryStatusText = useMemo(() => {
    switch (status._tag) {
      case "idle":
      case "completed": {
        if (source?.toJSON() === lastQuery && lastQueryTime) {
          // eslint-disable-next-line no-console
          console.log("[DEBUG queryStatusText]", {
            resultType: result?.type,
            result,
            statusTag: status._tag,
          });
          if (result?.type === "success") {
            return (
              <QuerySucceededText
                lastExecutionTime={lastQueryTime}
                isResultHidden={isResultHidden}
                onToggleResultHidden={toggleResultHidden}
              />
            );
          }
          return (
            <ExecutionFailedText
              lastExecutionTime={lastQueryTime}
              isResultHidden={isResultHidden}
              onToggleResultHidden={toggleResultHidden}
            />
          );
        }

        return null;
      }
      case "running":
      case "enqueued":
      case "aborting":
        if (envStatus === "Starting") {
          return <LoadingEnvText />;
        }
        return <RunningQueryText startExecutionTime={startQueryTime ?? null} />;
      case "unknown":
        return null;
      default:
        return null;
    }
  }, [
    status,
    startQueryTime,
    lastQuery,
    lastQueryTime,
    source.toJSON(),
    envStatus,
    result,
  ]);
  const onSubmitEditWithAI = useCallback(async () => {
    const editResult = await editSqlWithAi({
      workspaceId: props.document?.workspaceId,
      documentId: props.document.id,
      blockId,
    });
    if (editResult?.chatId) {
      closeSQLEditWithAIPrompt(props.block, false);
      sidebarApi.openRightPanel("chat", { chatId: editResult.chatId });
    }
  }, [
    editSqlWithAi,
    props.document?.workspaceId,
    props.document.id,
    blockId,
    props.block,
    sidebarApi,
  ]);

  const onAcceptAISuggestion = useCallback(() => {
    if (aiSuggestions) {
      updateYText(source, aiSuggestions.toString());
    }

    props.block.setAttribute("aiSuggestions", null);
  }, [props.block, aiSuggestions, source]);

  const onRejectAISuggestion = useCallback(() => {
    props.block.setAttribute("aiSuggestions", null);
  }, [props.block]);

  const onFixWithAI = useCallback(async () => {
    if (!hasOaiKey) return;

    const fixResult = await fixSqlWithAi({
      workspaceId: props.document?.workspaceId,
      documentId: props.document?.id,
      blockId,
    });

    if (fixResult?.chatId) {
      console.log("opening sidebar");
      sidebarApi.openRightPanel("chat", { chatId: fixResult.chatId });
    }
  }, [
    fixSqlWithAi,
    props.document?.workspaceId,
    props.document.id,
    blockId,
    hasOaiKey,
  ]);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return () => {};
    const timeout = setTimeout(() => {
      setCopied(false);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [copied, setCopied]);

  const diffButtonsVisible =
    !props.isPublicMode && aiSuggestions !== null && status._tag === "idle";

  const router = useRouter();
  const onAddDataSource = useCallback(() => {
    router.push(`/workspace/${props.document.workspaceId}/data-sources`);
  }, [router, props.document.workspaceId]);

  const onToggleFormatSQLCode = useCallback(() => {
    // Our data source identity ("duckdb"/"sandwormcloud"/"dune") isn't a
    // sql-formatter dialect name — there's no meaningful mapping, so format
    // generically rather than pass through a value that was never valid here.
    const sqlCodeFormatted = getSQLCodeFormatted(source, null);

    if (!sqlCodeFormatted) {
      return;
    }

    props.block.setAttribute("aiSuggestions", sqlCodeFormatted);
  }, [source, props.block]);

  const onToggleIsBlockHiddenInPublished = useCallback(() => {
    props.onToggleIsBlockHiddenInPublished(blockId);
  }, [props.onToggleIsBlockHiddenInPublished, blockId]);

  const onSchemaExplorer = useCallback(() => {
    props.onSchemaExplorer(dataSourceId);
  }, [props.onSchemaExplorer, dataSourceId]);

  const onClickWithin = useCallback(() => {
    editorAPI.focus(blockId, { scrollIntoView: false });
  }, [blockId, editorAPI.focus]);

  const dataSourcesOptions = useMemo(
    () =>
      props.dataSources
        .map(d => ({
          value: d.data.id,
          label: d.data.name,
          type: d.type,
          icon: <DataSourceIcon type={d.type} />,
          disabled: d.data.disabled,
        }))
        .toArray(),
    [props.dataSources]
  );

  const isComponentInstance =
    component !== undefined && component.blockId !== blockId;

  const onSaveReusableComponent = useCallback(() => {
    const existingComponent = components.find(c => c.id === componentId);
    if (!existingComponent) {
      const { id: newComponentId, state } = createComponentState(
        props.block,
        props.blocks
      );
      createReusableComponent(
        props.document.workspaceId,
        {
          id: newComponentId,
          blockId,
          documentId: props.document.id,
          state,
          title,
          type: "sql",
        },
        props.document.title,
        props.document.icon || ""
      );
    } else if (!isComponentInstance) {
      updateReusableComponent(
        props.document.workspaceId,
        existingComponent.id,
        {
          state: createComponentState(props.block, props.blocks).state,
          title,
        }
      );
    }
  }, [
    createReusableComponent,
    props.document.workspaceId,
    blockId,
    props.document.id,
    title,
    props.block,
    components,
    isComponentInstance,
    props.document.title,
  ]);

  const onChangeSort = useCallback(
    (newSort: TableSort | null) => {
      const run = () => {
        props.block.setAttribute("sort", newSort);
        props.executionQueue.enqueueBlock(
          props.block,
          props.userId,
          environmentStartedAt,
          {
            _tag: "sql-load-page",
          }
        );
      };

      if (props.block.doc) {
        props.block.doc.transact(run);
      } else {
        run();
      }
    },
    [props.block]
  );

  const onChangePage = useCallback(
    (newPage: number) => {
      const run = () => {
        if (
          props.dashboardMode &&
          !dashboardModeHasControls(props.dashboardMode)
        ) {
          props.block.setAttribute("dashboardPage", newPage);
        } else {
          props.block.setAttribute("page", newPage);
        }
        props.executionQueue.enqueueBlock(
          props.block,
          props.userId,
          environmentStartedAt,
          {
            _tag: "sql-load-page",
          }
        );
      };

      if (props.block.doc) {
        props.block.doc.transact(run);
      } else {
        run();
      }
    },
    [props.block, props.dashboardMode, props.userId, environmentStartedAt]
  );

  const flags = { visualizationsV2: true };

  const isVisualizationButtonDisabled =
    props.block.getAttribute("result")?.type !== "success" || !props.isEditable;

  const onAddVisualization = useCallback(() => {
    const currentBlockId = props.block.getAttribute("id");

    const blockGroup = props.layout.toArray().find(bg => {
      return bg
        .getAttribute("tabs")
        ?.toArray()
        .some(tab => {
          return tab.getAttribute("id") === currentBlockId;
        });
    });
    const blockGroupId = blockGroup?.getAttribute("id");

    if (!currentBlockId || !blockGroupId) {
      return;
    }

    const block: AddBlockGroupBlock = {
      type: flags.visualizationsV2
        ? BlockType.VisualizationV2
        : BlockType.Visualization,
      dataframeName: props.block.getAttribute("dataframeName")?.value ?? null,
    };

    addGroupedBlock(
      props.layout,
      props.blocks,
      blockGroupId,
      currentBlockId,
      block,
      "after"
    );
  }, [props.layout, props.blocks, props.block, flags]);

  const headerSelectValue = isFileDataSource ? "duckdb" : dataSourceId;

  const isEditorFocused = editorState.cursorBlockId === blockId;
  const isRunButtonDisabled =
    status._tag === "aborting" ||
    execution?.batch.isRunAll() ||
    headerSelectValue === null;

  const runTooltipContent = useMemo(() => {
    if (status._tag !== "idle") {
      switch (status._tag) {
        case "enqueued":
          return {
            title: "This block is enqueud",
            message: isRunButtonDisabled
              ? "When running entire documents, you cannot remove individual blocks from the queue."
              : "It will run once the previous blocks finish executing. Click to remove it from the queue.",
          };
        case "running": {
          if (envStatus !== "Running" && !envLoading) {
            return {
              title: "Your environment is starting",
              message:
                "Please hang tight. We need to save your query as a dataframe so you can use it in Python blocks.",
            };
          }

          if (execution?.batch.isRunAll() ?? false) {
            return {
              title: "This block is running.",
              message:
                "When running entire documents, you cannot stop individual blocks.",
            };
          }

          return null;
        }
        case "unknown":
        case "aborting":
        case "completed":
          return null;
        default:
          return null;
      }
    } else if (props.dataSources.size > 0 || headerSelectValue === "duckdb") {
      return {
        content: renderRunQueryTooltip,
      };
    } else {
      return {
        title: "No data sources",
        message: "Please add a data source to run this query.",
      };
    }
  }, [
    status,
    envStatus,
    envLoading,
    execution,
    props.dataSources.size,
    headerSelectValue,
    isRunButtonDisabled,
  ]);

  const codeEditor = useRef<CodeEditorRef>(null);

  const onAddVariable = useCallback(() => {
    const snippet = `{{ your_var_name }}`;
    codeEditor.current?.insert(
      snippet,
      { from: 3, to: snippet.length - 3 },
      p => (p === 0 ? "end" : p)
    );
  }, [codeEditor]);

  const onChangeDashboardPageSize = useCallback(
    (pageSize: number) => {
      const run = () => {
        props.block.setAttribute("dashboardPageSize", pageSize);
        props.executionQueue.enqueueBlock(
          props.block,
          props.userId,
          environmentStartedAt,
          {
            _tag: "sql-load-page",
          }
        );
      };

      if (props.block.doc) {
        props.block.doc.transact(run);
      } else {
        run();
      }
    },
    [props.block, props.userId, environmentStartedAt]
  );

  const aiEditTooltipContent = useCallback(
    (ref: RefObject<HTMLDivElement>) => (
      <AIEditTooltipContent tooltipRef={ref} hasOaiKey={hasOaiKey} />
    ),
    [hasOaiKey]
  );

  // ⬢  Dashnboard Mode
  // =====================================
  if (props.dashboardMode && !dashboardModeHasControls(props.dashboardMode)) {
    if (!result) {
      return (
        <div className="flex items-center justify-center h-full">
          {status._tag !== "idle" ? (
            <LargeSpinner color="#b8f229" />
          ) : (
            <div className="text-ink-400">No query results</div>
          )}
        </div>
      );
    }

    return (
      <SQLResult
        page={page}
        dashboardPage={dashboardPage}
        result={result}
        isPublic={props.isPublicMode}
        documentId={props.document.id}
        workspaceId={props.document.workspaceId}
        blockId={blockId}
        dataframeName={dataframeName?.value ?? ""}
        isResultHidden={isResultHidden ?? false}
        toggleResultHidden={toggleResultHidden}
        isFixingWithAI={isAIFixing}
        onFixWithAI={onFixWithAI}
        dashboardMode={props.dashboardMode}
        canFixWithAI={hasOaiKey}
        sort={sort}
        isAddVisualizationDisabled={isVisualizationButtonDisabled}
        onAddVisualization={onAddVisualization}
        onChangeSort={onChangeSort}
        onChangePage={onChangePage}
        onChangeDashboardPageSize={onChangeDashboardPageSize}
        loadingPage={loadingPage}
        hasTitle={title.trim() !== ""}
        dashboardPageSize={dashboardPageSize}
      />
    );
  }

  // ⬢  Main Component Mode
  // =====================================
  return (
    <div
      className="relative group/block mt-6"
      role="presentation"
      onClick={onClickWithin}
      data-block-id={blockId}
    >
      <div
        className={clsx(
          "relative rounded-2xl border-[1.5px]",
          props.isBlockHiddenInPublished && "border-dashed",
          props.hasMultipleTabs ? "rounded-tl-2xl" : "rounded-tl-2xl",
          {
            "border-primary block-focus-ring":
              !statusIsDisabled &&
              ((isEditorFocused && editorState.mode === "insert") ||
                isAIEditing ||
                aiSuggestions !== null),
            "border-hover-border block-focus-ring dark:border-border-tertiary":
              statusIsDisabled,
            "border-hover-border shadow-none":
              !statusIsDisabled &&
              !isAIEditing &&
              aiSuggestions === null &&
              isEditorFocused &&
              editorState.mode === "normal",
            "border-hover-border block-shadow-soft dark:border-border-tertiary":
              !statusIsDisabled &&
              !isAIEditing &&
              aiSuggestions === null &&
              !isEditorFocused,
          }
        )}
      >
        <RunningBorderBar active={statusIsDisabled} />
        <div
          className={clsx(
            "rounded-2xl overflow-hidden",
            statusIsDisabled ? "bg-gray-100" : "bg-white dark:bg-base-100 ",
            props.hasMultipleTabs ? "rounded-tl-none" : "",
            !(isResultHidden || !result) &&
              !isCodeHidden &&
              "border-b border-border-secondary dark:border-border-tertiary",
            (isResultHidden || !result) && !isCodeHidden && "rounded-b-2xl",
            (isResultHidden || !result) && isCodeHidden && "rounded-b-2xl"
          )}
        >
          <div
            className={clsx(
              "rounded-t-2xl dark:bg-base-100  ",
              props.hasMultipleTabs ? "rounded-tl-none" : "",
              isCodeHidden && (isResultHidden || !result) ? "rounded-b-2xl" : ""
            )}
            ref={d => {
              props.dragPreview?.(d);
            }}
          >
            <div
              className={clsx(
                "flex items-center justify-between px-3 pr-0 gap-x-4 font-body  h-10 rounded-t-2xl",
                !isCodeHidden &&
                  "divide-x divide-border-secondary dark:divide-border-tertiary",
                props.hasMultipleTabs ? "rounded-tl-none" : "",
                isCodeHidden && (isResultHidden || !result)
                  ? "rounded-b-md"
                  : "border-b border-hover-border dark:border-border-tertiary"
              )}
            >
              <div className="select-none text-gray-300 text-xs flex items-center w-full h-full gap-x-1.5 px-4">
                <div className="relative group w-4 h-4">
                  <button
                    type="button"
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={toggleCodeHidden}
                  >
                    {isCodeHidden ? (
                      <ChevronRightIcon className="h-4 w-4" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <input
                  type="text"
                  className={clsx(
                    "text-sm font-body  font-normal pl-1 block w-full border-0 border-b border-transparent focus:border-primary focus:outline-none text-ink-100 placeholder:text-ink-300 py-0 h-2/3 bg-transparent focus:bg-base-100"
                  )}
                  placeholder={props.isEditable ? "Add a title..." : "SQL"}
                  value={title}
                  onChange={onChangeTitle}
                  disabled={!props.isEditable}
                />
              </div>
              <Transition
                as="div"
                className="print:hidden flex items-center gap-x-0 group-focus/block:opacity-100 h-full "
                show={!isCodeHidden}
                enter="transition-opacity ease-in duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <DataframeNameInput
                  disabled={!props.isEditable || statusIsDisabled}
                  block={props.block}
                  environmentStartedAt={environmentStartedAt}
                  userId={props.userId}
                  executionQueue={props.executionQueue}
                />
                <HeaderSelect
                  /*                   hidden={props.isPublicMode}
                   */ value={headerSelectValue ?? ""}
                  options={dataSourcesOptions}
                  onChange={onChangeDataSource}
                  disabled={!props.isEditable || statusIsDisabled}
                  onAdd={
                    props.dataSources.size === 0 ? onAddDataSource : undefined
                  }
                  onAddLabel={
                    props.dataSources.size === 0 ? "New data source" : undefined
                  }
                />
              </Transition>
              <Transition
                as="div"
                className="print:hidden flex items-center gap-x-1 text-[11px] text-ink-400 whitespace-nowrap pr-3"
                show={!(!isCodeHidden && dataframeName?.value)}
                enter="transition-opacity ease-in duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <CopyToClipboardFixed
                  text={dataframeName?.value ?? ""}
                  onCopy={() => setCopied(true)}
                >
                  <code className="group relative flex cursor-pointer items-center gap-x-1.5 rounded-lg bg-hover-bg px-3 py-1 font-body-mono text-ink-400">
                    {copied ? "Copied!" : dataframeName?.value}

                    {copied ? (
                      <PiCheckCircleLight
                        size={14}
                        className="shrink-0 text-primary"
                      />
                    ) : (
                      <PiCopy size={14} className="shrink-0 text-ink-400" />
                    )}

                    <div className="font-body pointer-events-none absolute -top-2 right-0 z-20 flex w-56 -translate-y-full scale-0 flex-col gap-y-1 whitespace-normal rounded-md bg-hunter-950 p-2 text-xs text-white opacity-0 transition-opacity group-hover:scale-100 group-hover:opacity-100">
                      <span className="text-center text-ink-400">
                        Use this variable name to reference the results as a
                        Pandas dataframe in further Python blocks.{" "}
                        <span className="underline">Click to copy</span>.
                      </span>
                    </div>
                  </code>
                </CopyToClipboardFixed>
              </Transition>
            </div>
          </div>
          <Transition
            show={!isCodeHidden}
            as="div"
            enter="transition-all ease-in duration-300 overflow-hidden"
            enterFrom="max-h-0"
            enterTo="max-h-[var(--dynamic-height)]"
            leave="transition-[max-height] ease-out duration-300 overflow-hidden"
            leaveFrom="max-h-[var(--dynamic-height)]"
            leaveTo="max-h-0"
            style={
              {
                "--dynamic-height": `${
                  Math.max(
                    source.toString().split("\n").length,
                    aiSuggestions?.toString().split("\n").length ?? 0
                  ) *
                    16 +
                  50
                }px`,
              } as React.CSSProperties
            }
          >
            <div
              className={clsx((isResultHidden || !result) && "rounded-b-xl")}
            >
              <div className="print:hidden py-5 ">
                <div>
                  <CodeEditor
                    ref={codeEditor}
                    workspaceId={props.document.workspaceId}
                    documentId={props.document.id}
                    blockId={blockId}
                    source={source}
                    language="sql"
                    readOnly={!props.isEditable || statusIsDisabled}
                    onEditWithAI={onToggleEditWithAIPromptOpen}
                    onRun={onRun}
                    onInsertBlock={props.insertBelow}
                    diff={aiSuggestions ?? undefined}
                    dataSourceId={dataSourceId}
                    disabled={statusIsDisabled}
                    onSelectionChanged={onSQLSelectionChanged}
                    isDark={resolvedTheme === "dark"}
                  />
                </div>
              </div>
              <ApproveDiffButons
                visible={diffButtonsVisible && !isCodeHidden}
                canTry={status._tag === "idle"}
                onTry={onTry}
                onAccept={onAcceptAISuggestion}
                onReject={onRejectAISuggestion}
                onUndo={() => {}}
              />
              {isSQLBlockEditWithAIPromptOpen(props.block) &&
              !props.isPublicMode ? (
                <EditWithAIForm
                  loading={isAIEditing}
                  disabled={isAIEditing || aiSuggestions !== null}
                  onSubmit={onSubmitEditWithAI}
                  onClose={onCloseEditWithAIPrompt}
                  value={editWithAIPrompt}
                  hasOutput={result !== null}
                />
              ) : (
                <div
                  className={clsx("print:hidden px-3 pb-3", {
                    hidden: isCodeHidden,
                    "rounded-b-md": isResultHidden || !result,
                  })}
                >
                  <div className="flex justify-between text-xs pt-2 pb-3 px-3 -mx-3 -mb-3 bg-inputBg dark:bg-base-200 border-t border-hover-border">
                    <div className="flex items-center">{queryStatusText}</div>
                    <div className="flex items-center gap-x-2">
                      {!props.isPublicMode &&
                        aiSuggestions === null &&
                        props.isEditable &&
                        !isAIFixing &&
                        headerSelectValue !== "duckdb" && (
                          <button
                            type="button"
                            onClick={onSchemaExplorer}
                            className={clsx(
                              !props.isEditable
                                ? "cursor-not-allowed bg-gray-200 dark:bg-base-100"
                                : "cursor-pointer bg-base-200 hover:bg-gray-50 hover:text-gray-700",
                              "flex items-center border rounded-md border-hover-border px-2 py-1 gap-x-1 text-ink-300 group relative font-body"
                            )}
                          >
                            <PiDatabase className="w-[11.5px] h-[11.5px] text-ink-300" />
                            <span>Schema</span>
                          </button>
                        )}

                      {!props.isPublicMode &&
                        props.isEditable &&
                        aiSuggestions === null && (
                          <TooltipV2<HTMLButtonElement>
                            title="Add a variable"
                            message="Interpolate Python variables into this query"
                            active
                            className="w-48"
                          >
                            {ref => (
                              <button
                                type="button"
                                ref={ref}
                                disabled={!props.isEditable}
                                className={clsx(
                                  !props.isEditable
                                    ? "cursor-not-allowed bg-gray-200 dark:bg-base-100"
                                    : "cursor-pointer bg-base-200 hover:bg-hover-bg hover:text-gray-700 hover:border-primary",
                                  "flex items-center border rounded-md border-hover-border px-2 py-1 gap-x-1 text-ink-300 group relative font-body"
                                )}
                                onClick={onAddVariable}
                              >
                                <HiVariable className="w-[11.5px] h-[11.5px] text-ink-300" />
                                <span>Variable</span>
                              </button>
                            )}
                          </TooltipV2>
                        )}
                      {!props.isPublicMode &&
                        props.isEditable &&
                        aiSuggestions === null &&
                        !isAIFixing && (
                          <TooltipV2<HTMLButtonElement>
                            message="Format and structure your SQL code for better readability."
                            active
                          >
                            {ref => (
                              <button
                                type="button"
                                ref={ref}
                                disabled={!props.isEditable}
                                className={clsx(
                                  !props.isEditable
                                    ? "cursor-not-allowed bg-gray-200 dark:bg-base-100"
                                    : "cursor-pointer bg-base-200 hover:bg-hover-bg hover:text-gray-700 hover:border-primary",
                                  "flex items-center border rounded-md border-hover-border px-2 py-1 gap-x-1 text-ink-300 group relative font-body"
                                )}
                                onClick={onToggleFormatSQLCode}
                              >
                                <PiCode className="w-[11.5px] h-[11.5px] text-ink-300" />
                                <span>Format</span>
                              </button>
                            )}
                          </TooltipV2>
                        )}
                      {!props.isPublicMode &&
                        aiSuggestions === null &&
                        props.isEditable &&
                        !isAIFixing && (
                          <TooltipV2<HTMLButtonElement>
                            content={aiEditTooltipContent}
                            active
                          >
                            {ref => (
                              <button
                                type="button"
                                ref={ref}
                                disabled={!props.isEditable}
                                onClick={onToggleEditWithAIPromptOpen}
                                className={clsx(
                                  !props.isEditable || !hasOaiKey
                                    ? "cursor-not-allowed bg-gray-200 dark:bg-base-100"
                                    : "cursor-pointer bg-base-200 hover:bg-hover-bg hover:text-gray-700 hover:border-primary",
                                  "flex items-center border rounded-md border-hover-border px-2 py-1 gap-x-1 text-ink-300 group relative font-body"
                                )}
                              >
                                <PiCpu className="w-[11.5px] h-[11.5px] text-ink-300" />
                                <span>Edit with AI</span>
                              </button>
                            )}
                          </TooltipV2>
                        )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Transition>

          {isCodeHidden && (
            <CollapsedCodeSummary
              lineCount={countSQLLines(source)}
              showOutputHidden={Boolean(isResultHidden && result)}
            />
          )}
          {((result && !isResultHidden) || isCodeHidden) && <HatchBackground />}
          {result && (
            <SQLResult
              page={page}
              dashboardPage={dashboardPage}
              result={result}
              isPublic={false}
              documentId={props.document.id}
              workspaceId={props.document.workspaceId}
              blockId={blockId}
              dataframeName={dataframeName?.value ?? ""}
              isResultHidden={isResultHidden ?? false}
              toggleResultHidden={toggleResultHidden}
              isFixingWithAI={isAIFixing}
              onFixWithAI={onFixWithAI}
              dashboardMode={props.dashboardMode}
              canFixWithAI={hasOaiKey}
              sort={sort}
              isAddVisualizationDisabled={isVisualizationButtonDisabled}
              onAddVisualization={onAddVisualization}
              onChangeSort={onChangeSort}
              onChangePage={onChangePage}
              loadingPage={loadingPage}
              onChangeDashboardPageSize={onChangeDashboardPageSize}
              hasTitle={title.trim() !== ""}
              dashboardPageSize={dashboardPageSize}
            />
          )}
          {!result && statusIsDisabled && (
            <div className="px-4 py-4 space-y-3">
              <Shimmer className="h-3 w-full" />
              <Shimmer className="h-3 w-3/4" />
              <Shimmer className="h-3 w-1/2" />
            </div>
          )}
          {!result && !statusIsDisabled && isCodeHidden && (
            <div className="flex items-center px-3 h-10 text-xs text-ink-400 bg-inputBg dark:bg-base-200">
              No output
            </div>
          )}
        </div>
      </div>
      <div className="absolute left-0 top-0 -translate-y-full pb-2">
        <BlockTypePill
          label="SQL"
          icon={<PiDatabase className="w-[14px] h-[14px]" />}
        />
      </div>
      <div
        className={clsx(
          "absolute transition-opacity opacity-0 group-hover/block:opacity-100 right-0 top-0 -translate-y-full pb-2 flex flex-row gap-x-1",
          isEditorFocused || statusIsDisabled ? "opacity-100" : "opacity-0",
          !props.isEditable ? "hidden" : "flex"
        )}
      >
        <TooltipV2<HTMLButtonElement> {...runTooltipContent} active>
          {ref => (
            <button
              type="button"
              ref={ref}
              onClick={onRunAbort}
              disabled={isRunButtonDisabled}
              className={clsx(
                {
                  "bg-gray-200": isRunButtonDisabled,
                  "bg-red-200":
                    status._tag === "running" && envStatus === "Running",
                  "bg-yellow-300":
                    !isRunButtonDisabled &&
                    (status._tag === "enqueued" ||
                      (status._tag === "running" && envStatus !== "Running")),
                  "bg-base-200 ":
                    !isRunButtonDisabled && status._tag === "idle",
                  "bg-inputBg":
                    !isRunButtonDisabled &&
                    status._tag !== "idle" &&
                    status._tag !== "running" &&
                    status._tag !== "enqueued",
                },
                "rounded-[5px] border-hover-border border  dark:border-border-tertiary h-[24px] min-w-[24px] flex items-center justify-center relative group disabled:cursor-not-allowed hover:bg-hover-bg hover:border-primary"
              )}
            >
              {status._tag !== "idle" ? (
                <div>
                  {status._tag === "enqueued" ? (
                    <PiClock className="w-[13px] h-[13px] text-ink-navy" />
                  ) : (
                    <PiStop className="w-[13px] h-[13px] text-ink-navy" />
                  )}
                </div>
              ) : (
                <PiPlayFill className="w-[13px] h-[13px] text-ink-navy" />
              )}
            </button>
          )}
        </TooltipV2>
        {!props.dashboardMode && (
          <HiddenInPublishedButton
            isBlockHiddenInPublished={props.isBlockHiddenInPublished}
            onToggleIsBlockHiddenInPublished={onToggleIsBlockHiddenInPublished}
            hasMultipleTabs={props.hasMultipleTabs}
            isCodeHidden={isCodeHidden}
            onToggleIsCodeHidden={toggleCodeHidden}
            isOutputHidden={isResultHidden}
            onToggleIsOutputHidden={toggleResultHidden}
          />
        )}

        {((result && !isResultHidden) || !isCodeHidden) &&
          !props.dashboardMode && (
            <SaveReusableComponentButton
              isComponent={blockId === component?.blockId}
              onSave={onSaveReusableComponent}
              disabled={!props.isEditable || isComponentInstance}
              isComponentInstance={isComponentInstance}
            />
          )}
        <button
          type="button"
          onClick={props.onDeleteBlock}
          aria-label="Delete block"
          className="bg-[#FFDBDB] rounded-[5px] h-[24px] min-w-[24px] flex items-center justify-center group hover:bg-error"
        >
          <PiTrash className="w-[13px] h-[13px] text-ink-navy group-hover:text-white" />
        </button>
      </div>
    </div>
  );
}

export default SQLBlock;
