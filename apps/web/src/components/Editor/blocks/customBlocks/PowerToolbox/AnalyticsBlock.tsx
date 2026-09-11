import { PlayIcon, StopIcon, ClockIcon } from "@heroicons/react/20/solid";
import { PiTrash } from "react-icons/pi";
import type * as Y from "yjs";
import {
  type YBlock,
  type ExecutionQueue,
  type PowerToolboxBlock,
  getBaseAttributes,
  getPowerToolboxAttributes,
  getPowerToolboxBlockResultStatus,
  getPowerToolboxBlockIsDirty,
  isExecutionStatusLoading,
  setTitle,
} from "@sandworm/editor";
import clsx from "clsx";
import { useCallback, useState, useMemo } from "react";
import type { ConnectDragPreview } from "react-dnd";
import { head } from "ramda";
import { Transition } from "@headlessui/react";

import type { ApiDocument } from "@/types";

import { useBlockExecutions } from "../../../hooks/useBlockExecution";
import { useEnvironmentStatus } from "../../../hooks/useEnvironmentStatus";
import useEditorAwareness from "../../../hooks/useEditorAwareness";
import { TooltipV2 } from "../../ToolTips";
import type { DashboardMode } from "../../Dashboard";
import { dashboardModeHasControls } from "../../Dashboard/dashboard-types";
import HiddenInPublishedButton from "../../HiddenInPublishedButton";
import ScrollBar from "../../ScrollBar";
import { BlockTypePill } from "../../BlockTypePill";
import { PythonOutputs } from "../python/PythonOutput";
import { SucceededText, ExecutionFailedText } from "../../ExecutionStatusText";

import { AnalyticsParamForm } from "./AnalyticsparamForm";

function ExecutionStatusText({
  status,
  resultStatus,
  executedAt,
  envStatus,
  isDirty,
  isResultHidden,
  onToggleResultHidden,
}: {
  status: string;
  resultStatus: "idle" | "running" | "success" | "error";
  executedAt: string;
  envStatus: string;
  isDirty: boolean;
  isResultHidden: boolean;
  onToggleResultHidden: () => void;
}) {
  if (status === "running" || status === "enqueued" || status === "aborting") {
    return (
      <span className="text-xs text-ink-400 flex items-center gap-x-1.5">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
        {envStatus === "Starting" ? "Starting environment…" : "Running…"}
      </span>
    );
  }

  if (resultStatus === "error") {
    return (
      <ExecutionFailedText
        lastExecutionTime={executedAt}
        isResultHidden={isResultHidden}
        onToggleResultHidden={onToggleResultHidden}
      />
    );
  }

  if (resultStatus === "success" && executedAt) {
    return (
      <span className="flex items-center gap-x-2">
        <SucceededText
          lastExecutionTime={executedAt}
          isResultHidden={isResultHidden}
          onToggleResultHidden={onToggleResultHidden}
        />
        {isDirty && (
          <span className="text-xs text-amber-500/80">
            params changed — re-run to update
          </span>
        )}
      </span>
    );
  }

  return null;
}

function ParamSummaryPill({
  label,
  value,
}: {
  label: string;
  value: string | number | boolean | string[];
}) {
  const display = Array.isArray(value)
    ? `${value.length} ${label}`
    : typeof value === "string" && value.length > 16
      ? `${value.slice(0, 6)}…${value.slice(-4)}`
      : String(value);

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded",
        "bg-white/[0.04] dark:bg-white/[0.03] border border-border-secondary",
        "text-[10px] font-mono text-ink-400 max-w-[140px]"
      )}
      title={`${label}: ${String(value)}`}
    >
      <span className="text-ink-500 shrink-0">{label}:</span>
      <span className="truncate">{display}</span>
    </span>
  );
}

function BlockIcon({
  className = "w-4 h-4 text-ink-400",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M8 2L2.5 8.5h5l-1 5.5 7-8h-5L8 2z"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-current"
      />
    </svg>
  );
}

interface RunTooltipContentProps {
  ref: React.Ref<HTMLButtonElement>;
  isDirty: boolean;
  hasResults: boolean;
}

