import { v4 as uuidv4 } from "uuid";
import * as Y from "yjs";
import type {
  ExecutionQueue,
  YBlock,
  VisualizationV2BlockInput,
  VisualizationV2Block,
} from "@sandworm/editor";
import {
  BlockType,
  isExecutionStatusLoading,
  getDataframeFromVisualizationV2,
  getVisualizationV2Attributes,
  isVisualizationV2Block,
  setVisualizationV2Input,
} from "@sandworm/editor";
import { FunnelIcon } from "@heroicons/react/24/outline";
import type { RefObject } from "react";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import clsx from "clsx";
import type {
  ChartType,
  DataFrame,
  DataFrameColumn,
  HistogramBin,
  HistogramFormat,
  TimeUnit,
  VisualizationFilter,
  YAxis,
  Series,
} from "@sandworm/types";
import {
  isInvalidVisualizationFilter,
  NumpyDateTypes,
  exhaustiveCheck,
} from "@sandworm/types";
import type { ConnectDragPreview } from "react-dnd";
import { equals, head, omit } from "ramda";
import { PiChartBar, PiPlayFill, PiStop, PiClock } from "react-icons/pi";

import { BlockTypePill } from "@/components/Editor/blocks/BlockTypePill";
import type { ApiDocument } from "@/types";
import { TooltipV2 } from "@/components/Editor/blocks/ToolTips";
import HeaderSelect from "@/components/Editor/blocks/HeaderSelect";
import {
  dashboardModeHasControls,
  type DashboardMode,
} from "@/components/Editor/blocks/Dashboard/dashboard-types";
import HiddenInPublishedButton from "@/components/Editor/blocks/HiddenInPublishedButton";

import useEditorAwareness from "../Editor/hooks/useEditorAwareness";
import { useBlockExecutions } from "../Editor/hooks/useBlockExecution";
import { useYMemo } from "../Editor/hooks/useYMemo";
import useFullScreenDocument from "../Editor/hooks/useFullScreenDocument";
import { useEnvironmentStatus } from "../Editor/hooks/useEnvironmentStatus";

import { getAggFunction } from "./YAxisPicker";
import VisualizationControlsV2 from "./VisualizationControls";
import VisualizationViewV2 from "./VisualizationView";
import FilterSelector from "./FilterSelector";

// =====================================
// ⬢ readFile
// =====================================
export function readFile(
  file: File,
  encoding: BufferEncoding = "utf8"
): Promise<string> {
  const fileReader = new FileReader();
  fileReader.readAsArrayBuffer(file);

  return new Promise(resolve => {
    fileReader.onload = e => {
      if (!e.target?.result) {
        return;
      }

      // ⬢ NOTE — consistent-return: don't return the resolve() call.
      // The callback return type is void; returning a value causes the lint error.
      if (typeof e.target.result === "string") {
        resolve(e.target.result);
        return;
      }

      resolve(Buffer.from(e.target.result).toString(encoding));
    };
  });
}

