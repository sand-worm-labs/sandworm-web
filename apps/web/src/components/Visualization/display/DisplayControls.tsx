import type { Serie, VisualizationV2BlockOutputResult } from "@sandworm/editor";
import type { DataFrame, Series, YAxis } from "@sandworm/types";
import { Transition } from "@headlessui/react";
import clsx from "clsx";
import { GripVerticalIcon } from "lucide-react";
import { uniqBy } from "ramda";
import type { CSSProperties } from "react";
import { forwardRef, useCallback, useMemo, useRef, useState } from "react";
import { SketchPicker } from "react-color";
import type {
  ConnectDragPreview,
  ConnectDragSource,
  ConnectDropTarget,
} from "react-dnd";
import ReactDOM from "react-dom";

import { useOnClickOutside2 } from "@/hooks/useOnClickOutside";
import useResizeMemo from "@/hooks/useResizeMemo";

import DragList from "../DragList";

// =====================================
// ⬢ Constants
// =====================================
const presetColors = [
  "#A308F0",
  "#91cc75",
  "#fac858",
  "#ee6666",
  "#73c0de",
  "#3ba272",
  "#fc8452",
  "#9a60b4",
  "#ea7ccc",
  "#879bd7",
  "#b2db9e",
  "#fbd88a",
  "#f39494",
  "#9dd3e8",
  "#ffffff",
  "#000000",
];

const FALLBACK_COLOR = "#A308F0";

// =====================================
// ⬢ Types
// =====================================
interface Props {
  yAxes: YAxis[];
  dataframe: DataFrame | null;
  isEditable: boolean;
  result: VisualizationV2BlockOutputResult | null;
  onChangeSeries: (id: Series["id"], series: Series) => void;
  onChangeAllSeries: (yIndex: number, series: Series[]) => void;
}

interface ColorPickerProps {
  color: string;
  className?: string;
  onChangeColor: (color: string) => void;
}

interface GroupBySeriesDisplayProps {
  drag: ConnectDragSource;
  drop: ConnectDropTarget;
  dragPreview: ConnectDragPreview;
  isDragging: boolean;
  group: string;
  name: string;
  onChangeName: (group: string, name: string) => void;
  color: string;
  onChangeColor: (group: string, color: string) => void;
  dataframe: DataFrame | null;
  isEditable: boolean;
}

interface DisplayYAxisSeriesProps {
  drag: ConnectDragSource;
  drop: ConnectDropTarget;
  dragPreview: ConnectDragPreview;
  isDragging: boolean;
  series: Series;
  dataframe: DataFrame | null;
  isEditable: boolean;
  result: VisualizationV2BlockOutputResult | null;
  onChangeSeries: (id: Series["id"], series: Series) => void;
}

// =====================================
// ⬢ Utils
// =====================================
function getColorFromSerie(s: Serie): string | null {
  switch (s.type) {
    case "bar":
      return s.color ?? null;
    case "line":
      return s.lineStyle?.color ?? null;
    case "scatter":
      return s.itemStyle?.color ?? null;
    default:
      return null;
  }
}

// =====================================
// ⬢ ColorPicker
// =====================================
function ColorPicker(props: ColorPickerProps) {
  const onChangeColor = useCallback(
    (color: { hex: string }) => {
      props.onChangeColor(color.hex);
    },
    [props.onChangeColor]
  );

  const [pickerOpen, setPickerOpen] = useState(false);
  const onTogglePickerOpen = useCallback(() => {
    setPickerOpen(prev => !prev);
  }, []);

  const buttonRef = useRef<HTMLButtonElement>(null);

  const dropdownStyle: CSSProperties = useResizeMemo(
    rect => ({
      position: "absolute",
      top: rect?.bottom,
      left: rect?.left ?? 0,
      zIndex: 9001,
    }),
    buttonRef.current
  );

  const pickerContainerRef = useRef<HTMLDivElement>(null);
  useOnClickOutside2(
    () => {
      setPickerOpen(false);
    },
    pickerContainerRef,
    buttonRef,
    pickerOpen
  );

  return (
    <div className={props.className}>
      <button
        type="button"
        className="w-5 h-5 rounded-full border hover:opacity-90 transition-opacity duration-300"
        style={{ backgroundColor: props.color }}
        onClick={onTogglePickerOpen}
        ref={buttonRef}
      />
      {ReactDOM.createPortal(
        <Transition
          className="pt-2"
          show={pickerOpen}
          enter="transition-opacity duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          style={dropdownStyle}
          as="div"
          ref={pickerContainerRef}
        >
          <SketchPicker
            color={props.color}
            onChange={onChangeColor}
            presetColors={presetColors}
          />
        </Transition>,
        document.body
      )}
    </div>
  );
}

