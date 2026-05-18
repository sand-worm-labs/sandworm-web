import {
  ClockIcon,
  PlayIcon,
  StopIcon,
  SparklesIcon,
} from "@heroicons/react/20/solid";
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
  ExecutingPythonText,
  LoadingEnvText,
  PythonSucceededText,
} from "../../ExecutionStatusText";
import { useEnvironmentStatus } from "../../../hooks/useEnvironmentStatus";
import CodeEditor from "../CodeEditor";
import HiddenInPublishedButton from "../../HiddenInPublishedButton";
import EditWithAIForm from "../../EditWithAIForm";
import ApproveDiffButons from "../../ApproveDiffButtons";

import { PythonOutputs } from "./PythonOutput";

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
  modelId: string;
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
// ⬢ PythonBlock
// =====================================
function PythonBlock(props: Props) {
  const [workspaces] = useWorkspaces();
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
    await editPythonWithAi({
      workspaceId: props.workspaceId,
      documentId: props.document.id,
      blockId,
      modelId: props.modelId,
    });
  }, [
    editPythonWithAi,
    props.workspaceId,
    props.document.id,
    blockId,
    props.modelId,
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
      modelId: props.modelId,
    });

    if (fixResult?.chatId) {
      /*       props.onOpenChat(fixResult.chatId);
       */
    }
  }, [
    fixPythonWithAi,
    props.workspaceId,
    props.document.id,
    blockId,
    props.modelId,
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
        if (source?.toJSON() === lastQuery && lastQueryTime) {
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
        return (
          <ExecutingPythonText startExecutionTime={startQueryTime ?? null} />
        );
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
      />
    );
  }

  // ⬢  Main Component Mode
  // =====================================
  return (
    <div
      className="bg-white dark:bg-base-100 relative group/block"
      role="presentation"
      onClick={onClickWithin}
      onKeyDown={e => {
        if (e.key === "Enter") onClickWithin();
      }}
      data-block-id={blockId}
    >
      <div
        className={clsx(
          "rounded-2xl border border-border-focus",
          props.isBlockHiddenInPublished && "border-dashed",
          props.hasMultipleTabs ? "rounded-tl-2xl" : "rounded-tl-xl",
          isEditorFocused && editorState.mode === "insert" && "shadow-sm"
        )}
      >
        <div
          className={clsx(
            "rounded-2xl",
            statusIsDisabled ? "" : "bg-white dark:bg-base-100",
            props.hasMultipleTabs ? "rounded-tl-none" : ""
          )}
        >
          <div
            className={clsx(
              "rounded-t-2xl",
              isCodeHidden && isResultHidden
                ? "rounded-b-2xl"
                : "border-b border-border-secondary dark:border-border-tertiary"
            )}
            ref={d => {
              props.dragPreview?.(d);
            }}
          >
            <div className="flex items-center justify-between px-3 pr-4 gap-x-4 font-body h-12">
              <div className="select-none text-gray-300 text-xs flex items-center w-full h-full gap-x-1.5">
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
                    "text-base font-body font-medium pl-1 ring-border-secondary focus:ring-primary/40 block w-full rounded-md border-0 text-ink-100 hover:ring-1 focus:ring-1 ring-inset focus:ring-inset placeholder:text-ink-400 py-0 disabled:ring-0 h-2/3 bg-transparent focus:bg-white focus-visible:ring-none focus-visible:outline-none"
                  )}
                  placeholder={
                    props.isEditable
                      ? "Python (click to add a title)"
                      : "Python"
                  }
                  value={title}
                  disabled={!props.isEditable}
                  onChange={onChangeTitle}
                />
              </div>

              {results.some(r => r.type === "error") && (
                <div className="print:hidden flex items-center gap-x-1 text-[10px] text-ink-400 whitespace-nowrap">
                  <code className="bg-red-50 text-error px-1.5 py-0.5 font-mono rounded-md relative">
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
                <div className="flex justify-between text-xs">
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
                                ? "cursor-not-allowed bg-gray-200"
                                : "cursor-pointer hover:bg-gray-50 hover:text-gray-700",
                              "flex items-center border rounded-sm border-border-secondary px-2 py-1 gap-x-1 text-ink-400 group relative font-body"
                            )}
                          >
                            <SparklesIcon className="w-3 h-3" />
                            <span>Edit with AI</span>
                          </button>
                        )}
                      </TooltipV2>
                    )}
                </div>
              </div>
            )}
          </Transition>
        </div>

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
            <div className="p-3">
              <ScrollBar
                className={clsx("overflow-auto ph-no-capture", {
                  "px-0.5 pt-3.5 pb-2": !props.isPDF,
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
                />
              </ScrollBar>
            </div>
          </div>
        </Transition>
      </div>

      <div
        className={clsx(
          "absolute h-full transition-opacity opacity-0 group-hover/block:opacity-100 pl-1.5 right-0 top-0 translate-x-full flex flex-col gap-y-1 z-20",
          isEditorFocused || statusIsDisabled ? "opacity-100" : "opacity-0",
          !props.isEditable ? "hidden" : "block"
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
                  "bg-[#A308F0]": !isRunButtonDisabled && status === "idle",
                },
                "rounded-sm h-6 min-w-6 flex items-center justify-center relative group disabled:cursor-not-allowed"
              )}
            >
              {status !== "idle" ? (
                <div>
                  {status === "enqueued" ? (
                    <ClockIcon className="w-3 h-3 text-[#F8F9FA]" />
                  ) : (
                    <StopIcon className="w-3 h-3 text-[#F8F9FA]" />
                  )}
                </div>
              ) : (
                <PlayIcon className="w-3 h-3 text-[#F8F9FA]" />
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
      </div>
    </div>
  );
}

export default PythonBlock;
