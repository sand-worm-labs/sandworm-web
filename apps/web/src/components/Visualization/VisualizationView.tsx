import * as dfns from "date-fns";
import * as echarts from "echarts-unofficial-v6";
import { fontFamily as twFontFamiliy } from "tailwindcss/defaultTheme";
import { format as d3Format } from "d3-format";
import {
  ChevronDoubleRightIcon,
  ChevronDoubleLeftIcon,
} from "@heroicons/react/24/solid";
import {
  ArrowLongDownIcon,
  ArrowLongUpIcon,
} from "@heroicons/react/20/solid";
import { CloseIconButton } from "@/components/CloseIconButton";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import type {
  DataFrame,
  TimeUnit,
  Series,
  DateFormat,
  NumberFormat,
} from "@sandworm/types";
import {
  NumpyDateTypes,
  exhaustiveCheck,
  NumpyNumberTypes,
} from "@sandworm/types";
import clsx from "clsx";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import debounce from "lodash.debounce";
import type {
  VisualizationV2BlockInput,
  VisualizationV2BlockOutputResult,
  XAxis,
} from "@sandworm/editor";
import { head, uniq } from "ramda";
import { PiEmpty } from "react-icons/pi";

import useResettableState from "../Editor/hooks/useResettableState";
import useSideBar from "../Editor/hooks/useSideBar";
import LargeSpinner from "../Editor/blocks/LargeSpinner";

import { findMaxFontSize, measureText } from "./measureText";

// =====================================
// ⬢ Constants
// =====================================
const FONT_FAMILY = ["Moderat", ...twFontFamiliy.sans].join(", ");

// =====================================
// ⬢ Types
// =====================================
interface Props {
  title: string;
  input: VisualizationV2BlockInput;
  result: VisualizationV2BlockOutputResult | null;
  tooManyDataPointsHidden: boolean;
  onHideTooManyDataPointsWarning: () => void;
  loading: boolean;
  error:
    | "dataframe-not-found"
    | "dataframe-not-set"
    | "unknown"
    | "invalid-params"
    | null;
  dataframe: DataFrame | null;
  onNewSQL: () => void;
  controlsHidden: boolean;
  isFullScreen: boolean;
  isHidden: boolean;
  onToggleHidden: () => void;
  onExportToPNG?: () => void;
  hasControls: boolean;
  isEditable: boolean;
}

// =====================================
// ⬢ VisualizationViewV2
// =====================================
function VisualizationViewV2(props: Props) {
  const {
    state: { isOpen: isSideBarOpen },
  } = useSideBar();
  const key = `${isSideBarOpen}${props.controlsHidden.toString()}${props.isFullScreen.toString()}`;

  return (
    <div
      key={key}
      className={clsx(
        !props.controlsHidden && props.hasControls && "w-2/3",
        "flex-grow h-full flex items-center justify-center relative"
      )}
    >
      {props.result ? (
        <div className="relative w-full h-full">
          <SandwormResult
            title={props.title}
            result={props.result}
            input={props.input}
            hasControls={props.hasControls}
          />
          {props.loading && (
            <div className="absolute top-0 left-0 h-full w-full flex flex-col items-center justify-center bg-ceramic-50/60 ">
              <LargeSpinner color="#b8f229" />
            </div>
          )}
          {!props.tooManyDataPointsHidden && props.hasControls && (
            <div className="absolute top-0 left-0 right-0 bg-yellow-50 p-2">
              <div className="flex items-center justify-center gap-x-2">
                <ExclamationTriangleIcon
                  strokeWidth={1.2}
                  className="h-4 w-4 text-yellow-500"
                />
                <span className="text-xs leading-5 text-yellow-700">
                  Too many data points. Consider filtering or aggregating the
                  data.{" "}
                </span>
                <CloseIconButton
                  size="sm"
                  className="absolute right-2.5"
                  onClick={props.onHideTooManyDataPointsWarning}
                  aria-label="Dismiss warning"
                />
              </div>
            </div>
          )}
        </div>
      ) : props.loading ? (
        <div className="absolute top-0 left-0 h-full w-full flex flex-col items-center justify-center bg-ceramic-50/60 ">
          <LargeSpinner color="#b8f229" />
        </div>
      ) : (
        <div className="flex flex-col h-full w-full space-y-6 items-center justify-center bg-ceramic-50/30">
          {props.error === "dataframe-not-found" && props.dataframe ? (
            <div className="flex flex-col items-center justify-center gap-y-2">
              <ExclamationTriangleIcon
                strokeWidth={1.2}
                className="h-12 w-12 text-gray-300"
              />
              <div className="flex flex-col items-center text-sm text-gray-300 gap-y-2">
                <div>
                  <span className="font-mono">{props.dataframe.name}</span> not
                  found.
                </div>
                <div>
                  Try running the block for{" "}
                  <span className="font-mono">{props.dataframe.name}</span>{" "}
                  again.
                </div>
              </div>
            </div>
          ) : props.error === "unknown" ? (
            <div className="flex flex-col items-center justify-center space-y-2">
              <ExclamationTriangleIcon
                strokeWidth={1.2}
                className="h-10 w-10 text-ink-400"
              />
              <span className="text-base text-ink-400">Something went wrong</span>
            </div>
          ) : props.error === "invalid-params" ? (
            <div className="flex flex-col items-center justify-center space-y-2">
              <ExclamationTriangleIcon
                strokeWidth={1.2}
                className="h-12 w-12 text-ink-400"
              />
              <span className="text-lg text-ink-400">
                Missing or invalid parameters
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2">
              <PiEmpty strokeWidth={1.2} className="h-12 w-12 text-ink-400" />
              <span className="text-base text-ink-400">No data</span>
              {!props.dataframe && (
                <button
                  type="button"
                  className="text-[0.8rem] font-normal  text-ink-300 font-body hover:underline"
                  onClick={props.onNewSQL}
                >
                  Add a SQL block to fetch data to visualize.
                </button>
              )}
            </div>
          )}
        </div>
      )}
      {props.hasControls && props.isEditable && (
        <button
          type="button"
          className={clsx(
            "absolute bottom-0 bg-white rounded-tr-md border-t border-r border-border-secondary p-2 hover:bg-gray-50 z-10 dark:bg-[#181C21] dark:border-border-tertiary",
            props.isHidden ? "left-0 rounded-bl-md" : "-left-[1px]"
          )}
          onClick={props.onToggleHidden}
        >
          {props.isHidden ? (
            <ChevronDoubleRightIcon className="h-4 w-4 text-ink-400" />
          ) : (
            <ChevronDoubleLeftIcon className="h-4 w-4 text-ink-400" />
          )}
        </button>
      )}
      {props.hasControls &&
        props.input.chartType !== "number" &&
        props.input.chartType !== "trend" && (
          <button
            type="button"
            className="absolute bottom-0 bg-white rounded-tl-md rounded-br-2xl border-t border-l border-border-secondary p-2 hover:bg-gray-50 z-10 right-0 text-xs text-ink-400 dark:bg-[#181C21] dark:border-border-tertiary"
            onClick={props.onExportToPNG}
          >
            PNG
          </button>
        )}
    </div>
  );
}

