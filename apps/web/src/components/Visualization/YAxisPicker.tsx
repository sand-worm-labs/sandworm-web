import type {
  ChartType,
  DataFrame,
  DataFrameColumn,
  YAxis,
  Series,
} from "@sandworm/types";
import {
  AggregateFunction,
  NumpyNumberTypes,
  NumpyTimeDeltaTypes,
  DataFrameNumberColumn,
  DataFrameDateColumn,
  DataFrameStringColumn,
  DataFrameBooleanColumn,
} from "@sandworm/types";
import { sortWith } from "ramda";
import { useCallback, useMemo } from "react";
import { createDefaultSeries } from "@sandworm/editor";

import ChartTypeSelector from "@/components/Editor/blocks/ChartTypeSelector";
import AxisSelector from "@/components/Editor/blocks/AxisSelector";
import AxisModifierSelector from "@/components/Editor/blocks/AxisModifierSelector";

interface Props {
  index: number;
  defaultChartType: ChartType;
  yAxis: YAxis;
  onChange: (yAxis: YAxis, i: number) => void;
  isEditable: boolean;
  dataframe: DataFrame | null;
  onRemove?: (i: number) => void;
  onAddYAxis?: () => void;
}

// =====================================
// ⬢ Utils
// =====================================
export function getAggFunction(
  series: Series,
  column: DataFrameColumn | null
): AggregateFunction {
  if (!column) {
    return series.aggregateFunction ?? "sum";
  }

  if (NumpyNumberTypes.safeParse(column.type).success) {
    return series.aggregateFunction ?? "sum";
  }

  return "count";
}