// =====================================
// ⬢ GroupBySeriesDisplay
// =====================================
const GroupBySeriesDisplay = forwardRef<
  HTMLDivElement,
  GroupBySeriesDisplayProps
>(function GroupBySeriesDisplay(props, ref) {
  const onChangeColor = useCallback(
    (newColor: string) => {
      props.onChangeColor(props.group, newColor);
    },
    [props.onChangeColor, props.group]
  );

  const onChangeName = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      props.onChangeName(props.group, e.target.value);
    },
    [props.onChangeName, props.group]
  );

  const onBlur = useCallback(() => {
    if (props.name.trim() === "") {
      props.onChangeName(props.group, props.group);
    }
  }, [props.group, props.name, props.onChangeName]);

  return (
    <div
      className={clsx(props.isDragging ? "opacity-50" : "opacity-100")}
      ref={d => {
        props.drop(d);
      }}
    >
      <div className="flex items-center space-x-1 pl-1" ref={ref}>
        <div
          className="text-ink-400/60 hover:text-ink-400 cursor-pointer"
          ref={el => {
            props.drag(el);
          }}
        >
          <GripVerticalIcon />
        </div>
        <div
          className="relative w-full group"
          ref={el => {
            props.dragPreview(el);
          }}
        >
          <input
            type="text"
            placeholder={props.group}
            className="w-full border-0 rounded-md ring-1 ring-inset ring-gray-200 focus:ring-1 focus:ring-inset focus:ring-blue-300 bg-white pr-2.5 pl-10 text-gray-800 text-xs placeholder:text-ink-400 relative"
            disabled={!props.dataframe || !props.isEditable}
            value={props.name}
            onChange={onChangeName}
            onBlur={onBlur}
          />
          <div className="absolute left-2 top-1/2 leading-[0px] transform -translate-y-1/2">
            <ColorPicker color={props.color} onChangeColor={onChangeColor} />
          </div>
        </div>
      </div>
    </div>
  );
});

