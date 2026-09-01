import {
  PiPlayFill,
  PiStop,
  PiClock,
  PiCpu,
  PiCode,
  PiTrash,
} from "react-icons/pi";
import type * as Y from "yjs";
import {
  type YBlock,
  type ExecutionQueue,
  type AITasks,
  type PythonBlock,
  setTitle,
  getPythonAISuggestions,
  isPythonBlockEditWithAIPromptOpen,
  getPythonBlockEditWithAIPrompt,
  closePythonEditWithAIPrompt,
  togglePythonEditWithAIPromptOpen,
  getBaseAttributes,
  getPythonAttributes,
  createComponentState,
  updateYText,
  isExecutionStatusLoading,
} from "@sandworm/editor";
import clsx from "clsx";
import type { RefObject } from "react";
import { useCallback, useMemo, useState } from "react";
import type { ConnectDragPreview } from "react-dnd";
import { exhaustiveCheck } from "@sandworm/types";
import { head } from "ramda";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Transition } from "@headlessui/react";
import { useTheme } from "next-themes";

import { CodeIcon } from "@/components/Assets/Blocks/CodeIcon";
import type { ApiDocument, ApiWorkspace } from "@/types";
import useSideBar from "@/components/Editor/hooks/useSideBar";
import { Shimmer } from "@/components/Skeletons";

import { BlockTypePill } from "../../BlockTypePill";
import { useBlockExecutions } from "../../../hooks/useBlockExecution";
import { useAITaskActions, useAITasks } from "../../../hooks/useAITasks";
import { TooltipV2 } from "../../ToolTips";
import type { DashboardMode } from "../../Dashboard";
import { dashboardModeHasControls } from "../../Dashboard/dashboard-types";
import { useReusableComponents } from "../../../hooks/useReusableComponents";
import { SaveReusableComponentButton } from "../../ReusableComponents";
import { useWorkspaces } from "../../../hooks/useWorkspaces";
import useEditorAwareness from "../../../hooks/useEditorAwareness";
import ScrollBar from "../../ScrollBar";
import {
  RunningQueryText,
  LoadingEnvText,
  PythonSucceededText,
  ExecutionFailedText,
} from "../../ExecutionStatusText";
import { useEnvironmentStatus } from "../../../hooks/useEnvironmentStatus";
import CodeEditor from "../CodeEditor";
import HiddenInPublishedButton from "../../HiddenInPublishedButton";
import EditWithAIForm from "../../EditWithAIForm";
import ApproveDiffButons from "../../ApproveDiffButtons";
import { RunningBorderBar } from "../../RunningBorderBar";

import { PythonOutputs, getDataFrameDimensions } from "./PythonOutput";

// =====================================
// ⬢ Types
// =====================================
interface Props {
  document: ApiDocument;
  block: Y.XmlElement<PythonBlock>;
  blocks: Y.Map<YBlock>;
  isEditable: boolean;
  dragPreview: ConnectDragPreview | null;
  isPublicMode: boolean;
  isPDF: boolean;
  dashboardMode: DashboardMode | null;
  hasMultipleTabs: boolean;
  isBlockHiddenInPublished: boolean;
  onToggleIsBlockHiddenInPublished: (blockId: string) => void;
  insertBelow?: () => void;
  executionQueue: ExecutionQueue;
  aiTasks: AITasks;
  userId: string | null;
  isFullScreen: boolean;
  workspaceId: string;
  onDeleteBlock: () => void;
}

// =====================================
// ⬢ Tooltip Content Components
// =====================================
function RunCodeTooltipContent({
  tooltipRef,
}: {
  tooltipRef: RefObject<HTMLDivElement>;
}) {
  return (
    <div
      className="font-body pointer-events-none w-max bg-black text-white text-xs p-2 rounded-md flex flex-col gap-y-1"
      ref={tooltipRef}
    >
      <span>Run code</span>
      <span className="inline-flex gap-x-1 items-center text-ink-300">
        <span>⌘</span>
        <span>+</span>
        <span>Enter</span>
      </span>
    </div>
  );
}