// =====================================
// ⬢ YAxisPicker
// =====================================
function YAxisPickerV2(props: Props) {
  const onChangeColumn = useCallback(
    (column: DataFrameColumn | null, index: number) => {
      props.onChange(
        {
          ...props.yAxis,
          series: props.yAxis.series.map((s, i) =>
            i === index
              ? {
                  ...s,
                  column,
                  aggregateFunction: getAggFunction(s, column),
                }
              : s
          ),
        },
        props.index
      );
    },
    [props.onChange, props.index]
  );

  const onChangeAggregateFunction = useCallback(
    (aggregateFunction: string, index: number) => {
      const func = AggregateFunction.safeParse(aggregateFunction);
      if (func.success) {
        props.onChange(
          {
            ...props.yAxis,
            series: props.yAxis.series.map((s, i) =>
              i === index ? { ...s, aggregateFunction: func.data } : s
            ),
          },
          props.index
        );
      }
    },
    [props.onChange, props.yAxis, props.index]
  );

  const onChangeGroupBy = useCallback(
    (colorBy: string | null, index: number) => {
      const column =
        props.dataframe?.columns.find(c => c.name.toString() === colorBy) ??
        null;
      props.onChange(
        {
          ...props.yAxis,
          series: props.yAxis.series.map((s, i) =>
            i === index ? { ...s, groupBy: column } : s
          ),
        },
        props.index
      );
    },
    [props.onChange, props.yAxis, props.dataframe, props.index]
  );

  const onRemoveSerie = useCallback(
    (index: number) => {
      props.onChange(
        {
          ...props.yAxis,
          series: props.yAxis.series.filter((_, i) => i !== index),
        },
        props.index
      );

      if (props.onRemove && props.yAxis.series.length === 1) {
        props.onRemove(props.index);
      }
    },
    [props.onChange, props.yAxis, props.index, props.onRemove]
  );

  const onAddSerie = useCallback(() => {
    props.onChange(
      {
        ...props.yAxis,
        series: [...props.yAxis.series, createDefaultSeries()],
      },
      props.index
    );
  }, [props.onChange, props.yAxis, props.index]);

  const onChartTypeChange = useCallback(
    (chartType: ChartType | null, index: number) => {
      props.onChange(
        {
          ...props.yAxis,
          series: props.yAxis.series.map((s, i) =>
            i === index ? { ...s, chartType } : s
          ),
        },
        props.index
      );
    },
    [props.onChange, props.yAxis, props.index]
  );

  const columns = useMemo(
    () =>
      (props.dataframe?.columns ?? []).filter(c =>
        props.defaultChartType === "trend" ||
        props.defaultChartType === "number"
          ? NumpyNumberTypes.safeParse(c.type).success
          : true
      ),
    [props.dataframe, props.defaultChartType]
  );

  const defaultValues = useMemo(
    () =>
      sortWith(
        [
          (a, b) => {
            const aIsNumber = DataFrameNumberColumn.safeParse(a).success;
            const bIsNumber = DataFrameNumberColumn.safeParse(b).success;
            if (aIsNumber === bIsNumber) return 0;
            return aIsNumber ? -1 : 1;
          },
          (a, b) => {
            const aIsDate = DataFrameDateColumn.safeParse(a).success;
            const bIsDate = DataFrameDateColumn.safeParse(b).success;
            if (aIsDate === bIsDate) return 0;
            return aIsDate ? -1 : 1;
          },
          (a, b) => {
            const aIsBoolean = DataFrameBooleanColumn.safeParse(a).success;
            const bIsBoolean = DataFrameNumberColumn.safeParse(b).success; // ⬢ Note: this looks like a bug?
            if (aIsBoolean === bIsBoolean) return 0;
            return aIsBoolean ? -1 : 1;
          },
          (a, b) => {
            const aIsString = DataFrameStringColumn.safeParse(a).success;
            const bIsString = DataFrameStringColumn.safeParse(b).success;
            if (aIsString === bIsString) return 0;
            return aIsString ? -1 : 1;
          },
          (a, b) => {
            const aHasId = a.name.toString().toLowerCase().includes("id");
            const bHasId = b.name.toString().toLowerCase().includes("id");
            if (aHasId && !bHasId) return 1;
            if (!aHasId && bHasId) return -1;
            return 0;
          },
        ],
        columns
      ),
    [columns]
  );

  return (
    <div>
      <div className="flex justify-between items-end pb-1">
        {props.defaultChartType !== "trend" &&
          props.defaultChartType !== "number" &&
          props.defaultChartType !== "pie" && (
            <div className="text-md font-medium leading-6 text-ink-100">
              {props.onAddYAxis ? "" : props.index === 0 ? "Left" : "Right"}{" "}
              Y-Axis
            </div>
          )}
        {props.onAddYAxis && (
          <button
            type="button"
            className="text-[10px] text-ink-400 underline pb-0.5 hover:text-ink-400 "
            onClick={props.onAddYAxis}
          >
            Add Y-Axis
          </button>
        )}
      </div>
      <div className="flex flex-col space-y-6">
        {props.yAxis.series
          .slice(
            0,
            props.defaultChartType === "trend" ||
              props.defaultChartType === "number" ||
              props.defaultChartType === "pie"
              ? 1
              : undefined
          )
          .map((s, i) => (
            <div key={s.column ? `${s.column.name}-${i}` : `series-${i}`}>
              <div className="flex space-x-1 items-end relative group">
                <div className="w-full">
                  <AxisSelector
                    label={
                      props.defaultChartType === "trend"
                        ? "Primary number"
                        : props.defaultChartType === "number"
                          ? "Number"
                          : `Series ${i + 1}`
                    }
                    value={s.column}
                    columns={columns}
                    onChange={c => onChangeColumn(c, i)}
                    disabled={!props.dataframe || !props.isEditable}
                    defaultValue={
                      defaultValues[i % defaultValues.length] ?? null
                    }
                  />
                </div>

                {(props.yAxis.series.length > 1 || props.onRemove) && (
                  <button
                    type="button"
                    className="flex items-center jutify-center cursor-pointer text-ink-400 hover:text-red-600 text-[10px] absolute top-1 right-1 underline"
                    onClick={() => onRemoveSerie(i)}
                  >
                    Remove
                  </button>
                )}
              </div>
              {props.defaultChartType !== "trend" &&
                props.defaultChartType !== "number" &&
                props.defaultChartType !== "pie" &&
                (props.yAxis.series.length > 1 ||
                  !props.onAddYAxis ||
                  (s.chartType && s.chartType !== props.defaultChartType)) && (
                  <ChartTypeSelector
                    value={s.chartType ?? props.defaultChartType}
                    label=""
                    onChange={t => onChartTypeChange(t, i)}
                    isEditable={props.isEditable}
                  />
                )}
              {s.column && (
                <div className="flex flex-col gap-y-1 pt-1.5 px-0.5">
                  <AxisModifierSelector
                    label="Aggregate"
                    value={s.aggregateFunction}
                    options={
                      NumpyNumberTypes.or(NumpyTimeDeltaTypes).safeParse(
                        s.column.type
                      ).success
                        ? [
                            { name: "Sum", value: "sum" },
                            { name: "Average", value: "mean" },
                            { name: "Median", value: "median" },
                            { name: "Min", value: "min" },
                            { name: "Max", value: "max" },
                            { name: "Count", value: "count" },
                          ]
                        : [{ name: "Count", value: "count" }]
                    }
                    onChange={agg => {
                      if (agg) {
                        onChangeAggregateFunction(agg, i);
                      }
                    }}
                    disabled={!props.dataframe || !props.isEditable}
                  />
                  {props.defaultChartType !== "trend" &&
                    props.defaultChartType !== "number" &&
                    props.defaultChartType !== "pie" && (
                      <AxisModifierSelector
                        label="Group by"
                        value={s.groupBy?.name.toString() ?? null}
                        options={[
                          { name: "None", value: null },
                          ...(props.dataframe?.columns ?? []).map(c => ({
                            name: c.name.toString(),
                            value: c.name.toString(),
                          })),
                        ]}
                        onChange={c => onChangeGroupBy(c, i)}
                        disabled={!props.dataframe || !props.isEditable}
                      />
                    )}
                </div>
              )}
            </div>
          ))}
      </div>
      {props.defaultChartType !== "trend" &&
        props.defaultChartType !== "number" &&
        props.defaultChartType !== "pie" &&
        (props.yAxis.series.length > 1 ||
          props.yAxis.series[0]?.column !== null) && (
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onAddSerie}
              className="text-[10px] text-ink-400 underline hover:text-ink-400 "
            >
              + Series
            </button>
          </div>
        )}
    </div>
  );
}

export default YAxisPickerV2;