// =====================================
// ⬢ DisplayYAxisSeries
// =====================================
const DisplayYAxisSeries = forwardRef<HTMLDivElement, DisplayYAxisSeriesProps>(
  function DisplayYAxisSeries(props, ref) {
    const groups = useMemo(
      () =>
        uniqBy(
          g => g.group,
          (props.series.groups ?? []).concat(
            props.result?.series
              .filter(
                s => s.id !== props.series.id && s.id.includes(props.series.id)
              )
              .map(s => {
                const group = s.id.split(":").slice(1).join(":");
                return {
                  group,
                  name: s.name?.toString() ?? group,
                  color: getColorFromSerie(s) ?? FALLBACK_COLOR,
                };
              }) ?? []
          )
        ),
      [props.series.groups, props.result?.series, props.series.id]
    );

    const onChangeGroups = useCallback(
      (newGroups: Series["groups"]) => {
        props.onChangeSeries(props.series.id, {
          ...props.series,
          groups: newGroups,
        });
      },
      [props.series.id, props.onChangeSeries]
    );

    const columnsSeries = props.result?.series.find(
      s => s.id === props.series.id
    );

    const color: string =
      props.series.color ??
      (columnsSeries ? getColorFromSerie(columnsSeries) : null) ??
      FALLBACK_COLOR;

    const onChangeColor = useCallback(
      (newColor: string) => {
        props.onChangeSeries(props.series.id, {
          ...props.series,
          color: newColor,
        });
      },
      [props.series.id, props.onChangeSeries]
    );

    const onChangeSerieName = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        props.onChangeSeries(props.series.id, {
          ...props.series,
          name: e.target.value,
        });
      },
      [props.series.id, props.onChangeSeries]
    );

    const onBlur = useCallback(() => {
      if (props.series.name?.trim() === "") {
        props.onChangeSeries(props.series.id, {
          ...props.series,
          name: props.series.column?.name?.toString() ?? "",
        });
      }
    }, [props.series, props.onChangeSeries]);

    const onChangeGroupName = useCallback(
      (group: string, name: string) => {
        const newItems = groups.map(item =>
          item.group === group ? { ...item, name } : item
        );
        onChangeGroups(newItems);
      },
      [groups, onChangeGroups]
    );

    const onChangeGroupColor = useCallback(
      (group: string, newColor: string) => {
        const newItems = groups.map(item =>
          item.group === group ? { ...item, color: newColor } : item
        );
        onChangeGroups(newItems);
      },
      [groups, onChangeGroups]
    );

    if (!props.series.column) {
      return null;
    }

    return (
      <div
        className="rounded-md border border-border-secondary shadow-sm px-2 py-3.5 bg-gray-50"
        ref={d => {
          props.dragPreview(props.drop(d));
        }}
      >
        <div
          ref={ref}
          className={clsx(props.isDragging ? "opacity-30" : "opacity-100")}
        >
          <div className="flex items-center">
            <div
              className="text-ink-400/60 hover:text-ink-400 cursor-grab"
              ref={el => {
                props.drag(el);
              }}
            >
              <GripVerticalIcon />
            </div>
            <div className="w-full relative">
              <input
                type="text"
                placeholder={props.series.column?.name?.toString() ?? ""}
                className="w-full border-0 rounded-md ring-1 ring-inset ring-gray-200 focus:ring-1 focus:ring-inset focus:ring-blue-300 group pr-2.5 pl-10 text-gray-800 text-xs placeholder:text-ink-400 relative bg-white disabled:cursor-not-allowed disabled:bg-gray-50"
                disabled={
                  !props.dataframe ||
                  !props.isEditable ||
                  props.series.groupBy !== null
                }
                value={props.series.name ?? ""}
                onChange={onChangeSerieName}
                onBlur={onBlur}
              />
              <div className="absolute left-2 top-1/2 leading-[0px] transform -translate-y-1/2 cursor-pointer">
                <ColorPicker
                  className=""
                  color={color}
                  onChangeColor={onChangeColor}
                />
              </div>
            </div>
          </div>
          {props.series.groupBy && !props.isDragging && (
            <>
              <div className="text-xs text-ink-100 pl-2 pt-4 pb-2 flex items-center justify-between">
                <span className="font-medium">Group by</span>
              </div>
              <div className="flex flex-col space-y-1.5">
                <DragList
                  items={groups}
                  onChange={onChangeGroups}
                  getKey={g => g.group}
                  kind={`series-${props.series.id}-groups`}
                >
                  {({
                    item,
                    drag,
                    dragPreview,
                    drop,
                    isDragging,
                    ref: itemRef,
                  }) => (
                    <GroupBySeriesDisplay
                      ref={itemRef}
                      drag={drag}
                      dragPreview={dragPreview}
                      drop={drop}
                      isDragging={isDragging}
                      group={item.group}
                      name={item.name}
                      onChangeName={onChangeGroupName}
                      color={item.color}
                      onChangeColor={onChangeGroupColor}
                      dataframe={props.dataframe}
                      isEditable={props.isEditable}
                    />
                  )}
                </DragList>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
);

// =====================================
// ⬢ DisplayControls
// =====================================
function DisplayControls(props: Props) {
  return (
    <div className="text-xs text-ink-400 flex flex-col space-y-8">
      {props.yAxes.map((yAxis, yI) => {
        let prefix = "";
        if (props.yAxes.length > 1) {
          prefix = yI === 0 ? "Left " : "Right ";
        }

        const items = yAxis.series.map(s => {
          const output = props.result?.series.find(rs => rs.id === s.id);
          return {
            ...s,
            color:
              s.color ?? (output ? getColorFromSerie(output) : null) ?? null,
          };
        });

        return (
          <div key={yAxis.id}>
            <div className="text-sm font-medium leading-6 text-ink-100 pb-2">
              {prefix} Y-Axis
            </div>
            <div className="flex flex-col space-y-4">
              <DragList
                items={items}
                onChange={newSeries => props.onChangeAllSeries(yI, newSeries)}
                getKey={s => s.id}
                kind={`y-axis-${yI}-series`}
              >
                {({
                  item,
                  drag,
                  dragPreview,
                  drop,
                  isDragging,
                  ref: itemRef,
                }) => (
                  <DisplayYAxisSeries
                    ref={itemRef}
                    drag={drag}
                    dragPreview={dragPreview}
                    drop={drop}
                    isDragging={isDragging}
                    series={item}
                    dataframe={props.dataframe}
                    isEditable={props.isEditable}
                    result={props.result}
                    onChangeSeries={props.onChangeSeries}
                  />
                )}
              </DragList>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default DisplayControls;