const RunTooltipContent = ({ ref, isDirty, hasResults }: RunTooltipContentProps) => (
  <div
    className="font-body pointer-events-none w-max bg-hunter-950 text-white text-xs p-2 rounded-md flex flex-col gap-y-1"
    ref={ref}
  >
    <span>
      {isDirty && hasResults ? "Params changed — re-run" : "Run block"}
    </span>
    <span className="inline-flex gap-x-1 items-center text-ink-400">
      <span>⌘</span>
      <span>+</span>
      <span>Enter</span>
    </span>
  </div>
);

interface Props {
  document: ApiDocument;
  block: Y.XmlElement<PowerToolboxBlock>;
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
  userId: string | null;
  isFullScreen: boolean;
  onDeleteBlock: () => void;
  hideTypePill?: boolean;
}

function AnalyticsBlock(props: Props) {
  const { status: envStatus, startedAt: environmentStartedAt } =
    useEnvironmentStatus(props.document.workspaceId);
  console.log(
    props.insertBelow,
    props.isFullScreen,
    props.isPublicMode,
    props.blocks
  );

  const executions = useBlockExecutions(
    props.executionQueue,
    props.block,
    "power-toolbox"
  );
  const execution = head(executions) ?? null;
  const status = execution?.item.getStatus()._tag ?? "idle";
  const statusIsDisabled = isExecutionStatusLoading(status);

  const { id: blockId, title } = getBaseAttributes(props.block);
  const attrs = getPowerToolboxAttributes(props.block);
  const resultStatus = getPowerToolboxBlockResultStatus(props.block);
  const isDirty = getPowerToolboxBlockIsDirty(props.block);

  const results = props.block.getAttribute("result") ?? [];
  const hasResults = results.length > 0;
  const hasError = results.some(r => r.type === "error");

  // Params and results are always shown together — this only controls the
  // "hide output in published view" toggle, independent of the editor UI.
  const [resultsHidden, setResultsHidden] = useState(false);

  const [editorState, editorAPI] = useEditorAwareness();
  const isEditorFocused = editorState.cursorBlockId === blockId;

  const onClickWithin = useCallback(() => {
    editorAPI.focus(blockId, { scrollIntoView: false });
  }, [blockId, editorAPI]);

  const onRun = useCallback(() => {
    props.executionQueue.enqueueBlock(
      blockId,
      props.userId,
      environmentStartedAt,
      { _tag: "power-toolbox" }
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
        // PowerToolboxBlockExecutorService renders the template fresh from
        // toolId + inputs on every run, so there's nothing to pre-generate
        // client-side before running — just enqueue it.
        onRun();
        break;
      case "aborting":
        break;
      default:
        break;
    }
  }, [status, execution, blockId, onRun]);

  const isRunButtonDisabled =
    status === "aborting" || execution?.batch.isRunAll();

  const onChangeTitle = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(props.block, e.target.value);
    },
    [props.block]
  );

  const onToggleIsBlockHiddenInPublished = useCallback(() => {
    props.onToggleIsBlockHiddenInPublished(blockId);
  }, [props.onToggleIsBlockHiddenInPublished, blockId]);

  if (props.dashboardMode && !dashboardModeHasControls(props.dashboardMode)) {
    const isDashboardTile =
      props.dashboardMode._tag === "live" ||
      props.dashboardMode.position === "dashboard";
    return (
      <PythonOutputs
        className="flex flex-col h-full ph-no-capture"
        outputs={results}
        isFixWithAILoading={false}
        onFixWithAI={() => {}}
        canFixWithAI={false}
        isPDF={props.isPDF}
        isDashboardView={isDashboardTile}
        isDashboardTile={isDashboardTile}
        lazyRender={
          props.dashboardMode._tag === "editing" &&
          props.dashboardMode.position === "sidebar"
        }
        blockId={blockId}
      />
    );
  }

  const tooltipContent = useMemo(
    () =>
      status === "idle"
        ? (ref: React.Ref<HTMLButtonElement>) => (
            <RunTooltipContent ref={ref} isDirty={isDirty} hasResults={hasResults} />
          )
        : undefined,
    [status, isDirty, hasResults]
  );

  return (
    <div
      role="presentation"
      className="relative group/block mt-6"
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
              isEditorFocused &&
              editorState.mode === "insert",
            "border-hover-border block-focus-ring dark:border-border-tertiary":
              statusIsDisabled,
            "border-hover-border dark:border-border-dark shadow-none":
              !statusIsDisabled &&
              isEditorFocused &&
              editorState.mode === "normal",
            "border-hover-border block-shadow-soft dark:border-border-dark":
              !statusIsDisabled && !isEditorFocused,
          }
        )}
      >
        <div
          className={clsx(
            "rounded-2xl overflow-hidden",
            statusIsDisabled ? "bg-gray-100" : "bg-white dark:bg-header-surface",
            props.hasMultipleTabs ? "rounded-tl-none" : ""
          )}
        >
          <div
            className={clsx(
              "rounded-t-2xl dark:bg-header-surface border-b border-hover-border dark:border-border-dark"
            )}
            ref={d => {
              props.dragPreview?.(d);
            }}
          >
            <div className="flex items-center justify-between px-3 pr-0 gap-x-4 font-body h-10">
              <div className="select-none text-gray-300 text-xs flex items-center w-full h-full gap-x-1.5 px-4">
                <div className="w-4 h-4 shrink-0">
                  <BlockIcon />
                </div>

                <input
                  type="text"
                  className={clsx(
                    "text-sm font-body font-normal pl-1 block w-full border-0 border-b border-transparent focus:border-primary focus:outline-none text-ink-100 placeholder:text-ink-300 py-0 h-2/3 bg-transparent focus:bg-base-100"
                  )}
                  placeholder={
                    props.isEditable
                      ? "Add a title..."
                      : (attrs.toolLabel ?? "PowerToolBox")
                  }
                  value={title}
                  disabled={!props.isEditable}
                  onChange={onChangeTitle}
                />
              </div>

              <div className="flex items-center gap-x-2 shrink-0 pr-4">
                {attrs.toolCategory && (
                  <span
                    className={clsx(
                      "hidden sm:inline-flex items-center",
                      "text-[10px] font-medium px-1.5 py-0.5 rounded",
                      "bg-primary/10 text-primary/70 border border-primary/20",
                      "font-mono capitalize leading-none"
                    )}
                  >
                    {attrs.toolCategory}
                  </span>
                )}

                {isDirty && hasResults && (
                  <span
                    className={clsx(
                      "hidden sm:inline-flex items-center gap-x-1",
                      "text-[10px] text-amber-500/80 font-medium"
                    )}
                    title="Params changed — re-run to update results"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 animate-pulse" />
                    outdated
                  </span>
                )}

                {hasError && !statusIsDisabled && (
                  <code className="bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 px-1.5 py-0.5 font-mono text-[10px] rounded-md">
                    contains errors
                  </code>
                )}
              </div>
            </div>
          </div>

          <div className="print:hidden">
            <div className="px-3 pb-3 pt-3">
              {/* AnalyticsParamForm has no read-only mode of its own — its
                  fields commit straight to the Yjs doc onBlur. On a public
                  page that would look editable without doing anything
                  useful, so it's hidden in both Report and Query view,
                  not just Report. */}
              {!props.isPublicMode && (
                <AnalyticsParamForm block={props.block} />
              )}

              {!resultsHidden && (hasResults || attrs.executedAt) && (
                <div className="flex flex-col text-xs -mx-3 -mb-3 mt-3 bg-inputBg dark:bg-header-surface border-t border-hover-border dark:border-border-dark">
                  {Object.entries(attrs.inputs ?? {}).some(
                    ([, v]) => v !== "" && v !== null
                  ) && (
                    <div className="flex flex-wrap items-center gap-1.5 px-3 pt-2 border-b border-hover-border dark:border-border-dark pb-2">
                      {Object.entries(attrs.inputs ?? {})
                        .filter(([, v]) => v !== "" && v !== null)
                        .slice(0, 4)
                        .map(([key, value]) => (
                          <ParamSummaryPill key={key} label={key} value={value} />
                        ))}
                    </div>
                  )}

                  <div className="flex items-center gap-x-2 px-3 pt-2 pb-3">
                    <ExecutionStatusText
                      status={status}
                      resultStatus={resultStatus}
                      executedAt={attrs.executedAt}
                      envStatus={envStatus}
                      isDirty={isDirty}
                      isResultHidden={resultsHidden}
                      onToggleResultHidden={() => setResultsHidden(prev => !prev)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <Transition
          show={!resultsHidden && hasResults}
          className="text-xs border-t border-border-secondary"
          enter="transition-all ease-in duration-300"
          enterFrom="max-h-0 overflow-hidden"
          enterTo="max-h-[400px] overflow-hidden"
          leave="transition-all ease-out duration-300"
          leaveFrom="max-h-[400px] overflow-hidden"
          leaveTo="max-h-0 overflow-hidden"
        >
          <div className="p-3">
            <ScrollBar
              className={clsx("overflow-auto ph-no-capture", {
                "px-0.5 pt-3.5 pb-2": !props.isPDF,
              })}
            >
              <PythonOutputs
                outputs={results}
                isFixWithAILoading={false}
                onFixWithAI={() => {}}
                canFixWithAI={false}
                isPDF={props.isPDF}
                isDashboardView={false}
                lazyRender={!props.isPDF}
                blockId={blockId}
              />
            </ScrollBar>
          </div>
        </Transition>
      </div>

      {!props.hideTypePill && (
        <div className="absolute left-0 top-0 -translate-y-full pb-2">
          <BlockTypePill
            label="Analytics"
            icon={<BlockIcon className="w-3 h-3" />}
          />
        </div>
      )}
      <div
        className={clsx(
          "absolute transition-opacity opacity-0 group-hover/block:opacity-100 right-0 top-0 -translate-y-full pb-2 flex flex-row gap-x-1",
          isEditorFocused || statusIsDisabled ? "opacity-100" : "opacity-0",
          !props.isEditable ? "hidden" : "flex"
        )}
      >
        <TooltipV2<HTMLButtonElement>
          content={tooltipContent}
          active={status === "idle"}
        >
          {ref => (
            <button
              type="button"
              ref={ref}
              onClick={onRunAbort}
              disabled={isRunButtonDisabled}
              className={clsx(
                "rounded-[5px] border-hover-border border h-[24px] min-w-[24px] flex items-center justify-center relative group disabled:cursor-not-allowed hover:bg-hover-bg hover:border-primary",
                {
                  "bg-gray-200": isRunButtonDisabled,
                  "bg-red-200": status === "running" && envStatus === "Running",
                  "bg-yellow-300":
                    !isRunButtonDisabled &&
                    (status === "enqueued" ||
                      (status === "running" && envStatus !== "Running")),
                  "bg-amber-500":
                    !isRunButtonDisabled &&
                    status === "idle" &&
                    isDirty &&
                    hasResults,
                  "bg-base-200 dark:bg-header-surface":
                    !isRunButtonDisabled &&
                    !(status === "idle" && isDirty && hasResults) &&
                    (status === "idle" || status === "completed"),
                  "bg-inputBg":
                    !isRunButtonDisabled &&
                    status !== "idle" &&
                    status !== "completed" &&
                    status !== "running" &&
                    status !== "enqueued",
                }
              )}
            >
              {status === "enqueued" ? (
                <ClockIcon className="w-[13px] h-[13px] text-ink-navy" />
              ) : status === "running" || status === "aborting" ? (
                <StopIcon className="w-[13px] h-[13px] text-ink-navy" />
              ) : (
                <PlayIcon className="w-[13px] h-[13px] text-ink-navy" />
              )}
            </button>
          )}
        </TooltipV2>

        {!props.dashboardMode && (
          <HiddenInPublishedButton
            isBlockHiddenInPublished={props.isBlockHiddenInPublished}
            onToggleIsBlockHiddenInPublished={onToggleIsBlockHiddenInPublished}
            hasMultipleTabs={props.hasMultipleTabs}
            isCodeHidden={false}
            onToggleIsCodeHidden={() => {}}
            isOutputHidden={resultsHidden}
            onToggleIsOutputHidden={() => setResultsHidden(h => !h)}
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

export default AnalyticsBlock;