const renderRunCodeTooltip = (ref: RefObject<HTMLDivElement>) => (
  <RunCodeTooltipContent tooltipRef={ref} />
);

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
        {hasOaiKey ? "Open AI edit form" : "Missing OpenAI API key"}
      </span>
      <span className="inline-flex gap-x-1 items-center text-ink-400">
        {hasOaiKey ? (
          <>
            <span>⌘</span>
            <span>+</span>
            <span>e</span>
          </>
        ) : (
          <span>Admins can add an OpenAI key in settings.</span>
        )}
      </span>
    </div>
  );
}

// =====================================
// ⬢ Hatch / Collapsed Summary
// =====================================
function HatchBackground() {
  return (
    <div className="hatch-bg border border-[#E7E1F0] dark:border-legacy-lightText h-2" />
  );
}

function countPythonLines(source: Y.Text): number {
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
    <div className="flex items-center gap-x-2 px-4 py-1.5 text-xs bg-inputBg dark:bg-header-surface border-t border-hover-border dark:border-border-dark">
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

function PythonResultFooter({
  outputCount,
  dataframeDimensions,
  isResultHidden,
  toggleResultHidden,
}: {
  outputCount: number;
  dataframeDimensions: string | null;
  isResultHidden: boolean;
  toggleResultHidden: () => void;
}) {
  return (
    <div className="flex items-center px-3 h-10 text-xs text-ink-400 bg-inputBg dark:bg-header-surface border-t border-hover-border dark:border-border-dark">
      {outputCount} {outputCount === 1 ? "output" : "outputs"}
      {dataframeDimensions && ` · ${dataframeDimensions}`}
      {isResultHidden && (
        <button
          type="button"
          className="text-gray-300 pl-3 hover:text-ink-400 cursor-pointer"
          onClick={toggleResultHidden}
        >
          collapsed
        </button>
      )}
    </div>
  );
}

// =====================================
// ⬢ PythonBlock
// =====================================
function PythonBlock(props: Props) {
  const [workspaces] = useWorkspaces();
  const { api: sidebarApi } = useSideBar();

  const currentWorkspace: ApiWorkspace | undefined = useMemo(
    () => workspaces.data.find(w => w.id === props.document.workspaceId),
    [workspaces.data, props.document.workspaceId]
  );
  const { resolvedTheme } = useTheme();

  const hasOaiKey = useMemo(
    () => currentWorkspace?.secrets?.hasAiModelApiKey ?? false,
    [currentWorkspace]
  );

  const {
    status: envStatus,
    loading: envLoading,
    startedAt: environmentStartedAt,
  } = useEnvironmentStatus(props.document.workspaceId);

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

  const executions = useBlockExecutions(
    props.executionQueue,
    props.block,
    "python"
  );
  const execution = head(executions) ?? null;
  const status = execution?.item.getStatus()._tag ?? "idle";

  const editAITasks = useAITasks(props.aiTasks, props.block, "edit-python");
  const fixAITasks = useAITasks(props.aiTasks, props.block, "fix-python");
  const aiTask = useMemo(
    () => head(editAITasks.concat(fixAITasks)) ?? null,
    [editAITasks, fixAITasks]
  );

  // ⬢  block attributes
  // =====================================
  const { id: blockId, componentId } = getPythonAttributes(props.block);
  const { source } = getPythonAttributes(props.block);
  const lastQuery = props.block.getAttribute("lastQuery");
  const startQueryTime = props.block.getAttribute("startQueryTime");
  const lastQueryTime = props.block.getAttribute("lastQueryTime");
  const results = props.block.getAttribute("result") ?? [];
  const dataframeDimensions = useMemo(() => {
    const dimensions = results
      .filter(result => result.type === "html")
      .map(result => getDataFrameDimensions(result.html));

    return dimensions.find(dimension => dimension !== null) ?? null;
  }, [results]);
  // Tables should sit flush against the result panel's edges (no gutter),
  // but only when the block's *only* output is a table — mixed output
  // blocks (e.g. a print + a dataframe) keep the normal padded layout.
  const isTableOnlyOutput =
    results.length > 0 && results.every(result => result.type === "html");
  const aiSuggestions = getPythonAISuggestions(props.block);
  const editWithAIPrompt = getPythonBlockEditWithAIPrompt(props.block);
  const { title } = getBaseAttributes(props.block);
  const { editPythonWithAi } = useAITaskActions();
  const { fixPythonWithAi } = useAITaskActions();

  // ⬢  Run handler
  // =====================================
  const onRun = useCallback(() => {
    props.executionQueue.enqueueBlock(
      blockId,
      props.userId,
      environmentStartedAt,
      { _tag: "python", isSuggestion: false }
    );
  }, [props.executionQueue, blockId, props.userId, environmentStartedAt]);

  const onTry = useCallback(() => {
    props.executionQueue.enqueueBlock(
      blockId,
      props.userId,
      environmentStartedAt,
      { _tag: "python", isSuggestion: true }
    );
  }, [props.executionQueue, blockId, props.userId, environmentStartedAt]);

  const onRunAbort = useCallback(() => {
    switch (status) {
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

  const statusIsDisabled = isExecutionStatusLoading(status);

  const onToggleEditWithAIPromptOpen = useCallback(() => {
    if (!hasOaiKey) return;
    togglePythonEditWithAIPromptOpen(props.block);
  }, [props.block, hasOaiKey]);

  const [editorState, editorAPI] = useEditorAwareness();

  const onCloseEditWithAIPrompt = useCallback(() => {
    if (aiTask?.getMetadata()._tag === "edit-sql") {
      aiTask.setAborting();
    }
    closePythonEditWithAIPrompt(props.block, false);
    editorAPI.insert(blockId, { scrollIntoView: false });
  }, [props.block, editorAPI, blockId, aiTask]);

  const onSubmitEditWithAI = useCallback(async () => {
    const result = await editPythonWithAi({
      workspaceId: props.workspaceId,
      documentId: props.document.id,
      blockId,
    });
    if (result?.chatId) {
      closePythonEditWithAIPrompt(props.block, false);
      sidebarApi.openRightPanel("chat", { chatId: result.chatId });
    }
  }, [
    editPythonWithAi,
    props.workspaceId,
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

    const fixResult = await fixPythonWithAi({
      workspaceId: props.workspaceId,
      documentId: props.document.id,
      blockId,
    });

    if (fixResult?.chatId) {
      console.log("opening sidebar");
      sidebarApi.openRightPanel("chat", { chatId: fixResult.chatId });
    }
  }, [
    fixPythonWithAi,
    sidebarApi,
    props.workspaceId,
    props.document.id,
    blockId,
    hasOaiKey,
  ]);

  const [
    { data: components },
    { create: createReusableComponent, update: updateReusableComponent },
  ] = useReusableComponents(props.document.workspaceId);

  const component = useMemo(
    () => components.find(c => c.id === componentId),
    [components, componentId]
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
          type: "python",
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
    props.blocks,
    components,
    componentId,
    isComponentInstance,
    props.document.title,
    props.document.icon,
    updateReusableComponent,
  ]);

  const isCodeHidden =
    (!props.dashboardMode || !dashboardModeHasControls(props.dashboardMode)) &&
    (props.isEditable
      ? (props.block.getAttribute("isCodeHidden") ?? false)
      : localCodeHidden === null
        ? (props.block.getAttribute("isCodeHidden") ?? false)
        : localCodeHidden);

  const isResultHidden =
    (!props.dashboardMode || !dashboardModeHasControls(props.dashboardMode)) &&
    (props.isEditable
      ? (props.block.getAttribute("isResultHidden") ?? false)
      : localResultHidden === null
        ? (props.block.getAttribute("isResultHidden") ?? false)
        : localResultHidden);

  const isAIEditing =
    aiTask?.getMetadata()._tag === "edit-python"
      ? isExecutionStatusLoading(aiTask.getStatus()._tag)
      : false;

  const isAIFixing =
    aiTask?.getMetadata()._tag === "fix-python"
      ? isExecutionStatusLoading(aiTask.getStatus()._tag)
      : false;

  const isEditorFocused = editorState.cursorBlockId === blockId;
  const isRunButtonDisabled =
    status === "aborting" || execution?.batch.isRunAll();
  const diffButtonsVisible =
    !props.isPublicMode && aiSuggestions !== null && status === "idle";

  const onChangeTitle = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(props.block, e.target.value);
    },
    [props.block]
  );

  const onToggleIsBlockHiddenInPublished = useCallback(() => {
    props.onToggleIsBlockHiddenInPublished(blockId);
  }, [props.onToggleIsBlockHiddenInPublished, blockId]);

  const onClickWithin = useCallback(() => {
    editorAPI.focus(blockId, { scrollIntoView: false });
  }, [blockId, editorAPI]);

  // ⬢  Query Status Text:
  // =====================================
  const queryStatusText: JSX.Element | null = useMemo(() => {
    switch (status) {
      case "idle":
      case "completed":
        console.log("vava");
        if (source?.toJSON() === lastQuery && lastQueryTime) {
          // eslint-disable-next-line no-console
          console.log("[DEBUG python queryStatusText]", {
            results,
            hasError: results.some(r => r.type === "error"),
            status,
          });
          if (results.some(r => r.type === "error")) {
            return (
              <ExecutionFailedText
                lastExecutionTime={lastQueryTime}
                isResultHidden={isResultHidden ?? false}
                onToggleResultHidden={toggleResultHidden}
              />
            );
          }
          return (
            <PythonSucceededText
              lastExecutionTime={lastQueryTime}
              isResultHidden={isResultHidden ?? false}
              onToggleResultHidden={toggleResultHidden}
            />
          );
        }
        return null;
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
    source,
    envStatus,
    isResultHidden,
    toggleResultHidden,
    results,
  ]);

  const runTooltipContent = useMemo(() => {
    if (status === "idle") {
      if (status === "idle") {
        return { content: renderRunCodeTooltip };
      }
    }

    switch (status) {
      case "enqueued":
        return {
          title: "This block is enqueued",
          message: isRunButtonDisabled
            ? "When running entire documents, you cannot remove individual blocks from the queue."
            : "It will run once the previous blocks finish executing. Click to remove it from the queue.",
        };
      case "running": {
        if (envStatus !== "Running" && !envLoading) {
          return {
            title: "Your environment is starting",
            message:
              "Please hang tight. We need to start your environment before executing python code.",
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
  }, [status, envStatus, envLoading, execution, isRunButtonDisabled]);

  const aiEditTooltipContent = useCallback(
    (ref: RefObject<HTMLDivElement>) => (
      <AIEditTooltipContent tooltipRef={ref} hasOaiKey={hasOaiKey} />
    ),
    [hasOaiKey]
  );

  // ⬢  Dashnboard Mode
  // =====================================
  if (props.dashboardMode && !dashboardModeHasControls(props.dashboardMode)) {
    return (
      <PythonOutputs
        className="flex flex-col h-full ph-no-capture"
        outputs={results}
        isFixWithAILoading={isAIFixing}
        onFixWithAI={onFixWithAI}
        isPDF={props.isPDF}
        isDashboardView={
          props.dashboardMode._tag === "live" ||
          props.dashboardMode.position === "dashboard"
        }
        lazyRender={
          props.dashboardMode._tag === "editing" &&
          props.dashboardMode.position === "sidebar"
        }
        canFixWithAI={hasOaiKey}
        blockId={blockId}
        isDark={resolvedTheme === "dark"}
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
      onKeyDown={e => {
        if (e.key === "Enter") onClickWithin();
      }}
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
            "border-hover-border dark:border-border-dark shadow-none":
              !statusIsDisabled &&
              !isAIEditing &&
              aiSuggestions === null &&
              isEditorFocused &&
              editorState.mode === "normal",
            "border-hover-border block-shadow-soft dark:border-border-dark":
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
            statusIsDisabled ? "" : "bg-white dark:bg-header-surface",
            props.hasMultipleTabs ? "rounded-tl-none" : ""
          )}
        >
          <div
            className={clsx(
              "rounded-t-2xl dark:bg-header-surface",
              props.hasMultipleTabs ? "rounded-tl-none" : "",
              isCodeHidden && isResultHidden
                ? "rounded-b-2xl"
                : "border-b border-hover-border dark:border-border-dark"
            )}
            ref={d => {
              props.dragPreview?.(d);
            }}
          >
            <div className="flex items-center justify-between px-3 pr-0 gap-x-4 font-body h-10 rounded-t-2xl">
              <div className="select-none text-gray-300 text-xs flex items-center w-full h-full gap-x-1.5 px-4">
                <div className="relative group w-4 h-4">
                  <CodeIcon className="absolute inset-0 h-4 w-4 text-ink-400 group-hover:opacity-0 transition-opacity" />
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
                    "text-sm font-body font-normal pl-1 block w-full border-0 border-b border-transparent focus:border-primary focus:outline-none text-ink-100 placeholder:text-ink-300 py-0 h-2/3 bg-transparent focus:bg-base-100"
                  )}
                  placeholder={props.isEditable ? "Add a title..." : "Python"}
                  value={title}
                  disabled={!props.isEditable}
                  onChange={onChangeTitle}
                />
              </div>

              {results.some(r => r.type === "error") && (
                <div className="print:hidden flex items-center gap-x-1 text-[10px] text-ink-400 whitespace-nowrap">
                  <code className="bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 px-1.5 py-0.5 font-mono rounded-md relative">
                    contains errors
                  </code>
                </div>
              )}
            </div>
          </div>

          <Transition
            as="div"
            show={!isCodeHidden}
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
            <div className="print:hidden py-5">
              <div>
                <CodeEditor
                  workspaceId={props.document.workspaceId}
                  documentId={props.document.id}
                  blockId={blockId}
                  source={source}
                  language="python"
                  readOnly={!props.isEditable || statusIsDisabled}
                  onEditWithAI={onToggleEditWithAIPromptOpen}
                  onRun={onRun}
                  onInsertBlock={props.insertBelow ?? (() => {})}
                  diff={aiSuggestions ?? undefined}
                  disabled={statusIsDisabled}
                  isDark={resolvedTheme === "dark"}
                />
              </div>
            </div>
            <ApproveDiffButons
              visible={diffButtonsVisible}
              status="pending"
              canTry={status === "idle"}
              onTry={onTry}
              onAccept={onAcceptAISuggestion}
              onReject={onRejectAISuggestion}
              onUndo={onRejectAISuggestion}
            />
            {isPythonBlockEditWithAIPromptOpen(props.block) ? (
              <EditWithAIForm
                loading={isAIEditing}
                disabled={isAIEditing || aiSuggestions !== null}
                onSubmit={onSubmitEditWithAI}
                onClose={onCloseEditWithAIPrompt}
                value={editWithAIPrompt}
                hasOutput={results.length > 0}
              />
            ) : (
              <div
                className={clsx("print:hidden px-3 pb-3", {
                  hidden: isCodeHidden,
                })}
              >
                <div className="flex justify-between text-xs pt-2 pb-3 px-3 -mx-3 -mb-3 bg-inputBg dark:bg-header-surface border-t border-hover-border dark:border-border-dark">
                  <div className="flex items-center">{queryStatusText}</div>
                  {aiSuggestions === null &&
                    !props.isPublicMode &&
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
                                : "cusor-pointer dark:bg-header-surface hover:bg-hover-bg hover:text-gray-700 hover:border-primary",
                              "flex items-center border rounded-md border-hover-border px-2 py-1 gap-x-1 text-ink-300 dark:text-ink-400 group relative font-body"
                            )}
                          >
                            <PiCpu className="w-[11.5px] h-[11.5px] text-ink-300 dark:text-ink-400" />
                            <span>Edit with AI</span>
                          </button>
                        )}
                      </TooltipV2>
                    )}
                </div>
              </div>
            )}
          </Transition>

          {isCodeHidden && (
            <CollapsedCodeSummary
              lineCount={countPythonLines(source)}
              showOutputHidden={Boolean(isResultHidden && results.length > 0)}
            />
          )}
          {((results.length > 0 && !isResultHidden) || isCodeHidden) && (
            <HatchBackground />
          )}
          <Transition
            show={!(isResultHidden || results.length === 0)}
            enter="transition-all ease-in duration-300"
            enterFrom="max-h-0 overflow-hidden"
            enterTo="max-h-[300px] overflow-hidden"
            leave="transition-all ease-out duration-300"
            leaveFrom="max-h-[300px] overflow-hidden"
            leaveTo="max-h-0 overflow-hidden"
          >
            <div className="text-xs border-t border-border-secondary">
              <div className={clsx(!isTableOnlyOutput && "p-3")}>
                <ScrollBar
                  className={clsx("overflow-auto ph-no-capture", {
                    "px-0.5 pt-3.5 pb-2": !props.isPDF && !isTableOnlyOutput,
                  })}
                >
                  <PythonOutputs
                    outputs={results}
                    isFixWithAILoading={isAIFixing}
                    onFixWithAI={onFixWithAI}
                    canFixWithAI={hasOaiKey}
                    isPDF={props.isPDF}
                    isDashboardView={false}
                    lazyRender={!props.isPDF}
                    blockId={blockId}
                    isDark={resolvedTheme === "dark"}
                  />
                </ScrollBar>
              </div>
            </div>
          </Transition>
          {results.length > 0 && (
            <PythonResultFooter
              outputCount={results.length}
              dataframeDimensions={dataframeDimensions}
              isResultHidden={isResultHidden ?? false}
              toggleResultHidden={toggleResultHidden}
            />
          )}
          {results.length === 0 && statusIsDisabled && (
            <div className="px-4 py-4 space-y-3">
              <Shimmer className="h-3 w-full" />
              <Shimmer className="h-3 w-3/4" />
              <Shimmer className="h-3 w-1/2" />
            </div>
          )}
          {results.length === 0 && !statusIsDisabled && isCodeHidden && (
            <div className="flex items-center px-3 h-10 text-xs text-ink-400 bg-inputBg dark:bg-header-surface">
              No output
            </div>
          )}
        </div>
      </div>

      <div className="absolute left-0 top-0 -translate-y-full pb-2">
        <BlockTypePill label="Python" icon={<PiCode className="w-3 h-3" />} />
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
                  "bg-red-200": status === "running" && envStatus === "Running",
                  "bg-yellow-300":
                    !isRunButtonDisabled &&
                    (status === "enqueued" ||
                      (status === "running" && envStatus !== "Running")),
                  "bg-base-200 dark:bg-header-surface":
                    !isRunButtonDisabled && status === "idle",
                  "bg-inputBg":
                    !isRunButtonDisabled &&
                    status !== "idle" &&
                    status !== "running" &&
                    status !== "enqueued",
                },
                "rounded-[5px] border-hover-border border h-[24px] min-w-[24px] flex items-center justify-center relative group disabled:cursor-not-allowed hover:bg-hover-bg hover:border-primary"
              )}
            >
              {status !== "idle" ? (
                <div>
                  {status === "enqueued" ? (
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
            isCodeHidden={isCodeHidden ?? false}
            onToggleIsCodeHidden={toggleCodeHidden}
            isOutputHidden={isResultHidden ?? false}
            onToggleIsOutputHidden={toggleResultHidden}
          />
        )}
        {(!isCodeHidden || props.dashboardMode) && (
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
          className="bg-[#FFDBDB] dark:bg-header-surface dark:border dark:border-hover-border rounded-[5px] h-[24px] min-w-[24px] flex items-center justify-center group hover:bg-error"
        >
          <PiTrash className="w-[13px] h-[13px] text-ink-navy group-hover:text-white" />
        </button>
      </div>
    </div>
  );
}

export default PythonBlock;
