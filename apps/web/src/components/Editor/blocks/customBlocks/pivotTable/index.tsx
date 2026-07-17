/* eslint-disable import/no-cycle */
import type { ConnectDragPreview } from "react-dnd";
import type * as Y from "yjs";
import type { DataFrame, PivotTableSort } from "@sandworm/types";
import {
  type ExecutionQueue,
  type PivotTableColumn,
  type PivotTableMetric,
  type PivotTableRow,
  type YBlock,
  BlockType,
  execStatusIsDisabled,
  getDataframe,
  getPivotTableAttributes,
  getPivotTableBlockExecStatus,
  isExecutionStatusLoading,
  type PivotTableBlock,
} from "@sandworm/editor";
import clsx from "clsx";
import type { RefObject } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { equals, head } from "ramda";
import { PiPlayFill, PiStop, PiClock, PiTable } from "react-icons/pi";
import { BlockTypePill } from "../../BlockTypePill";

// FIX import/no-named-as-default: LargeSpinner is a named export, not default
import { LargeSpinner } from "../../LargeSpinner";
import useEditorAwareness from "../../../hooks/useEditorAwareness";
import { useBlockExecutions } from "../../../hooks/useBlockExecution";
import HeaderSelect from "../../HeaderSelect";
import { TooltipV2 } from "../../ToolTips";
import type { DashboardMode } from "../../Dashboard";
import { dashboardModeHasControls } from "../../Dashboard/dashboard-types";
import HiddenInPublishedButton from "../../HiddenInPublishedButton";
import { useEnvironmentStatus } from "../../../hooks/useEnvironmentStatus";

import PivotTableView from "./PivotTableView";
import PivotTableControls from "./PivotTableControls";

// =====================================
// ⬢ Types
// =====================================

interface Props {
  workspaceId: string;
  dataframes: Y.Map<DataFrame>;
  block: Y.XmlElement<PivotTableBlock>;
  blocks: Y.Map<YBlock>;
  dragPreview: ConnectDragPreview | null;
  isEditable: boolean;
  onAddGroupedBlock: (
    blockId: string,
    blockType: BlockType,
    position: "before" | "after"
  ) => void;
  hasMultipleTabs: boolean;
  isBlockHiddenInPublished: boolean;
  onToggleIsBlockHiddenInPublished: (blockId: string) => void;
  dashboardMode: DashboardMode | null;
  isCursorWithin: boolean;
  isCursorInserting: boolean;
  userId: string | null;
  executionQueue: ExecutionQueue;
  isFullScreen: boolean;
}

// =====================================
// ⬢ Tooltip Renderers
// =====================================

// FIX react/no-unstable-nested-components: extracted from inside useMemo to module level
const renderRefreshTooltip = (ref: RefObject<HTMLDivElement>) => (
  <div
    className="font-body pointer-events-none w-max bg-hunter-950 text-white text-xs p-2 rounded-md flex flex-col gap-y-1"
    ref={ref}
  >
    <span>Refresh</span>
  </div>
);

// =====================================
// ⬢ Component
// =====================================