// =====================================
// ⬢ SandwormResult
// =====================================
function SandwormResult(props: {
  title: string;
  input: VisualizationV2BlockInput;
  hasControls: boolean;
  result: VisualizationV2BlockOutputResult;
}) {
  const [size, setSize] = useResettableState(
    () => null as { width: number; height: number } | null,
    [props.result]
  );

  const measureDiv = useRef<HTMLDivElement>(null);
  const container = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!size && measureDiv.current) {
      const { width, height } = measureDiv.current.getBoundingClientRect();
      // ⬢ NOTE — only set if dimensions are valid. 0x0 means container isn't
      // laid out yet — let the ResizeObserver below catch the real dimensions.
      if (width > 0 && height > 0) {
        setSize({ width, height });
      }
    }
  }, [measureDiv.current, size]);

  useEffect(() => {
    if (size || !measureDiv.current) {
      return undefined;
    }
    const el = measureDiv.current;
    const ro = new ResizeObserver(() => {
      const { width, height } = el.getBoundingClientRect();
      if (width > 0 && height > 0) {
        setSize({ width, height });
        ro.disconnect();
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [size]);

  useEffect(() => {
    if (!container.current) {
      return () => {};
    }

    const parent = container.current.parentElement;
    if (!parent) {
      return () => {};
    }

    const observer = new ResizeObserver(
      debounce(() => {
        const { width, height } = parent.getBoundingClientRect();

        // we must compare whether the values distance surpasses 1 pixel to prevent
        // infinite loops due to mismatching floating points
        const widthDiff = Math.abs((size?.width ?? 0) - width);
        const heightDiff = Math.abs((size?.height ?? 0) - height);

        // ⬢ NOTE — consistent-return: removed early return in favour of
        // conditional setSize to keep the callback return type uniform (void).
        if (!size || widthDiff >= 1 || heightDiff >= 1) {
          setSize(prev => {
            if (
              width &&
              height &&
              (!prev || prev.width !== width || prev.height !== height)
            ) {
              return null;
            }
            return prev;
          });
        }
      }, 500)
    );

    observer.observe(parent);

    return () => {
      observer.disconnect();
    };
  }, [container.current]);

  // @ts-ignore
  const option: echarts.EChartsOption = useMemo(() => {
    const grid: echarts.EChartsOption["grid"] = {
      ...props.result.grid,
      left: props.hasControls ? "36px" : "28px",
      right: props.hasControls ? "36" : "28px",
      bottom: props.hasControls ? "56" : "28px",
    };

    if (props.hasControls) {
      grid.top = "92px";
    }

    const xAxes = props.result.xAxis.map(axis => {
      switch (axis.type) {
        case "value":
          return getValueAxis(axis, props.result, props.input);
        case "time":
          return getTimeAxis(axis, props.result, props.input);
        case "category":
          return getCategoryAxis(axis);
        default:
          return getCategoryAxis(axis);
      }
    });

    return {
      ...props.result,
      series: props.result.series.map(series => ({
        ...series,
        label: {
          ...series.label,
          formatter: (param: { dataIndex: number }) => {
            const seriesId = series.id.split(":")[0];

            // ⬢ NOTE — flatMap/find replaces nested for...of loops
            const seriesInput: Series | null =
              props.input.yAxes
                .flatMap(yAxis => yAxis.series)
                .find(s => s.id === seriesId) ?? null;

            const key = series.encode?.y ?? series.id.split(":").pop() ?? "";
            const value =
              props.result.dataset[series.datasetIndex]?.source[
                param.dataIndex
              ]?.[key];

            // ⬢ NOTE — guard against undefined value before passing to formatters
            if (value === undefined) return "";

            if (seriesInput?.column) {
              if (NumpyDateTypes.safeParse(seriesInput.column.type).success) {
                return formatDateTime(value, seriesInput.dateFormat);
              }
              if (
                NumpyNumberTypes.safeParse(seriesInput.column.type).success &&
                typeof value === "number" &&
                seriesInput.numberFormat
              ) {
                return formatNumber(value, seriesInput.numberFormat);
              }
            }

            return value;
          },
        },
      })),
      backgroundColor: "#fff",
      legend: {
        ...props.result.legend,
        padding: props.hasControls
          ? [28, 28, 0, 28]
          : [props.title ? 4 : 20, 28, 0, 8],
        type: "scroll",
        icon: "circle",
        textStyle: {
          padding: [0, 0, 0, -6],
          fontWeight: "bold",
          color: "#6b7280",
        },
        left: !props.hasControls ? 18 : "center",
      },
      grid,
      xAxis: xAxes.map(axis => axis.option),
      yAxis: props.result.yAxis.map((axis, i) => ({
        ...axis,
        axisLabel: {
          formatter: (value: string | number): string => {
            const format:
              | null
              | { _tag: "date"; format: DateFormat }
              | { _tag: "number"; format: NumberFormat } =
              props.input.yAxes[i]?.series
                .map(s => {
                  if (!s.column) {
                    return null;
                  }

                  if (NumpyDateTypes.safeParse(s.column.type).success) {
                    if (s.dateFormat) {
                      return { _tag: "date" as const, format: s.dateFormat };
                    }
                  }

                  if (NumpyNumberTypes.safeParse(s.column.type).success) {
                    if (s.numberFormat) {
                      return {
                        _tag: "number" as const,
                        format: s.numberFormat,
                      };
                    }
                  }

                  return null;
                })
                .find(f => f !== null) ?? null;

            if (!format) {
              return value.toString();
            }

            if (typeof value === "number" && format._tag === "number") {
              return formatNumber(value, format.format);
            }

            if (format._tag === "date") {
              return formatDateTime(value, format.format);
            }

            return value.toString();
          },
        },
      })),
      tooltip: {
        ...props.result.tooltip,
        formatter(params) {
          // ⬢ NOTE — avoid no-param-reassign by creating a local copy
          const paramList = Array.isArray(params) ? params : [params];
          const first = paramList[0];
          if (!first || !props.input.xAxis?.name) {
            return "";
          }
          const rowIdx = first.dataIndex;
          // ⬢ NOTE — xAxis.name and dataset source value may be undefined
          const xAxisName = props.input.xAxis.name;
          const xValue = props.result.dataset[0]?.source[rowIdx]?.[xAxisName];
          const xFormatted = (() => {
            const axis = head(xAxes);
            if (!axis) {
              return xValue;
            }

            switch (axis._tag) {
              case "value":
                return xValue !== undefined
                  ? formatNumberAxis(xValue, props.input.xAxisNumberFormat, {
                      min: axis.min,
                      max: axis.max,
                    })
                  : "";
              case "time":
                return xValue !== undefined
                  ? formatDateTimeAxis(xValue, props.input.xAxisDateFormat, {
                      min: axis.min,
                      max: axis.max,
                      hideDay: axis.hideDay,
                      minIntervalUnit: "year",
                    })
                  : "";
              case "category":
                return xValue ?? "";
              default:
                return xValue ?? "";
            }
          })();

          // ⬢ NOTE — replaced nested for...of loops with reduce + flatMap.
          // counter limits total tooltip rows to 15 across all series.
          let counter = 0;
          const yValues = paramList.reduce<string>((acc, param, i) => {
            if (counter > 15) return acc;

            const dataset = props.result.dataset[i];
            const row = dataset?.source[param.dataIndex] ?? {};

            const rowHtml = Object.entries(row)
              .filter(
                ([key, value]) =>
                  key !== props.input.xAxis?.name && value !== 0 && value !== ""
              )
              .map(([key, value]) => {
                if (counter > 15) return "";

                const seriesInput: Series | null =
                  props.input.yAxes
                    .flatMap(yAxis => yAxis.series)
                    .find(series => series.id === key) ?? null;

                let formattedValue: unknown = value;
                if (seriesInput?.column) {
                  if (
                    NumpyDateTypes.safeParse(seriesInput.column.type).success
                  ) {
                    formattedValue = formatDateTime(
                      value as string | number,
                      seriesInput.dateFormat
                    );
                  } else if (
                    NumpyNumberTypes.safeParse(seriesInput.column.type)
                      .success &&
                    typeof value === "number" &&
                    seriesInput.numberFormat
                  ) {
                    formattedValue = formatNumber(
                      value,
                      seriesInput.numberFormat
                    );
                  }
                }

                counter += 1;
                return `<div class="font-body" style="display: flex; align-items: center; justify-content: space-between; gap: 20px;  ">
                  <div>${param.marker ?? ""}${param.seriesName ?? key}</div>
                  <div>${formattedValue}</div>
                </div>`;
              })
              .join("");

            return acc + rowHtml;
          }, "");

          return `
            <div>
              ${xFormatted}
              <div>${yValues}</div>
            </div>
          `;
        },
      },
    };
  }, [props.result, props.input, props.hasControls, props.title]);

  if (!size) {
    return <div className="w-full h-full" ref={measureDiv} />;
  }

  if (props.input.chartType === "trend" || props.input.chartType === "number") {
    return (
      <div ref={container} className="ph-no-capture h-full">
        <BigNumberVisualization
          title={props.title}
          chartType={props.input.chartType}
          input={props.input}
          result={props.result}
          size={size}
        />
      </div>
    );
  }

  return (
    <div ref={container} className="ph-no-capture h-full">
      <Echarts width={size.width} height={size.height} option={option} />
    </div>
  );
}

// =====================================
// ⬢ Echarts
// =====================================
interface EchartsProps {
  width: number;
  height: number;
  option: echarts.EChartsOption;
}

function Echarts(props: EchartsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef<HTMLDivElement>(null);
  const [finalOption, setFinalOption] = useState(props.option);
  const [isReady, setIsReady] = useState(false);

  // First render in hidden div to calculate layout
  useEffect(() => {
    if (!hiddenRef.current) return () => {};

    const hiddenChart = echarts.init(hiddenRef.current, null, {
      renderer: "svg",
    });
    const hiddenChartOption = {
      ...props.option,
      animationDelay: 0,
      animationDuration: 1,
      xAxis: (props.option.xAxis
        ? Array.isArray(props.option.xAxis)
          ? props.option.xAxis
          : [props.option.xAxis]
        : []
      ).map(axis => ({
        ...axis,
        axisLabel: {
          ...axis.axisLabel,
          hideOverlap: false,
        },
      })),
    };

    hiddenChart.setOption(hiddenChartOption);

    const handleFinished = () => {
      const xAxes = Array.isArray(props.option.xAxis)
        ? props.option.xAxis
        : props.option.xAxis
          ? [props.option.xAxis]
          : [];
      let isRotated = false;
      const nextXAxes = xAxes.map(xAxis => {
        if (!xAxis || xAxis.type !== "category") {
          return xAxis;
        }

        const labels = hiddenChart.getZr().dom?.querySelectorAll("text") ?? [];
        let hasOverlap = false;

        // ⬢ NOTE — guarding labels[i] and labels[i+1] against undefined
        // before calling getBoundingClientRect to avoid TS2532.
        for (let i = 0; i < labels.length - 1; i++) {
          const label1 = labels[i];
          const label2 = labels[i + 1];
          if (label1 && label2) {
            const rect1 = label1.getBoundingClientRect();
            const rect2 = label2.getBoundingClientRect();
            if (
              rect1.right > rect2.left &&
              rect1.left < rect2.right &&
              rect1.bottom > rect2.top &&
              rect1.top < rect2.bottom
            ) {
              hasOverlap = true;
              break;
            }
          }
        }

        if (hasOverlap) {
          isRotated = true;
          return {
            ...xAxis,
            axisLabel: {
              ...xAxis.axisLabel,
              rotate: 45,
            },
          };
        }
        return xAxis;
      });

      setFinalOption({
        ...props.option,
        xAxis: nextXAxes,
        grid: props.option.grid
          ? Array.isArray(props.option.grid)
            ? props.option.grid.map(grid => ({
                ...grid,
                left: isRotated ? "60" : grid.left,
              }))
            : {
                ...props.option.grid,
                left: isRotated ? "60" : props.option.grid.left,
              }
          : isRotated
            ? { left: "60" }
            : undefined,
      });
      setIsReady(true);
      hiddenChart.dispose();
    };

    hiddenChart.on("finished", handleFinished);

    return () => {
      hiddenChart.dispose();
    };
  }, [props.option]);

  // Only render the visible chart once we have the final layout
  useEffect(() => {
    if (!ref.current || !isReady) {
      return () => {};
    }

    const chart = echarts.init(ref.current, null, {
      renderer: "canvas",
      width: props.width,
      height: props.height,
    });
    chart.setOption(finalOption);

    return () => {
      chart.dispose();
    };
  }, [ref.current, isReady, finalOption]);

  return (
    <>
      <div
        ref={hiddenRef}
        className="w-full h-full"
        style={{
          position: "absolute",
          visibility: "hidden",
          pointerEvents: "none",
        }}
      />
      {isReady && (
        <div ref={ref} className="w-full h-full rounded-md overflow-hidden" />
      )}
    </>
  );
}

// =====================================
// ⬢ BigNumberVisualization
// =====================================
function BigNumberVisualization(props: {
  title: string;
  input: VisualizationV2BlockInput;
  chartType: "number" | "trend";
  result: VisualizationV2BlockOutputResult;
  size: { width: number; height: number };
}) {
  const { size } = props;

  try {
    const y = head(head(props.input.yAxes)?.series ?? [])?.id;
    if (!y) {
      throw new Error("Invalid input");
    }

    const x = props.input.xAxis?.name?.toString() ?? y;
    const isDateColumn = props.input.xAxis?.type
      ? NumpyDateTypes.safeParse(props.input.xAxis.type).success
      : false;

    const latests = head(props.result.dataset)?.source.slice(-2);
    const latest = latests?.pop();
    const prev = latests?.pop();

    if (!latest) {
      throw new Error("Invalid result");
    }

    const rawY = latest[y];
    let displayY = rawY !== undefined ? String(rawY) : "";
    if (
      typeof rawY === "number" &&
      props.input.yAxes[0]?.series[0]?.numberFormat
    ) {
      displayY = formatNumber(
        rawY,
        props.input.yAxes[0].series[0].numberFormat
      );
    }

    const rawX = latest[x];
    let lastDisplayX = rawX !== undefined ? String(rawX) : "";
    if (props.input.xAxisDateFormat && isDateColumn && rawX !== undefined) {
      lastDisplayX = formatDateTime(rawX, props.input.xAxisDateFormat);
    }

    const lastValue = {
      x: latest[x],
      displayX: lastDisplayX,
      y: rawY !== undefined ? Number(rawY) : Number.NaN,
      displayY,
    };

    let prevDisplayY = "N/A";
    if (prev) {
      prevDisplayY = prev[y]?.toString() ?? "N/A";

      if (
        typeof prev[y] === "number" &&
        props.input.yAxes[0]?.series[0]?.numberFormat
      ) {
        prevDisplayY = formatNumber(
          prev[y],
          props.input.yAxes[0]?.series[0]?.numberFormat
        );
      }
    }

    let prevDisplayX = prev?.[x] ? String(prev[x]) : "N/A";
    if (props.input.xAxisDateFormat && isDateColumn && prev) {
      const prevXVal = prev[x];
      if (prevXVal !== undefined) {
        prevDisplayX = formatDateTime(prevXVal, props.input.xAxisDateFormat);
      }
    }

    const prevValue = {
      x: prev?.[x]?.toString(),
      displayX: prevDisplayX,
      y: prev?.[y] ? Number(prev[y]) : Number.NaN,
      displayY: prevDisplayY,
    };

    const minDimension = Math.min(size.width, size.height);
    const fontSize = Math.min(
      Math.max(
        8,
        Math.min(
          findMaxFontSize(
            lastValue.displayY.toString(),
            minDimension / 3,
            size.width - 32,
            "bold",
            FONT_FAMILY
          ),
          100
        )
      )
    );

    const lastXValueFontSize = Math.max(fontSize / 4, 12);
    const prevYValueFontSize = Math.max(lastXValueFontSize * 0.9, 10);

    let trend = lastValue.y === prevValue.y ? 0 : lastValue.y / prevValue.y - 1;
    if (prevValue.y !== lastValue.y) {
      if (prevValue.y === 0) {
        trend = Infinity;
      } else if (lastValue.y === 0) {
        trend = -1;
      }
    }

    let trendDisplay = d3Format(".2%")(Math.abs(trend));
    if (trend === 0) {
      trendDisplay = "No change";
    } else if (Number.isNaN(trend)) {
      trendDisplay = "N/A";
    } else if (trend === Infinity) {
      trendDisplay = "∞%";
    }

    const lastXValueFits = minDimension > 200;

    const trendWidth =
      measureText(`↑ ${trendDisplay}`, prevYValueFontSize, "500", FONT_FAMILY)
        .width + 4;

    const prevXValueWidth = measureText(
      `• vs. ${prevValue.displayX}`,
      prevYValueFontSize,
      "500",
      FONT_FAMILY
    ).width;

    const prevYValueWidth = measureText(
      `: ${prevValue.displayY}`,
      (fontSize / 4) * 0.9,
      "500",
      FONT_FAMILY
    ).width;

    const prevYValueFits =
      size.width - 32 > prevYValueWidth + prevXValueWidth + trendWidth;

    const prevXValueFits = size.width - 32 > prevXValueWidth + trendWidth;

    const arrowSize =
      !prevXValueFits && !lastXValueFits
        ? Math.min(prevYValueFontSize * 1.8, size.height - fontSize * 1.3 - 32)
        : prevYValueFontSize;

    return (
      <div className="flex flex-col h-full py-2 px-4">
        <div className="flex flex-col justify-center items-center text-center h-full overflow-hidden">
          <h1
            className="font-bold text-neutral-800"
            style={{ fontSize, lineHeight: `${fontSize + 6}px` }}
          >
            {lastValue.displayY}
          </h1>
          {props.chartType === "trend" && (
            <>
              {lastXValueFits && (
                <h3
                  className="text-neutral-600 font-medium"
                  style={{ fontSize: lastXValueFontSize }}
                >
                  {lastValue.displayX}
                </h3>
              )}
              <div
                className="flex justify-center font-medium text-nowrap"
                style={{ fontSize: prevYValueFontSize }}
              >
                <div
                  className={clsx(
                    {
                      "text-red-500": trend < 0,
                      "text-green-500": trend > 0,
                      "text-sky-500": trend === 0,
                    },
                    "flex items-center"
                  )}
                  style={{
                    fontSize:
                      !prevXValueFits && !lastXValueFits
                        ? Math.min(
                            prevYValueFontSize * 1.8,
                            size.height - fontSize * 1.3 - 32
                          )
                        : prevYValueFontSize,
                  }}
                >
                  {trend === 0 || Number.isNaN(trend) ? null : trend < 0 ? (
                    <ArrowLongDownIcon
                      style={{ height: arrowSize, width: arrowSize }}
                    />
                  ) : (
                    <ArrowLongUpIcon
                      style={{ height: arrowSize, width: arrowSize }}
                    />
                  )}
                  <span>{trendDisplay}</span>
                </div>
                {prevXValueFits && (
                  <>
                    <span className="text-neutral-400 px-1">•</span>
                    <h4 className="text-neutral-500">
                      vs. {prevValue.displayX}
                      {prevYValueFits && (
                        <>
                          :
                          <span className="text-neutral-400">
                            {" "}
                            {prevValue.displayY}
                          </span>
                        </>
                      )}
                    </h4>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  } catch (err) {
    console.error(err);
    return null;
  }
}
// =====================================
// ⬢ getValuesMinInterval
// =====================================
function getValuesMinInterval(xValues: number[]): number {
  if (xValues.length === 0) {
    return 0;
  }

  let minDiff = Infinity;

  for (let i = 0; i < xValues.length - 1; i++) {
    const a = xValues[i]!;
    const b = xValues[i + 1]!;
    // ⬢ NOTE — no-continue: inverted condition instead of continue
    if (a !== b) {
      const diff = Math.abs(a - b);
      if (diff < minDiff) {
        minDiff = diff;
      }
    }
  }

  return minDiff;
}

// =====================================
// ⬢ getValueAxis
// =====================================
function getValueAxis(
  axis: XAxis,
  result: VisualizationV2BlockOutputResult,
  input: VisualizationV2BlockInput
) {
  let interval: "auto" | number = "auto";

  let min = -Infinity;
  let max = Infinity;
  const xFields = uniq(
    result.series
      .map(s => s.encode?.x)
      .filter((x): x is string | number => x !== undefined)
  );
  const values = result.dataset
    .flatMap(d => xFields.flatMap(f => d.source.flatMap(r => r[f.toString()])))
    .filter((v): v is number => typeof v === "number");

  if (values.length > 0) {
    interval = getValuesMinInterval(values);
    min = Math.min(...values);
    max = Math.max(...values);
  }

  return {
    _tag: "value" as const,
    min,
    max,
    option: {
      ...axis,
      axisLabel: {
        margin: 5,
        hideOverlap: true,
        formatter: (value: string | number): string =>
          formatNumberAxis(value, input.xAxisNumberFormat, { min, max }),
      },
      min: interval !== "auto" ? min - interval / 2 : "dataMin",
      max: interval !== "auto" ? max + interval / 2 : "dataMax",
      ...(interval !== "auto" ? { minInterval: interval } : {}),
      splitLine: { show: false },
    },
  };
}

// =====================================
// ⬢ getTimeAxis
// =====================================
function getTimeAxis(
  axis: XAxis,
  result: VisualizationV2BlockOutputResult,
  input: VisualizationV2BlockInput
) {
  const intervalOrder: { [_T in TimeUnit]: number } = {
    seconds: 0,
    minutes: 1,
    hours: 2,
    date: 3,
    week: 4,
    month: 5,
    quarter: 6,
    year: 7,
  };

  const xFields = result.series
    .map(s => s.encode?.x)
    .filter((x): x is string | number => x !== undefined);

  // ⬢ NOTE — filter out undefined values before constructing Date to avoid
  // passing undefined to new Date() which produces an invalid date silently.
  const values = result.dataset
    .flatMap(d =>
      xFields.flatMap(f =>
        d.source
          .map(r => r[f.toString()])
          .filter((v): v is string | number => v !== undefined)
          .map(v => new Date(v))
      )
    )
    .filter(date => dfns.isValid(date));

  // ⬢ NOTE — values[0] may be undefined if no valid dates found.
  // Default to epoch so min/max are always Date (not Date | undefined).
  let min: Date = values[0] ?? new Date(0);
  let max: Date = values[0] ?? new Date(0);
  let minIntervalUnit: TimeUnit = "year";

  for (let i = 0; i < values.length - 1; i++) {
    const a = values[i];
    const b = values[i + 1];
    // ⬢ NOTE — no-continue: inverted condition, skip invalid pairs
    if (a && b && dfns.isValid(a) && dfns.isValid(b)) {
      const intervalUnit = getIntervalUnit(a, b);

      if (intervalOrder[intervalUnit] < intervalOrder[minIntervalUnit]) {
        minIntervalUnit = intervalUnit;
      }

      min =
        a.getTime() < min.getTime() ? a : b.getTime() < min.getTime() ? b : min;
      max =
        a.getTime() > max.getTime() ? a : b.getTime() > max.getTime() ? b : max;
    }
  }

  const hideDay = values.every(v => {
    switch (minIntervalUnit) {
      case "year":
        return dfns.getDate(v) === 1 && dfns.getMonth(v) === 0;
      case "quarter":
        return dfns.getDate(v) === 1 && dfns.getMonth(v) % 3 === 0;
      case "month":
        return dfns.isFirstDayOfMonth(v);
      case "week":
      case "date":
      case "hours":
      case "minutes":
      case "seconds":
        return false;
      default:
        return false;
    }
  });

  const minInterval: number = (() => {
    switch (minIntervalUnit) {
      case "year":
        return 365 * 24 * 60 * 60 * 1000;
      case "quarter":
        return 91 * 24 * 60 * 60 * 1000;
      case "month":
        return 30 * 24 * 60 * 60 * 1000;
      case "week":
        return 7 * 24 * 60 * 60 * 1000;
      case "date":
        return 24 * 60 * 60 * 1000;
      case "hours":
        return 60 * 60 * 1000;
      case "minutes":
        return 60 * 1000;
      case "seconds":
        return 1000;
      default:
        return 0;
    }
  })();

  return {
    _tag: "time" as const,
    min,
    max,
    minInterval,
    hideDay,
    option: {
      ...axis,
      axisLabel: {
        margin: 5,
        hideOverlap: true,
        formatter: (value: string | number): string =>
          formatDateTimeAxis(value, input.xAxisDateFormat, {
            min,
            max,
            hideDay,
            minIntervalUnit,
          }),
        showMaxLabel: true,
        showMinLabel: true,
      },
      axisTick: { show: false },
      min: min.getTime() - minInterval / 2,
      max: max.getTime() + minInterval / 2,
      minInterval,
      splitLine: { show: false },
    },
  };
}

// =====================================
// ⬢ getIntervalUnit
// =====================================
function getIntervalUnit(a: Date, b: Date): TimeUnit {
  const years = Math.abs(dfns.differenceInYears(b, a));
  if (years >= 1) return "year";

  const months = Math.abs(dfns.differenceInMonths(b, a));
  if (months >= 3) return "quarter";
  if (months >= 1) return "month";

  const weeks = Math.abs(dfns.differenceInWeeks(b, a));
  if (weeks >= 1) return "week";

  const days = Math.abs(dfns.differenceInDays(b, a));
  if (days >= 1) return "date";

  const hours = Math.abs(dfns.differenceInHours(b, a));
  if (hours >= 1) return "hours";

  const minutes = Math.abs(dfns.differenceInMinutes(b, a));
  if (minutes >= 1) return "minutes";

  return "seconds";
}

// =====================================
// ⬢ getCategoryAxis
// =====================================
function getCategoryAxis(axis: XAxis) {
  return {
    _tag: "category" as const,
    option: {
      ...axis,
      axisLabel: {
        hideOverlap: true,
        interval: 0,
        formatter: (value: string | number): string => {
          if (typeof value === "number") {
            return value.toString();
          }
          return value.length > 20 ? `${value.slice(0, 20)}...` : value;
        },
      },
      splitLine: { show: false },
    },
  };
}

// =====================================
// ⬢ formatDateTime
// =====================================
function formatDateTime(
  value: string | number,
  format: DateFormat | null
): string {
  const asDate = new Date(value);

  let formatString = format?.dateStyle || "";

  if (format && format.showTime && format.timeFormat) {
    formatString = formatString
      ? `${formatString} ${format.timeFormat}`
      : format.timeFormat;
  }

  if (formatString) {
    return dfns.format(asDate, formatString);
  }

  return dfns.format(value, "MMMM d, yyyy");
}

// =====================================
// ⬢ formatDateTimeAxis
// =====================================
function formatDateTimeAxis(
  value: string | number,
  format: DateFormat | null,
  {
    min,
    max,
    hideDay,
    minIntervalUnit,
  }: { min: Date; max: Date; hideDay: boolean; minIntervalUnit: TimeUnit }
): string {
  const asDate = new Date(value);
  if (asDate < min || asDate > max) {
    return "";
  }

  if (format) {
    return formatDateTime(value, format);
  }

  switch (minIntervalUnit) {
    case "year":
      if (hideDay) {
        return dfns.format(value, "yyyy");
      }
      return dfns.format(value, "MMMM d, yyyy");
    case "quarter":
    case "month":
    case "week":
    case "date":
      if (hideDay) {
        return dfns.format(value, "MMMM yyyy");
      }
      return dfns.format(value, "MMMM d, yyyy");
    case "hours":
    case "minutes":
      return dfns.format(value, "MMMM d, yyyy, h:mm a");
    case "seconds":
      return dfns.format(value, "MMMM d, yyyy, h:mm:ss a");
    default:
      return "";
  }
}

// =====================================
// ⬢ formatNumber
// =====================================
function formatNumber(value: number, format: NumberFormat): string {
  try {
    let num = value;

    if (format.multiplier !== 1) {
      num *= format.multiplier;
    }

    let formatString = "";
    let isPercentage = false;
    let isScientific = false;

    switch (format.style) {
      case "percent":
        isPercentage = true;
        num *= 100;
        break;
      case "scientific":
        isScientific = true;
        break;
      case "normal":
        break;
      default:
        exhaustiveCheck(format.style);
    }

    if (Number.isInteger(num)) {
      formatString += ".0f";
    } else if (format.decimalPlaces <= 0) {
      formatString += ".0f";
    } else {
      formatString += `.${format.decimalPlaces}f`;
    }

    let formatted = (() => {
      if (isScientific) {
        const sciFormatted = num.toExponential(format.decimalPlaces);

        switch (format.separatorStyle) {
          case "999 999,99":
          case "999.999,99":
            return sciFormatted.replace(".", ",");
          case "999,999.99":
          case "999999.99":
            return sciFormatted;
          default:
            exhaustiveCheck(format.separatorStyle);
        }
      }

      switch (format.separatorStyle) {
        case "999 999,99": {
          const formattedStr = d3Format(`,${formatString}`)(num);
          const decimalPos = formattedStr.lastIndexOf(".");
          if (decimalPos === -1) {
            return formattedStr.replace(/,/g, " ");
          }
          const result = formattedStr.replace(/,/g, " ");
          return `${result.substring(0, decimalPos)},${result.substring(decimalPos + 1)}`;
        }
        case "999.999,99": {
          const formattedStr = d3Format(`,${formatString}`)(num);
          const decimalPos = formattedStr.lastIndexOf(".");
          if (decimalPos === -1) {
            return formattedStr.replace(/,/g, ".");
          }
          const result = formattedStr.replace(/,/g, ".");
          return `${result.substring(0, decimalPos)},${result.substring(decimalPos + 1)}`;
        }
        case "999,999.99":
          return d3Format(`,${formatString}`)(num);
        case "999999.99":
          return d3Format(formatString)(num);
        default:
          exhaustiveCheck(format.separatorStyle);
          return d3Format(formatString)(num);
      }
    })();

    if (isPercentage) {
      formatted += "%";
    }

    if (format.prefix) {
      formatted = format.prefix + formatted;
    }
    if (format.suffix) {
      formatted += format.suffix;
    }

    return formatted;
  } catch (err) {
    console.error("Error formatting number:", err);
    return value.toString();
  }
}

// =====================================
// ⬢ formatNumberAxis
// =====================================
function formatNumberAxis(
  value: string | number,
  format: NumberFormat | null,
  { min, max }: { min: number; max: number }
): string {
  if (typeof value === "number" && (value < min || value > max)) {
    return "";
  }

  if (format && typeof value === "number") {
    return formatNumber(value, format);
  }

  return value.toString();
}

export default VisualizationViewV2;
