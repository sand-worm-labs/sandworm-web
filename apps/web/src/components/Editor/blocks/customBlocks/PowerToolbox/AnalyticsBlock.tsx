import {
  PlayIcon,
  StopIcon,
  ClockIcon,
  PencilSquareIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/20/solid";
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
import { useCallback, useEffect, useState } from "react";
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
import { PythonOutputs } from "../python/PythonOutput";

import { AnalyticsParamForm } from "./AnalyticsparamForm";

function ExecutionStatusText({
  status,
  resultStatus,
  executedAt,
  _startedAt,
  envStatus,
  isDirty,
  onEditParams,
}: {
  status: string;
  resultStatus: "idle" | "running" | "success" | "error";
  executedAt: string;
  _startedAt: string;
  envStatus: string;
  isDirty: boolean;
  onEditParams: () => void;
}) {
  if (status === "running" || status === "enqueued" || status === "aborting") {
    return (
      <span className="text-xs text-ink-400 flex items-center gap-x-1.5">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#A308F0] animate-ping" />
        {envStatus === "Starting" ? "Starting environment…" : "Running…"}
      </span>
    );
  }

  if (resultStatus === "error") {
    return (
      <span className="text-xs text-error flex items-center gap-x-1">
        <ExclamationCircleIcon className="w-3.5 h-3.5" />
        Execution failed
      </span>
    );
  }

  if (resultStatus === "success" && executedAt) {
    return (
      <span className="text-xs text-ink-400 flex items-center gap-x-2">
        <span className="text-emerald-500/70">
          ✓ Completed {formatRelativeTime(executedAt)}
        </span>
        {isDirty && (
          <button
            type="button"
            onClick={onEditParams}
            className="text-amber-500/80 hover:text-amber-400 underline underline-offset-2 transition-colors"
          >
            params changed — re-run?
          </button>
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

function BlockIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className="w-4 h-4 text-ink-400"
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

function formatRelativeTime(isoString: string): string {
  if (!isoString) return "";
  try {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  } catch {
    return "";
  }
}

type BlockView = "form" | "result";

interface RunTooltipContentProps {
  ref: React.Ref<HTMLButtonElement>;
  isDirty: boolean;
  view: string;
}

const RunTooltipContent = ({ ref, isDirty, view }: RunTooltipContentProps) => (
  <div
    className="font-body pointer-events-none w-max bg-hunter-950 text-white text-xs p-2 rounded-md flex flex-col gap-y-1"
    ref={ref}
  >
    <span>
      {isDirty && view === "result" ? "Params changed — re-run" : "Run block"}
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
    "powertoolbox" // need to add execution for useblock execution
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

  const [view, setView] = useState<BlockView>(() =>
    props.block.getAttribute("lastExecutedInputs") ? "result" : "form"
  );

  useEffect(() => {
    const executedAt = props.block.getAttribute("executedAt");
    if (
      executedAt &&
      (resultStatus === "success" || resultStatus === "error")
    ) {
      setView("result");
    }
  }, [props.block, resultStatus]);

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
      { _tag: "analytics" }
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
        if (isDirty || view === "form") {
          setView("form");
        } else {
          const source = props.block.getAttribute("generatedSource") ?? "";
          onRun(source);
        }
        break;
      case "aborting":
        break;
      default:
        break;
    }
  }, [status, execution, blockId, isDirty, view, props.block, onRun]);

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
    return (
      <PythonOutputs
        className="flex flex-col h-full ph-no-capture"
        outputs={results}
        isFixWithAILoading={false}
        onFixWithAI={() => {}}
        canFixWithAI={false}
        isPDF={props.isPDF}
        isDashboardView={
          props.dashboardMode._tag === "live" ||
          props.dashboardMode.position === "dashboard"
        }
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
            <RunTooltipContent ref={ref} isDirty={isDirty} view={view} />
          )
        : undefined,
    [status, isDirty, view]
  );

  return (
    <div
      role="presentation"
      className="bg-base-100 relative group/block"
      onClick={onClickWithin}
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
              "rounded-t-2xl border-b border-border-secondary dark:border-border-tertiary"
            )}
            ref={d => {
              props.dragPreview?.(d);
            }}
          >
            <div className="flex items-center justify-between px-3 pr-4 gap-x-4 font-body h-12">
              <div className="select-none text-gray-300 text-xs flex items-center w-full h-full gap-x-1.5">
                <div className="w-4 h-4 shrink-0">
                  <BlockIcon />
                </div>

                <input
                  type="text"
                  className={clsx(
                    "text-base font-body font-medium pl-1 ring-border-tertiary focus:ring-border-tertiary",
                    "block w-full rounded-md border-0 text-ink-100 hover:ring-1 focus:ring-1",
                    "ring-inset focus:ring-inset placeholder:text-ink-400",
                    "py-0 disabled:ring-0 h-2/3 bg-transparent focus:bg-white"
                  )}
                  placeholder={
                    props.isEditable
                      ? `${attrs.toolLabel ?? "PowerToolBox"} (click to add a title)`
                      : (attrs.toolLabel ?? "PowerToolBox")
                  }
                  value={title}
                  disabled={!props.isEditable}
                  onChange={onChangeTitle}
                />
              </div>

              <div className="flex items-center gap-x-2 shrink-0">
                {attrs.toolCategory && (
                  <span
                    className={clsx(
                      "hidden sm:inline-flex items-center",
                      "text-[10px] font-medium px-1.5 py-0.5 rounded",
                      "bg-[#A308F0]/10 text-[#A308F0]/70 border border-[#A308F0]/20",
                      "font-mono capitalize leading-none"
                    )}
                  >
                    {attrs.toolCategory}
                  </span>
                )}

                {isDirty && view === "result" && (
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
                  <code className="bg-red-50 text-error px-1.5 py-0.5 font-mono text-[10px] rounded-md">
                    contains errors
                  </code>
                )}
              </div>
            </div>
          </div>

          <div className="print:hidden">
            {view === "form" && (
              <div className="p-3">
                <AnalyticsParamForm
                  block={props.block}
                  onRun={onRun}
                  onCancel={
                    attrs.lastExecutedInputs
                      ? () => setView("result")
                      : undefined
                  }
                  isEditing={!!attrs.lastExecutedInputs}
                />
              </div>
            )}

            {view === "result" && (
              <>
                <div
                  className={clsx(
                    "flex items-center justify-between px-4 py-2",
                    "border-b border-border-secondary dark:border-border-tertiary",
                    "bg-gray-50/50 dark:bg-white/[0.02]"
                  )}
                >
                  <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
                    {Object.entries(attrs.inputs ?? {})
                      .filter(([, v]) => v !== "" && v !== null)
                      .slice(0, 4)
                      .map(([key, value]) => (
                        <ParamSummaryPill key={key} label={key} value={value} />
                      ))}
                  </div>

                  {props.isEditable && (
                    <button
                      type="button"
                      onClick={() => setView("form")}
                      className={clsx(
                        "flex items-center gap-x-1 shrink-0 ml-2",
                        "text-xs text-ink-400 hover:text-ink-200",
                        "border border-border-secondary hover:border-border-primary",
                        "px-2 py-1 rounded-md transition-colors",
                        "font-body"
                      )}
                    >
                      <PencilSquareIcon className="w-3 h-3" />
                      Edit params
                    </button>
                  )}
                </div>

                {/* Execution status row */}
                <div className="px-4 py-2 flex items-center gap-x-2">
                  <ExecutionStatusText
                    status={status}
                    resultStatus={resultStatus}
                    executedAt={attrs.executedAt}
                    startedAt={attrs.startedAt}
                    envStatus={envStatus}
                    isDirty={isDirty}
                    onEditParams={() => setView("form")}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <Transition
          show={view === "result" && hasResults}
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

      <div
        className={clsx(
          "absolute h-full transition-opacity pl-1.5 right-0 top-0 translate-x-full",
          "flex flex-col gap-y-1 z-20",
          isEditorFocused || statusIsDisabled
            ? "opacity-100"
            : "opacity-0 group-hover/block:opacity-100",
          !props.isEditable ? "hidden" : "block"
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
                "rounded-sm h-6 min-w-6 flex items-center justify-center relative",
                "disabled:cursor-not-allowed",
                {
                  "bg-gray-200": isRunButtonDisabled,
                  "bg-red-200": status === "running" && envStatus === "Running",
                  "bg-yellow-300":
                    !isRunButtonDisabled &&
                    (status === "enqueued" ||
                      (status === "running" && envStatus !== "Running")),
                  "bg-[#A308F0]":
                    !isRunButtonDisabled &&
                    (status === "idle" || status === "completed"),
                  "bg-amber-500":
                    !isRunButtonDisabled &&
                    status === "idle" &&
                    isDirty &&
                    view === "result",
                }
              )}
            >
              {status === "enqueued" ? (
                <ClockIcon className="w-3 h-3 text-[#F8F9FA]" />
              ) : status === "running" || status === "aborting" ? (
                <StopIcon className="w-3 h-3 text-[#F8F9FA]" />
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
            isCodeHidden={false}
            onToggleIsCodeHidden={() => {}}
            isOutputHidden={view === "form"}
            onToggleIsOutputHidden={() =>
              setView(v => (v === "form" ? "result" : "form"))
            }
          />
        )}
      </div>
    </div>
  );
}

export default AnalyticsBlock;