function PivotTableBlock(props: Props) {
  const attrs = getPivotTableAttributes(props.block, props.blocks);

  const dataframe = getDataframe(props.block, props.dataframes);

  // ─── Dirty state observer ─────────────────────────────────────────────────

  const [isDirty, setIsDirty] = useState(false);

  // FIX consistent-return: both paths now return a function so the arrow
  // function always has a consistent return type
  useEffect(() => {
    if (!dataframe) {
      return () => {};
    }

    let timeout: NodeJS.Timeout | null = null;

    function observe(event: Y.YXmlEvent) {
      // FIX no-shadow: renamed inner `attrs` → `blockAttrs` to avoid shadowing
      // the outer `attrs` declared at component scope
      const blockAttrs = getPivotTableAttributes(props.block, props.blocks);
      let shouldBeDirty = false;

      if (event.attributesChanged.has("dataframeName")) {
        shouldBeDirty = true;
      } else if (event.attributesChanged.has("rows")) {
        const rows = blockAttrs.rows
          .map(row => row.column?.name?.toString())
          .filter((col): col is string => col !== undefined);
        const resultRows = blockAttrs.result?.pivotRows ?? [];

        if (!equals(rows, resultRows)) {
          shouldBeDirty = true;
        }
      } else if (event.attributesChanged.has("columns")) {
        const columns = blockAttrs.columns
          .map(col => col.column?.name?.toString())
          .filter((col): col is string => col !== undefined);
        const resultColumns = blockAttrs.result?.pivotColumns ?? [];

        if (!equals(columns, resultColumns)) {
          shouldBeDirty = true;
        }
      } else if (event.attributesChanged.has("metrics")) {
        const keyChange = event.keys.get("metrics");
        const oldValue = keyChange?.oldValue as PivotTableMetric[];
        const newValue = blockAttrs.metrics;

        const oldNonNull = oldValue.reduce((acc, metric) => {
          if (metric.column) {
            acc.push(metric);
          }
          return acc;
        }, [] as PivotTableMetric[]);

        const newNonNull = newValue.reduce((acc, metric) => {
          if (metric.column) {
            acc.push(metric);
          }
          return acc;
        }, [] as PivotTableMetric[]);

        if (!equals(oldNonNull, newNonNull)) {
          shouldBeDirty = true;
        }
      }

      if (shouldBeDirty) {
        if (timeout) {
          clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
          setIsDirty(true);
        }, 1000);
      }
    }

    props.block.observe(observe);

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }

      props.block.unobserve(observe);
    };
  }, [props.block, dataframe]);

  // ─── Environment status ───────────────────────────────────────────────────

  const {
    status: envStatus,
    loading: envLoading,
    startedAt: environmentStartedAt,
  } = useEnvironmentStatus(props.workspaceId);

  // ─── Execution trigger on dirty ───────────────────────────────────────────

  useEffect(() => {
    if (isDirty) {
      props.executionQueue.enqueueBlock(
        props.block,
        props.userId,
        environmentStartedAt,
        {
          _tag: "pivot-table",
        }
      );
      setIsDirty(false);
    }
  }, [
    isDirty,
    props.block,
    props.executionQueue,
    props.userId,
    environmentStartedAt,
  ]);

  // ─── Handlers ────────────────────────────────────────────────────────────

  const onChangeTitle = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      props.block.setAttribute("title", e.target.value);
    },
    [props.block]
  );

  const onChangeDataframe = useCallback(
    (dfName: string) => {
      const df = props.dataframes.get(dfName);
      if (df) {
        props.block.setAttribute("dataframeName", dfName);
      }
    },
    [props.block, props.dataframes]
  );

  const dataframeOptions = Array.from(props.dataframes.values()).map(df => ({
    value: df.name,
    label: df.name,
  }));

  const onNewSQL = useCallback(() => {
    props.onAddGroupedBlock(attrs.id, BlockType.SQL, "before");
  }, [attrs.id, props.onAddGroupedBlock]);

  const onChangeRows = useCallback(
    (rows: PivotTableRow[]) => {
      props.block.setAttribute("rows", rows);
    },
    [props.block]
  );

  const onChangeColumns = useCallback(
    (columns: PivotTableColumn[]) => {
      props.block.setAttribute("columns", columns);
    },
    [props.block]
  );

  const onChangeMetrics = useCallback(
    (metrics: PivotTableMetric[]) => {
      props.block.setAttribute("metrics", metrics);
    },
    [props.block]
  );

  const onToggleControlsHidden = useCallback(() => {
    props.block.setAttribute("controlsHidden", !attrs.controlsHidden);
  }, [props.block, attrs.controlsHidden]);

  const onPrevPage = useCallback(() => {
    const run = () => {
      props.block.setAttribute("page", attrs.page - 1);
      props.executionQueue.enqueueBlock(
        props.block,
        props.userId,
        environmentStartedAt,
        {
          _tag: "pivot-table-load-page",
        }
      );
    };
    if (props.block.doc) {
      props.block.doc.transact(run);
    } else {
      run();
    }
  }, [
    props.block,
    attrs.page,
    props.executionQueue,
    props.userId,
    environmentStartedAt,
  ]);

  const onNextPage = useCallback(() => {
    const run = () => {
      props.block.setAttribute("page", attrs.page + 1);
      props.executionQueue.enqueueBlock(
        props.block,
        props.userId,
        environmentStartedAt,
        {
          _tag: "pivot-table-load-page",
        }
      );
    };
    if (props.block.doc) {
      props.block.doc.transact(run);
    } else {
      run();
    }
  }, [props.block, attrs.page, props.executionQueue, props.userId]);

  const setPage = useCallback(
    (page: number) => {
      const run = () => {
        props.block.setAttribute("page", page + 1);
        props.executionQueue.enqueueBlock(
          props.block,
          props.userId,
          environmentStartedAt,
          {
            _tag: "pivot-table-load-page",
          }
        );
      };

      if (props.block.doc) {
        props.block.doc.transact(run);
      } else {
        run();
      }
    },
    [props.block, props.executionQueue, props.userId]
  );

  // ─── Execution state ──────────────────────────────────────────────────────

  const executions = useBlockExecutions(
    props.executionQueue,
    props.block,
    "pivot-table"
  );
  const execution = head(executions);
  const status = execution?.item.getStatus()._tag ?? "idle";

  const pageExecutions = useBlockExecutions(
    props.executionQueue,
    props.block,
    "pivot-table-load-page"
  );
  const pageExecution = head(pageExecutions);
  const pageStatus = pageExecution?.item.getStatus()._tag ?? "idle";

  const loadingTable = isExecutionStatusLoading(pageStatus);
  const loadingPage = isExecutionStatusLoading(status);

  const isEditable =
    props.isEditable &&
    execution?.batch.isRunAll() !== true &&
    pageExecution?.batch.isRunAll() !== true;

  const execStatus = getPivotTableBlockExecStatus(
    props.block,
    props.executionQueue
  );

  const onRunAbort = useCallback(() => {
    if (execution || pageExecution) {
      if (execution) {
        if (execution.item.getStatus()._tag === "enqueued") {
          execution.batch.removeItem(attrs.id);
        } else {
          execution.item.setAborting();
        }
      }
      if (pageExecution) {
        if (pageExecution.item.getStatus()._tag === "enqueued") {
          pageExecution.batch.removeItem(attrs.id);
        } else {
          pageExecution.item.setAborting();
        }
      }
    } else {
      props.executionQueue.enqueueBlock(
        props.block,
        props.userId,
        environmentStartedAt,
        {
          _tag: "pivot-table",
        }
      );
    }
  }, [
    execution,
    pageExecution,
    props.executionQueue,
    props.block,
    props.userId,
    environmentStartedAt,
    attrs.id,
  ]);

  const onToggleIsBlockHiddenInPublished = useCallback(() => {
    props.onToggleIsBlockHiddenInPublished(attrs.id);
  }, [props.onToggleIsBlockHiddenInPublished, attrs.id]);

  const onSort = useCallback(
    (sort: PivotTableSort | null) => {
      props.block.setAttribute("sort", sort);
      props.executionQueue.enqueueBlock(
        props.block,
        props.userId,
        environmentStartedAt,
        {
          _tag: "pivot-table",
        }
      );
    },
    [props.block, props.executionQueue, props.userId, environmentStartedAt]
  );

  const [, editorAPI] = useEditorAwareness();
  const onClickWithin = useCallback(() => {
    editorAPI.insert(attrs.id, { scrollIntoView: false });
  }, [attrs.id, editorAPI.insert]);

  // ─── Tooltip content ──────────────────────────────────────────────────────

  const isRunButtonDisabled =
    status === "aborting" || execution?.batch.isRunAll();

  const runTooltipContent = useMemo(() => {
    if (status !== "idle") {
      switch (status) {
        case "enqueued":
          return {
            title: "This block is enqueud",
            message: isRunButtonDisabled
              ? "When running entire documents, you cannot remove individual blocks from the queue."
              : "It will run once the previous blocks finish executing. Click to remove it from the queue.",
          };
        // FIX no-fallthrough: added `return null` at end of running block
        case "running": {
          if (envStatus !== "Running" && !envLoading) {
            return {
              title: "Your environment is starting",
              message:
                "Please hang tight. We need to start your environment before rendering the pivot table.",
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
    } else {
      // FIX react/no-unstable-nested-components: using module-level renderRefreshTooltip
      return {
        content: renderRefreshTooltip,
      };
    }
  }, [status, envStatus, envLoading, execution, isRunButtonDisabled]);

  // ─── Dashboard-only render ────────────────────────────────────────────────

  if (props.dashboardMode && !dashboardModeHasControls(props.dashboardMode)) {
    if (!attrs.result) {
      return (
        <div className="flex items-center justify-center h-full">
          {isExecutionStatusLoading(execStatus) ? (
            <LargeSpinner color="#b8f229" />
          ) : (
            <div className="text-ink-400 ">No query results</div>
          )}
        </div>
      );
    }

    return (
      <PivotTableView
        result={attrs.result}
        page={attrs.page}
        onPrevPage={onPrevPage}
        onNextPage={onNextPage}
        setPage={setPage}
        error={attrs.error}
        loadingTable={loadingTable}
        loadingPage={loadingPage}
        dataframe={dataframe}
        onNewSQL={onNewSQL}
        controlsHidden={attrs.controlsHidden}
        onToggleControlsHidden={onToggleControlsHidden}
        dashboardMode={props.dashboardMode}
        isEditable={isEditable}
        sort={attrs.sort}
        onSort={onSort}
      />
    );
  }

  // ─── Full render ──────────────────────────────────────────────────────────

  return (
    <button
      type="button"
      className="relative group/block w-full mt-6"
      onClick={onClickWithin}
      data-block-id={attrs.id}
    >
      <div
        className={clsx(
          "rounded-2xl border-[1.5px]",
          props.isBlockHiddenInPublished && "border-dashed",
          props.hasMultipleTabs ? "rounded-tl-none" : "rounded-tl-2xl",
          {
            "border-primary block-focus-ring":
              props.isCursorWithin && props.isCursorInserting,
            "border-hover-border shadow-none":
              props.isCursorWithin && !props.isCursorInserting,
            "border-hover-border block-shadow-soft dark:border-border-tertiary":
              !props.isCursorWithin,
          }
        )}
      >
        <div
          className={clsx(
            "rounded-2xl",
            props.hasMultipleTabs ? "rounded-tl-none" : ""
          )}
        >
          <div
            className="border-b border-hover-border dark:border-border-tertiary rounded-t-2xl"
            ref={d => {
              props.dragPreview?.(d);
            }}
          >
            <div className="flex items-center justify-between px-3 pr-0 gap-x-4 font-body  h-10 divide-x divide-border-secondary dark:divide-border-tertiary">
              <div className="select-none text-gray-300 text-xs flex items-center w-full h-full gap-x-1.5 px-4">
                <input
                  type="text"
                  className={clsx(
                    "text-sm font-body font-normal pl-1 block w-full border-0 border-b border-transparent focus:border-primary focus:outline-none text-ink-100 placeholder:text-ink-300 py-0 h-2/3 bg-transparent focus:bg-base-100"
                  )}
                  placeholder={
                    props.isEditable
                      ? "Add a title..."
                      : "Pivot Table"
                  }
                  value={attrs.title}
                  onChange={onChangeTitle}
                  disabled={!props.isEditable}
                />
              </div>
              <div className="print:hidden flex items-center gap-x-0 group-focus/block:opacity-100 h-full divide-x divide-border-secondary dark:divide-border-tertiary">
                <HeaderSelect
                  value={dataframe?.name ?? ""}
                  onChange={onChangeDataframe}
                  options={dataframeOptions}
                  onAdd={onNewSQL}
                  onAddLabel="New query"
                  disabled={!isEditable}
                  placeholders={["No dataframe selected", "No dataframes"]}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="h-[580px] flex items-center">
          <PivotTableControls
            dataframe={dataframe}
            rows={attrs.rows}
            onChangeRows={onChangeRows}
            columns={attrs.columns}
            onChangeColumns={onChangeColumns}
            metrics={attrs.metrics}
            onChangeMetrics={onChangeMetrics}
            isHidden={attrs.controlsHidden}
            isEditable={isEditable}
          />
          <PivotTableView
            result={attrs.result}
            page={attrs.page}
            onPrevPage={onPrevPage}
            onNextPage={onNextPage}
            setPage={setPage}
            error={attrs.error}
            loadingTable={loadingTable}
            loadingPage={loadingPage}
            dataframe={dataframe}
            onNewSQL={onNewSQL}
            controlsHidden={attrs.controlsHidden}
            onToggleControlsHidden={onToggleControlsHidden}
            dashboardMode={props.dashboardMode}
            isEditable={isEditable}
            sort={attrs.sort}
            onSort={onSort}
          />
        </div>
      </div>
      <div className="absolute left-0 top-0 -translate-y-full pb-2">
        <BlockTypePill label="Pivot" icon={<PiTable className="w-3 h-3" />} />
      </div>
      <div
        className={clsx(
          "absolute transition-opacity opacity-0 group-hover/block:opacity-100 right-0 top-0 -translate-y-full pb-2 flex flex-row gap-x-1",
          execStatusIsDisabled(execStatus) ? "opacity-100" : "opacity-0",
          {
            hidden: !props.isEditable,
          }
        )}
      >
        <TooltipV2<HTMLButtonElement> {...runTooltipContent} active>
          {ref => (
            <button
              type="button"
              ref={ref}
              className={clsx(
                {
                  "bg-gray-200": isRunButtonDisabled || !dataframe,
                  "bg-red-200": status === "running" && envStatus === "Running",
                  "bg-yellow-300":
                    !isRunButtonDisabled &&
                    (status === "enqueued" ||
                      (status === "running" && envStatus !== "Running")),
                  "bg-base-200": !isRunButtonDisabled && status === "idle",
                },
                "rounded-[5px] border-hover-border border border-border dark:border-border-tertiary h-[24px] min-w-[24px] flex items-center justify-center relative group disabled:cursor-not-allowed hover:bg-gray-50"
              )}
              onClick={onRunAbort}
              disabled={!dataframe || isRunButtonDisabled}
            >
              {isExecutionStatusLoading(execStatus) ? (
                <div>
                  {execStatus === "enqueued" ? (
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
            isCodeHidden={false}
            isOutputHidden={false}
          />
        )}
      </div>
    </button>
  );
}

export default PivotTableBlock;