// =====================================
// ⬢ downloadFile
// =====================================
export function downloadFile(url: string, name: string) {
  const downloadLink = document.createElement("a");
  downloadLink.download = name;
  downloadLink.href = url;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

// =====================================
// ⬢ didChangeFilters
// =====================================
function didChangeFilters(
  oldFilters: VisualizationFilter[],
  newFilters: VisualizationFilter[],
  dataframe: DataFrame
) {
  const toCompare = new Set(newFilters.map(f => f.id));

  const didChange = oldFilters.some(of => {
    const nf = newFilters.find(f => f.id === of.id);
    if (!nf) {
      return !isInvalidVisualizationFilter(of, dataframe);
    }

    toCompare.delete(of.id);

    const wasInvalid = isInvalidVisualizationFilter(of, dataframe);
    const isInvalid = isInvalidVisualizationFilter(nf, dataframe);
    if (wasInvalid && isInvalid) {
      return false;
    }

    return (
      !equals(of.value, nf.value) ||
      of.operator !== nf.operator ||
      of.column?.name !== nf.column?.name
    );
  });

  // ⬢ NOTE — for...of replaced with forEach to satisfy no-restricted-syntax.
  // Using Array.from on toCompare.values() since Set iterators aren't arrays.
  if (toCompare.size > 0) {
    Array.from(toCompare.values()).forEach(id => {
      const nf = newFilters.find(f => f.id === id);
      if (nf && isInvalidVisualizationFilter(nf, dataframe)) {
        toCompare.delete(id);
      }
    });
  }

  return didChange || toCompare.size > 0;
}

// =====================================
// ⬢ Types
// =====================================
interface Props {
  document: ApiDocument;
  dataframes: Y.Map<DataFrame>;
  block: Y.XmlElement<VisualizationV2Block>;
  blocks: Y.Map<YBlock>;
  dragPreview: ConnectDragPreview | null;
  isEditable: boolean;
  isPublicMode: boolean;
  onAddGroupedBlock: (
    blockId: string,
    blockType: BlockType,
    position: "before" | "after"
  ) => void;
  dashboardMode: DashboardMode | null;
  hasMultipleTabs: boolean;
  isBlockHiddenInPublished: boolean;
  onToggleIsBlockHiddenInPublished: (blockId: string) => void;
  isCursorWithin: boolean;
  isCursorInserting: boolean;
  executionQueue: ExecutionQueue;
  userId: string | null;
  isFullScreen: boolean;
}

// =====================================
// ⬢ RunTooltipRefreshContent
// =====================================
function RunTooltipRefreshContent({
  divRef,
}: {
  divRef: RefObject<HTMLDivElement>;
}) {
  return (
    <div
      className="font-body pointer-events-none w-max bg-hunter-950 text-white text-xs p-2 rounded-md flex flex-col gap-y-1"
      ref={divRef}
    >
      <span>Refresh</span>
    </div>
  );
}

const IDLE_TOOLTIP_CONTENT = {
  content: (ref: RefObject<HTMLDivElement>) => (
    <RunTooltipRefreshContent divRef={ref} />
  ),
};

// =====================================
// ⬢ VisualizationBlockV2
// =====================================
function VisualizationBlockV2(props: Props) {
  const hasEnqueued = useRef(false);

  // ✦  derived: block attributes
  const attrs = useYMemo(
    [props.block],
    () => getVisualizationV2Attributes(props.block),
    []
  );

  const dataframe = useYMemo(
    [props.block, props.dataframes],
    () => getDataframeFromVisualizationV2(props.block, props.dataframes),
    []
  );

  const dataframeOptions = useYMemo(
    [props.dataframes],
    () =>
      Array.from(props.dataframes.values()).map(df => ({
        value: df.name,
        label: df.name,
      })),
    []
  );

  // ⬢ NOTE — declared early so onChangeDataframe can reference setIsDirty
  // without triggering no-use-before-define.
  const [isDirty, setIsDirty] = useState(false);

  // ✦  execution state ✦
  const executions = useBlockExecutions(
    props.executionQueue,
    props.block,
    "visualization-v2"
  );
  const execution = head(executions) ?? null;
  const status = execution?.item.getStatus()._tag ?? "idle";

  const {
    status: envStatus,
    loading: envLoading,
    startedAt: environmentStartedAt,
  } = useEnvironmentStatus(props.document.workspaceId);

  // ⬢ Handlers
  // =====================================
  const onNewSQL = useCallback(() => {
    props.onAddGroupedBlock(attrs.id, BlockType.SQL, "before");
  }, [props.onAddGroupedBlock]);

  const onChangeXAxis = useCallback(
    (xAxis: DataFrameColumn | null) => {
      let { xAxisGroupFunction } = attrs.input;
      if (xAxis) {
        const isDateTime = NumpyDateTypes.safeParse(xAxis.type).success;
        if (isDateTime && !attrs.input.xAxisGroupFunction) {
          xAxisGroupFunction = "date";
        }
      }
      setVisualizationV2Input(props.block, { xAxis, xAxisGroupFunction });
    },
    [attrs.input.xAxisGroupFunction, props.block]
  );

  const onChangeXAxisName = useCallback(
    (name: string | null) => {
      setVisualizationV2Input(props.block, { xAxisName: name });
    },
    [props.block]
  );

  const onRun = useCallback(() => {
    console.log("[viz] onRun called", {
      environmentStartedAt,
      attrs_id: attrs.id,
    });

    executions.forEach(e => e.item.setAborting());
    props.executionQueue.enqueueBlock(
      attrs.id,
      props.userId,
      environmentStartedAt,
      { _tag: "visualization-v2" }
    );
  }, [
    executions,
    props.executionQueue,
    attrs.id,
    props.userId,
    environmentStartedAt,
  ]);

  useEffect(() => {
    if (
      attrs.output ||
      (attrs.error && attrs.error !== "dataframe-not-set") ||
      status !== "idle" ||
      envLoading ||
      hasEnqueued.current
    ) {
      return;
    }

    if (attrs.input.dataframeName) {
      hasEnqueued.current = true;
      onRun();
    }
  }, [attrs.output, attrs.input.dataframeName, onRun, envLoading, status]);

  useEffect(() => {
    if (attrs.output) hasEnqueued.current = false;
  }, [attrs.output]);

  const onChangeDataframe = useCallback(
    (dataframeName: string) => {
      const df = props.dataframes.get(dataframeName);
      if (df) {
        const xAxis = attrs.input.xAxis
          ? (df.columns.find(c => c.name === attrs.input.xAxis?.name) ?? null)
          : null;

        let { xAxisGroupFunction } = attrs.input;
        if (xAxis) {
          const isDateTime = NumpyDateTypes.safeParse(xAxis.type).success;
          if (!isDateTime) {
            xAxisGroupFunction = null;
          } else if (!xAxisGroupFunction) {
            xAxisGroupFunction = "date";
          }
        }

        const yAxes = attrs.input.yAxes.map(yAxis => ({
          ...yAxis,
          series: yAxis.series.map(s => {
            if (s.column) {
              const column =
                df.columns.find(c => c.name === s.column?.name) ?? null;
              const groupBy =
                df.columns.find(c => c.name === s.groupBy?.name) ?? null;
              const aggregateFunction = column
                ? getAggFunction(s, column)
                : null;
              return { ...s, column, aggregateFunction, groupBy };
            }
            return s;
          }),
        }));

        setVisualizationV2Input(props.block, {
          dataframeName,
          xAxis,
          xAxisGroupFunction,
          yAxes,
        });
        setTimeout(() => {
          setIsDirty(true);
        }, 500);
      }
    },
    [
      props.dataframes,
      props.block,
      onRun,
      attrs.input.chartType,
      attrs.input.xAxis,
      attrs.input.xAxisGroupFunction,
      attrs.input.yAxes,
    ]
  );

  const onRunAbort = useCallback(() => {
    switch (status) {
      case "enqueued":
        execution?.batch.removeItem(attrs.id);
        break;
      case "running":
        execution?.item.setAborting();
        break;
      case "idle":
      case "unknown":
      case "completed":
        onRun();
        break;
      case "aborting":
        break;
      default:
        exhaustiveCheck(status);
    }
  }, [status, execution, onRun, attrs.id]);

  const onAddFilter = useCallback(() => {
    const newFilter: VisualizationFilter = {
      id: uuidv4(),
      type: "unfinished-visualization-filter",
      column: null,
      operator: null,
      value: null,
    };
    setVisualizationV2Input(props.block, {
      filters: [...attrs.input.filters, newFilter],
    });
  }, [attrs.input.filters, props.block]);

  const onChangeFilter = useCallback(
    (filter: VisualizationFilter) => {
      const filters = attrs.input.filters.map(f =>
        f.id === filter.id ? filter : f
      );
      setVisualizationV2Input(props.block, { filters });
    },
    [attrs.input.filters, props.block]
  );

  const onRemoveFilter = useCallback(
    (filter: VisualizationFilter) => {
      setVisualizationV2Input(props.block, {
        filters: attrs.input.filters.filter(f => f.id !== filter.id),
      });
    },
    [props.block, attrs.input.filters]
  );

  const onToggleHidden = useCallback(() => {
    props.block.setAttribute("controlsHidden", !attrs.controlsHidden);
  }, [attrs.controlsHidden, props.block]);

  const onExportToPNG = async () => {
    if (attrs.input.chartType === "number" || attrs.input.chartType === "trend")
      return;

    // ⬢ NOTE — removed the controlsHidden toggle before capture.
    // toggling attrs.controlsHidden forces a full remount of Echarts via the
    // key prop in VisualizationViewV2, making the canvas temporarily unavailable.
    // The proper long-term fix is to store the echarts instance in a ref and
    // use chart.getDataURL() instead of DOM querying.

    const canvas = document.querySelector(
      `div[data-block-id='${attrs.id}'] canvas`
    ) as HTMLCanvasElement;

    if (!canvas) return;

    const imageUrl = canvas.toDataURL("image/png");
    const fileName = attrs.title || "Visualization";
    downloadFile(imageUrl, fileName);
  };

  const onChangeChartType = useCallback(
    (chartType: ChartType) => {
      let nextInput: Partial<VisualizationV2BlockInput>;

      switch (chartType) {
        case "trend":
        case "number": {
          const yAxis = attrs.input.yAxes[0];
          const series = yAxis?.series[0] ?? null;
          nextInput = {
            dataframeName: attrs.input.dataframeName,
            chartType,
            xAxis: attrs.input.xAxis,
            xAxisName: attrs.input.xAxisName,
            xAxisSort: attrs.input.xAxisSort,
            xAxisGroupFunction: attrs.input.xAxisGroupFunction,
            yAxes:
              series && yAxis
                ? [
                    {
                      id: yAxis.id,
                      name: yAxis.name,
                      series: [
                        {
                          id: series.id,
                          chartType: null,
                          column: series.column,
                          aggregateFunction: series.aggregateFunction,
                          groupBy: null,
                          name: null,
                          color: null,
                          groups: null,
                          dateFormat: null,
                          numberFormat: null,
                        },
                      ],
                    },
                  ]
                : [],
            filters: attrs.input.filters,
          };
          break;
        }
        case "groupedColumn":
        case "line":
        case "area":
        case "scatterPlot":
        case "stackedColumn":
        case "hundredPercentStackedArea":
        case "hundredPercentStackedColumn":
        case "pie":
        case "histogram":
          nextInput = { ...attrs.input, chartType };
          break;
        default:
          nextInput = { ...attrs.input };
          break;
      }

      setVisualizationV2Input(props.block, nextInput);
    },
    [props.block, attrs.input]
  );

  const onChangeXAxisGroupFunction = useCallback(
    (groupFunction: TimeUnit | null) => {
      setVisualizationV2Input(props.block, {
        xAxisGroupFunction: groupFunction,
      });
    },
    [props.block]
  );

  const onChangeXAxisSort = useCallback(
    (sort: "ascending" | "descending") => {
      setVisualizationV2Input(props.block, { xAxisSort: sort });
    },
    [props.block]
  );

  const onChangeHistogramFormat = useCallback(
    (format: HistogramFormat) => {
      setVisualizationV2Input(props.block, { histogramFormat: format });
    },
    [props.block]
  );

  const onChangeHistogramBin = useCallback(
    (bin: HistogramBin) => {
      setVisualizationV2Input(props.block, { histogramBin: bin });
    },
    [props.block]
  );

  const onChangeXAxisDateFormat = useCallback(
    (dateFormat: NonNullable<VisualizationV2BlockInput["xAxisDateFormat"]>) => {
      setVisualizationV2Input(props.block, { xAxisDateFormat: dateFormat });
    },
    [props.block]
  );

  const onChangeXAxisNumberFormat = useCallback(
    (format: VisualizationV2BlockInput["xAxisNumberFormat"]) => {
      setVisualizationV2Input(props.block, { xAxisNumberFormat: format });
    },
    [props.block]
  );

  const tooManyDataPointsHidden = !(attrs.output?.tooManyDataPoints ?? true);

  const onHideTooManyDataPointsWarning = useCallback(() => {
    if (!attrs.output) return;
    props.block.setAttribute("output", {
      ...attrs.output,
      tooManyDataPoints: false,
    });
  }, [props.block, attrs.output]);

  const onChangeTitle = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      props.block.setAttribute("title", e.target.value);
    },
    [props.block]
  );

  useEffect(() => {
    if (!dataframe) return () => {};

    let timeout: NodeJS.Timeout | null = null;

    function observe(event: Y.YXmlEvent) {
      const block = event.target;
      if (!(block instanceof Y.XmlElement)) return;
      if (!isVisualizationV2Block(block)) return;

      const input = block.getAttribute("input");
      if (!dataframe || !input) return;

      const shouldIgnore =
        event.changes.keys.size === 0 ||
        Array.from(event.changes.keys.entries()).every(([key, val]) => {
          if (key === "input") {
            const xAxisFormattingFields: (keyof VisualizationV2BlockInput)[] = [
              "xAxisNumberFormat",
              "xAxisDateFormat",
            ];
            const seriesFormattingFields: (keyof Series)[] = [
              "dateFormat",
              "numberFormat",
            ];

            const oldValueForComparison = {
              ...omit([...xAxisFormattingFields, "filters"], val.oldValue),
              yAxes: val.oldValue.yAxes.map((yAxis: YAxis) => ({
                ...yAxis,
                series: yAxis.series.map((series: Series) => ({
                  ...omit(seriesFormattingFields, series),
                })),
              })),
            };
            const newValueForComparison = {
              ...omit([...xAxisFormattingFields, "filters"], input),
              yAxes: input.yAxes.map((yAxis: YAxis) => ({
                ...yAxis,
                series: yAxis.series.map((series: Series) => ({
                  ...omit(seriesFormattingFields, series),
                })),
              })),
            };

            const isEqual = equals(
              oldValueForComparison,
              newValueForComparison
            );

            return (
              isEqual &&
              !didChangeFilters(val.oldValue.filters, input.filters, dataframe)
            );
          }
          return true;
        });

      if (!shouldIgnore) {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
          setIsDirty(true);
        }, 1000);
      }
    }

    props.block.observe(observe);

    return () => {
      if (timeout) clearTimeout(timeout);
      props.block.unobserve(observe);
    };
  }, [props.block, dataframe]);

  useEffect(() => {
    if (isDirty) {
      onRun();
      setIsDirty(false);
    }
  }, [isDirty, props.block, onRun]);

  const [isFullScreen] = useFullScreenDocument(props.document.id);

  const onChangeYAxes = useCallback(
    (yAxes: YAxis[]) => {
      setVisualizationV2Input(props.block, { yAxes });
    },
    [props.block]
  );

  const hasAValidYAxis = attrs.input.yAxes.some(yAxis =>
    yAxis.series.some(s => s.column !== null)
  );

  const onToggleIsBlockHiddenInPublished = useCallback(() => {
    props.onToggleIsBlockHiddenInPublished(attrs.id);
  }, [props.onToggleIsBlockHiddenInPublished, attrs.id]);

  const [, editorAPI] = useEditorAwareness();
  const onClickWithin = useCallback(() => {
    editorAPI.insert(attrs.id, { scrollIntoView: false });
  }, [attrs.id, editorAPI.insert]);

  const viewLoading = isExecutionStatusLoading(status);

  const onChangeDataLabels = useCallback(
    (dataLabels: VisualizationV2BlockInput["dataLabels"]) => {
      setVisualizationV2Input(props.block, { dataLabels });
    },
    [props.block]
  );

  const onChangeSeries = useCallback(
    (id: Series["id"], series: Series) => {
      const yAxes = attrs.input.yAxes.map(yAxis => {
        const newSeries = yAxis.series.map(s => (s.id === id ? series : s));
        return { ...yAxis, series: newSeries };
      });
      setVisualizationV2Input(props.block, { yAxes });
    },
    [props.block, attrs.input.yAxes]
  );

  const onChangeAllSeries = useCallback(
    (yIndex: number, series: Series[]) => {
      setVisualizationV2Input(props.block, {
        yAxes: attrs.input.yAxes.map((yAxis, index) =>
          index === yIndex ? { ...yAxis, series } : yAxis
        ),
      });
    },
    [props.block, attrs.input.yAxes]
  );

  const isRunButtonDisabled =
    status === "aborting" ||
    execution?.batch.isRunAll() ||
    !dataframe ||
    (!attrs.input.xAxis &&
      attrs.input.chartType !== "number" &&
      attrs.input.chartType !== "trend") ||
    (!hasAValidYAxis && attrs.input.chartType !== "histogram") ||
    !props.isEditable;

  // ⬢ Tooltip Content
  // =====================================

  // eslint-disable-next-line consistent-return
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
        case "running": {
          if (envStatus !== "Running" && !envLoading) {
            return {
              title: "Your environment is starting",
              message:
                "Please hang tight. We need to start your environment before rendering the visualization.",
            };
          }

          if (execution?.batch.isRunAll() ?? false) {
            return {
              title: "This block is running.",
              message:
                "When running entire documents, you cannot stop individual blocks.",
            };
          }

          // ⬢ NOTE — explicit return null to fix no-fallthrough. If running
          // but neither condition is met, fall through to null is intentional
          // but must be explicit.
          return null;
        }
        case "unknown":
        case "aborting":
        case "completed":
          return null;
        default:
          break;
      }
    } else {
      return IDLE_TOOLTIP_CONTENT;
    }
  }, [status, envStatus, envLoading, execution, isRunButtonDisabled]);

  // ⬢ Render
  // =====================================
  if (props.dashboardMode && !dashboardModeHasControls(props.dashboardMode)) {
    return (
      <VisualizationViewV2
        title={attrs.title}
        input={attrs.input}
        tooManyDataPointsHidden={tooManyDataPointsHidden}
        onHideTooManyDataPointsWarning={onHideTooManyDataPointsWarning}
        loading={viewLoading}
        error={attrs.error}
        dataframe={dataframe}
        onNewSQL={onNewSQL}
        result={attrs.output?.result ?? null}
        controlsHidden={attrs.controlsHidden}
        isFullScreen={isFullScreen}
        isHidden={attrs.controlsHidden}
        onToggleHidden={onToggleHidden}
        onExportToPNG={onExportToPNG}
        hasControls={dashboardModeHasControls(props.dashboardMode)}
        isEditable={props.isEditable}
      />
    );
  }

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className="relative group/block w-full mt-6"
      onClick={onClickWithin}
      data-block-id={attrs.id}
    >
      <div
        className={clsx(
          "rounded-2xl border-[1.5px]",
          props.isBlockHiddenInPublished && "border-dashed",
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
        <div className="rounded-2xl">
          <div
            className="border-b border-hover-border dark:border-border-tertiary rounded-t-2xl"
            ref={d => {
              props.dragPreview?.(d);
            }}
          >
            <div className="flex items-center justify-between px-3 pr-0 gap-x-4 font-body h-10 divide-x divide-border-secondary dark:divide-border-tertiary">
              <div className="select-none text-gray-300 text-xs flex items-center w-full h-full gap-x-1.5 px-4">
                <input
                  type="text"
                  className={clsx(
                    "text-sm font-body font-normal pl-1 ring-gray-200 focus:ring-border-focus block w-full rounded-lg border-0 text-ink-100 hover:ring-1 focus:ring-1 ring-inset focus:ring-inset placeholder:text-ink-300 py-0 disabled:ring-0 h-2/3 bg-transparent focus:bg-base-100"
                  )}
                  placeholder="Click to add a title..."
                  value={attrs.title}
                  onChange={onChangeTitle}
                  disabled={!props.isEditable}
                />
              </div>
              <div className="print:hidden flex items-center gap-x-0 group-focus/block:opacity-100 h-full divide-x divide-border-secondary dark:divide-border-tertiary">
                <button
                  type="button"
                  className={clsx(
                    "font-body text-xs flex justify-center items-center gap-x-1.5 text-ink-400 px-2.5 whitespace-nowrap disabled:bg-white hover:bg-gray-100 disabled:cursor-not-allowed h-full min-w-[124px] dark:hover:bg-editor-100",
                    props.isPublicMode ? "hidden" : "inline-block"
                  )}
                  onClick={onAddFilter}
                  disabled={!props.isEditable}
                >
                  <FunnelIcon className="h-4 w-4 text-ink-400" />
                  <span>Add filter</span>
                </button>
                <HeaderSelect
                  value={dataframe?.name ?? ""}
                  onChange={onChangeDataframe}
                  options={dataframeOptions}
                  onAdd={onNewSQL}
                  onAddLabel="New query"
                  disabled={!props.isEditable}
                />
              </div>
            </div>
          </div>
        </div>

        <div
          className={clsx(
            "p-2 flex flex-wrap items-center gap-2 min-h[3rem] border-b border-border-secondary",
            { hidden: attrs.input.filters.length === 0 }
          )}
        >
          {attrs.input.filters.map(filter => (
            <FilterSelector
              key={filter.id}
              filter={filter}
              dataframe={dataframe ?? { name: "", columns: [] }}
              onChange={onChangeFilter}
              onRemove={onRemoveFilter}
              isInvalid={
                !dataframe ||
                (filter.column !== null &&
                  (!dataframe.columns.some(
                    c => c.name === filter.column?.name
                  ) ||
                    isInvalidVisualizationFilter(filter, dataframe)))
              }
              disabled={!props.isEditable}
            />
          ))}
        </div>

        <div className="h-[580px] flex items-center">
          <VisualizationControlsV2
            isHidden={attrs.controlsHidden || !props.isEditable}
            dataframe={dataframe}
            chartType={attrs.input.chartType}
            onChangeChartType={onChangeChartType}
            xAxis={attrs.input.xAxis}
            onChangeXAxis={onChangeXAxis}
            xAxisName={attrs.input.xAxisName}
            onChangeXAxisName={onChangeXAxisName}
            xAxisSort={attrs.input.xAxisSort}
            onChangeXAxisSort={onChangeXAxisSort}
            xAxisGroupFunction={attrs.input.xAxisGroupFunction}
            onChangeXAxisGroupFunction={onChangeXAxisGroupFunction}
            xAxisDateFormat={attrs.input.xAxisDateFormat}
            onChangeXAxisDateFormat={onChangeXAxisDateFormat}
            xAxisNumberFormat={attrs.input.xAxisNumberFormat}
            onChangeXAxisNumberFormat={onChangeXAxisNumberFormat}
            yAxes={attrs.input.yAxes}
            onChangeYAxes={onChangeYAxes}
            histogramFormat={attrs.input.histogramFormat}
            onChangeHistogramFormat={onChangeHistogramFormat}
            histogramBin={attrs.input.histogramBin}
            onChangeHistogramBin={onChangeHistogramBin}
            dataLabels={attrs.input.dataLabels}
            onChangeDataLabels={onChangeDataLabels}
            isEditable={props.isEditable}
            result={attrs.output?.result ?? null}
            onChangeSeries={onChangeSeries}
            onChangeAllSeries={onChangeAllSeries}
          />
          <VisualizationViewV2
            title={attrs.title}
            input={attrs.input}
            tooManyDataPointsHidden={tooManyDataPointsHidden}
            onHideTooManyDataPointsWarning={onHideTooManyDataPointsWarning}
            loading={viewLoading}
            error={attrs.error}
            dataframe={dataframe}
            onNewSQL={onNewSQL}
            result={attrs.output?.result ?? null}
            controlsHidden={attrs.controlsHidden}
            isFullScreen={isFullScreen}
            isHidden={attrs.controlsHidden}
            onToggleHidden={onToggleHidden}
            onExportToPNG={onExportToPNG}
            hasControls
            isEditable={props.isEditable}
          />
        </div>

        <div className="absolute left-0 top-0 -translate-y-full pb-2">
          <BlockTypePill
            label="Chart"
            icon={<PiChartBar className="w-3 h-3" />}
          />
        </div>
        <div
          className={clsx(
            "absolute transition-opacity opacity-0 group-hover/block:opacity-100 right-0 top-0 -translate-y-full pb-2 flex flex-row gap-x-1",
            viewLoading ? "opacity-100" : "opacity-0",
            { hidden: !props.isEditable }
          )}
        >
          <TooltipV2<HTMLButtonElement> {...runTooltipContent} active>
            {ref => (
              <button
                type="button"
                ref={ref}
                className={clsx(
                  {
                    "bg-gray-200": isRunButtonDisabled,
                    "bg-red-200":
                      status === "running" && envStatus === "Running",
                    "bg-yellow-300":
                      !isRunButtonDisabled &&
                      (status === "enqueued" ||
                        (status === "running" && envStatus !== "Running")),
                    "bg-base-200": !isRunButtonDisabled && status === "idle",
                    "bg-inputBg":
                      !isRunButtonDisabled &&
                      status !== "running" &&
                      status !== "enqueued" &&
                      status !== "idle",
                  },
                  "rounded-[5px] border-hover-border border border-border dark:border-border-tertiary h-[24px] min-w-[24px] flex items-center justify-center relative group disabled:cursor-not-allowed hover:bg-gray-50"
                )}
                onClick={onRunAbort}
                disabled={isRunButtonDisabled}
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
              onToggleIsBlockHiddenInPublished={
                onToggleIsBlockHiddenInPublished
              }
              hasMultipleTabs={props.hasMultipleTabs}
              isCodeHidden={false}
              isOutputHidden={false}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default VisualizationBlockV2;
