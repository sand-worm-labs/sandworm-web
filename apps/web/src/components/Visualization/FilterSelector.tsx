import type { ChangeEventHandler, EventHandler, SyntheticEvent } from "react";
import { useCallback, useState, useEffect, useMemo, useRef } from "react";
import type {
  DataFrameColumn,
  DataFrame,
  VisualizationFilter,
  InvalidReason,
} from "@sandworm/types";
import {
  VisualizationDateFilterOperator,
  VisualizationNumberFilterOperator,
  VisualizationStringFilterOperator,
  numberFilterOperators,
  stringFilterOperators,
  dateFilterOperators,
  VisualizationNumberFilter,
  VisualizationStringFilter,
  VisualizationDateFilter,
  toDate,
  NumpyNumberTypes,
  NumpyStringTypes,
  NumpyJsonTypes,
  NumpyDateTypes,
  NumpyBoolTypes,
  VisualizationStringFilterMultiValuesOperator,
  NumpyTimeDeltaTypes,
  getInvalidReason,
} from "@sandworm/types";
import { Transition } from "@headlessui/react";
import { InformationCircleIcon, XMarkIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { equals } from "ramda";
import ReactDOM from "react-dom";

import { Tooltip } from "../Editor/blocks/ToolTips";
import useDropdownPosition from "../Editor/hooks/dropdownposition";
import AxisSelector from "../Editor/blocks/AxisSelector";

import MultiComboboxV2 from "./MultiCombobox";
import Combobox from "./Combobox";

const preventPropagation: EventHandler<SyntheticEvent<Element>> = e => {
  e.stopPropagation();
};

function isNumberOperator(
  operator:
    | VisualizationNumberFilterOperator
    | VisualizationStringFilterOperator
    | VisualizationDateFilterOperator
): operator is VisualizationNumberFilterOperator {
  return VisualizationNumberFilterOperator.safeParse(operator).success;
}

function isStringOperator(
  operator:
    | VisualizationNumberFilterOperator
    | VisualizationStringFilterOperator
    | VisualizationDateFilterOperator
): operator is VisualizationStringFilterOperator {
  return VisualizationStringFilterOperator.safeParse(operator).success;
}

function isDateOperator(
  operator:
    | VisualizationNumberFilterOperator
    | VisualizationStringFilterOperator
    | VisualizationDateFilterOperator
): operator is VisualizationDateFilterOperator {
  return VisualizationDateFilterOperator.safeParse(operator).success;
}

function numberOperatorSymbol(
  operator: VisualizationNumberFilterOperator
): string {
  switch (operator) {
    case "eq":
      return "=";
    case "ne":
      return "!=";
    case "gt":
      return ">";
    case "lt":
      return "<";
    case "gte":
      return ">=";
    case "lte":
      return "<=";
    case "isNull":
      return "is null";
    case "isNotNull":
      return "is not null";
    default:
      throw new Error(`Unknown number operator: ${operator}`);
  }
}

function numberOperatorLabel(
  operator: VisualizationNumberFilterOperator
): string {
  switch (operator) {
    case "eq":
      return "Equals";
    case "ne":
      return "Not Equals";
    case "gt":
      return "Greater Than";
    case "lt":
      return "Less Than";
    case "gte":
      return "Greater Than or Equals";
    case "lte":
      return "Less Than or Equals";
    case "isNull":
      return "Is Null";
    case "isNotNull":
      return "Is Not Null";
    default:
      throw new Error(`Unknown number operator: ${operator}`);
  }
}

function stringOperatorSymbol(
  operator: VisualizationStringFilterOperator
): string {
  switch (operator) {
    case "eq":
      return "=";
    case "ne":
      return "!=";
    case "contains":
      return "contains";
    case "notContains":
      return "not contains";
    case "startsWith":
      return "starts with";
    case "endsWith":
      return "ends with";
    case "in":
      return "in";
    case "notIn":
      return "not in";
    case "isNull":
      return "is null";
    case "isNotNull":
      return "is not null";
    default:
      throw new Error(`Unknown string operator: ${operator}`);
  }
}

function stringOperatorLabel(
  operator: VisualizationStringFilterOperator
): string {
  switch (operator) {
    case "eq":
      return "Equals";
    case "ne":
      return "Not Equals";
    case "contains":
      return "Contains";
    case "notContains":
      return "Not Contains";
    case "startsWith":
      return "Starts With";
    case "endsWith":
      return "Ends With";
    case "in":
      return "In";
    case "notIn":
      return "Not In";
    case "isNull":
      return "Is Null";
    case "isNotNull":
      return "Is Not Null";
    default:
      throw new Error(`Unknown string operator: ${operator}`);
  }
}

function dateOperatorSymbol(operator: VisualizationDateFilterOperator): string {
  switch (operator) {
    case "eq":
      return "=";
    case "ne":
      return "!=";
    case "before":
      return "<";
    case "after":
      return ">";
    case "beforeOrEq":
      return "<=";
    case "afterOrEq":
      return ">=";
    case "isNull":
      return "is null";
    case "isNotNull":
      return "is not null";
    default:
      throw new Error(`Unknown date operator: ${operator}`);
  }
}

function dateOperatorLabel(operator: VisualizationDateFilterOperator): string {
  switch (operator) {
    case "eq":
      return "Equals";
    case "ne":
      return "Not Equals";
    case "before":
      return "Before";
    case "after":
      return "After";
    case "beforeOrEq":
      return "Before or Equals";
    case "afterOrEq":
      return "After or Equals";
    case "isNull":
      return "Is Null";
    case "isNotNull":
      return "Is Not Null";
    default:
      throw new Error(`Unknown date operator: ${operator}`);
  }
}

function getOperatorLabel(
  operator:
    | VisualizationStringFilterOperator
    | VisualizationNumberFilterOperator
    | VisualizationDateFilterOperator
): string {
  if (isNumberOperator(operator)) {
    return numberOperatorLabel(operator);
  }

  if (isStringOperator(operator)) {
    return stringOperatorLabel(operator);
  }

  return dateOperatorLabel(operator);
}

function searchOperator<
  T extends
    | VisualizationNumberFilterOperator
    | VisualizationStringFilterOperator
    | VisualizationDateFilterOperator,
>(options: T[], query: string): T[] {
  return options.filter(c => {
    if (isNumberOperator(c)) {
      return (
        numberOperatorLabel(c).toLowerCase().includes(query.toLowerCase()) ||
        numberOperatorSymbol(c).toLowerCase().includes(query.toLowerCase())
      );
    }

    if (isStringOperator(c)) {
      return (
        stringOperatorLabel(c).toLowerCase().includes(query.toLowerCase()) ||
        stringOperatorSymbol(c).toLowerCase().includes(query.toLowerCase())
      );
    }

    return (
      dateOperatorLabel(c).toLowerCase().includes(query.toLowerCase()) ||
      dateOperatorSymbol(c).toLowerCase().includes(query.toLowerCase())
    );
  });
}

function getOperatorOptions(columnType: DataFrameColumn["type"]) {
  if (NumpyNumberTypes.or(NumpyTimeDeltaTypes).safeParse(columnType).success) {
    return numberFilterOperators;
  }

  if (NumpyStringTypes.or(NumpyJsonTypes).safeParse(columnType).success) {
    return stringFilterOperators;
  }

  if (NumpyDateTypes.safeParse(columnType).success) {
    return dateFilterOperators;
  }

  // ✦ TODO: add filtering capabilities for boolean types
  if (NumpyBoolTypes.safeParse(columnType).success) {
    return [];
  }

  // ✦ TODO: this should never happen, we should be alerted
  return [];
}

type Operator =
  | VisualizationStringFilterOperator
  | VisualizationNumberFilterOperator
  | VisualizationDateFilterOperator;

interface Props {
  dataframe: Pick<DataFrame, "name" | "columns">;
  filter: VisualizationFilter;
  onChange: (filter: VisualizationFilter) => void;
  onRemove: (filter: VisualizationFilter) => void;
  isInvalid: boolean;
  disabled?: boolean;
}

function FilterValueLabel() {
  return (
    <div className="flex items-center justify-between">
      <label className="text-xs font-medium leading-6 text-ink-100">
        Value
      </label>
      <Tooltip
        title=""
        message="You can interpolate variables using {{ variable }}."
        active
        tooltipClassname="w-52"
      >
        <InformationCircleIcon className="w-4 h-4 text-gray-300" />
      </Tooltip>
    </div>
  );
}

function FilterSelectorV2({
  onRemove,
  filter,
  onChange,
  dataframe,
  isInvalid,
  disabled,
}: Props) {
  const HandleOnRemove = useCallback(() => {
    onRemove(filter);
  }, [onRemove, filter]);

  const [column, setColumn] = useState<DataFrameColumn | null>(filter.column);

  const [operator, setOperator] = useState<Operator | null>(filter.operator);

  let initialValue: string | string[] = "";

  if (Array.isArray(filter.value)) {
    initialValue = filter.value;
  } else if (filter.value != null) {
    initialValue = filter.value.toString();
  } else if (filter.operator && ["in", "notIn"].includes(filter.operator)) {
    initialValue = [];
  }

  const [value, setValue] = useState<string | string[]>(initialValue);

  // ✦ TODO: TEMPORARY FIX - Runtime validation removed
  // Previous implementation used Zod .safeParse() for runtime type validation
  // but was causing "keyValidator._parse is not a function" error due to
  // PythonErrorOutput schema issues (likely version mismatch or incorrect import)
  //
  const renderedValue = useMemo(() => {
    if ("renderedValue" in filter) {
      return filter.renderedValue;
    }
    return undefined;
  }, [filter]);

  const renderError = useMemo(() => {
    if ("renderError" in filter) {
      return filter.renderError;
    }
    return undefined;
  }, [filter]);

  const onChangeValue: ChangeEventHandler<HTMLInputElement> = useCallback(
    event => {
      setValue(event.target.value);
    },
    [setValue]
  );

  useEffect(() => {
    if (!column || !operator) {
      return;
    }

    if (
      NumpyNumberTypes.or(NumpyTimeDeltaTypes).safeParse(column.type).success
    ) {
      if (!isNumberOperator(operator)) {
        setOperator("eq");
      }
      return;
    }

    if (NumpyStringTypes.or(NumpyJsonTypes).safeParse(column.type).success) {
      if (!isStringOperator(operator)) {
        setOperator("eq");
      }
      return;
    }

    if (NumpyDateTypes.safeParse(column.type).success) {
      if (!isDateOperator(operator)) {
        setOperator("eq");
      }
    }
  }, [column, operator]);

  useEffect(() => {
    if (!column || !operator) {
      return () => {};
    }

    const didChange =
      !equals(filter.column, column) ||
      filter.operator !== operator ||
      !equals(filter.value, value);
    if (!didChange) {
      return () => {};
    }

    const timeout = setTimeout(() => {
      if (
        NumpyNumberTypes.or(NumpyTimeDeltaTypes).safeParse(column.type).success
      ) {
        if (isNumberOperator(operator)) {
          const filterV = VisualizationNumberFilter.safeParse({
            id: filter.id,
            column,
            operator,
            value: value.toString(),
          });
          if (filterV.success) {
            onChange(filterV.data);
            return;
          }
        }
      }

      if (NumpyStringTypes.or(NumpyJsonTypes).safeParse(column.type).success) {
        if (isStringOperator(operator)) {
          const filterV = VisualizationStringFilter.safeParse({
            id: filter.id,
            column,
            operator,
            value,
          });
          if (filterV.success) {
            onChange(filterV.data);
            return;
          }
        }
      }

      if (NumpyDateTypes.safeParse(column.type).success) {
        if (isDateOperator(operator)) {
          const filterV = VisualizationDateFilter.safeParse({
            id: filter.id,
            column,
            operator,
            value: toDate(value.toString())?.toISOString() ?? value,
          });
          if (filterV.success) {
            onChange(filterV.data);
            return;
          }
        }
      }

      onChange({
        type: "unfinished-visualization-filter",
        id: filter.id,
        column,
        operator,
        value,
      });
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [column, operator, value, filter.column, filter.operator, filter.value]);

  const invalidReason: InvalidReason | null = useMemo(() => {
    if (!isInvalid || !column || !operator) {
      return null;
    }

    const columnExists = dataframe.columns.some(c => c.name === column.name);
    if (!columnExists) {
      return { type: "simple", reason: "invalid-column" as const };
    }

    if (renderError) {
      return { type: "render", reason: renderError };
    }

    if (renderedValue) {
      return getInvalidReason(column, renderedValue);
    }

    if (value === "" || (Array.isArray(value) && value.length === 0)) {
      return { type: "simple", reason: "empty-value" as const };
    }

    return null;
  }, [
    isInvalid,
    column,
    operator,
    value,
    dataframe,
    renderedValue,
    renderError,
  ]);

  const onChangeOperator = useCallback(
    (newOp: Operator | null) => {
      const wasMultiValue =
        VisualizationStringFilterMultiValuesOperator.safeParse(
          operator
        ).success;
      const isMultiValue =
        VisualizationStringFilterMultiValuesOperator.safeParse(newOp).success;

      if (wasMultiValue && isMultiValue) {
        if (!Array.isArray(value)) {
          setValue(value === "" ? [] : [value]);
        }
      } else if (wasMultiValue && !isMultiValue) {
        if (Array.isArray(value)) {
          setValue(value[0] ?? "");
        }
      } else if (!wasMultiValue && isMultiValue) {
        if (typeof value === "string") {
          setValue(value === "" ? [] : [value]);
        }
      } else if (!wasMultiValue && !isMultiValue) {
        if (Array.isArray(value)) {
          setValue(value[0] ?? "");
        }
      }

      if (column && (newOp === "isNull" || newOp === "isNotNull")) {
        if (
          NumpyNumberTypes.or(NumpyTimeDeltaTypes).safeParse(column.type)
            .success
        ) {
          setValue("0");
        }

        if (
          NumpyStringTypes.or(NumpyJsonTypes).safeParse(column.type).success
        ) {
          setValue("filter");
        }

        if (NumpyDateTypes.safeParse(column.type).success) {
          setValue(new Date().toISOString());
        }
      }
      setOperator(newOp);
    },
    [operator, value]
  );

  const buttonRef = useRef<HTMLButtonElement>(null);
  const { onOpen, dropdownPosition } = useDropdownPosition(buttonRef);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) {
      return () => {};
    }

    const onClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        requestAnimationFrame(() => {
          if (event.defaultPrevented) return;
          setOpen(false);
        });
      }
    };

    document.addEventListener("click", onClickOutside);

    return () => {
      document.removeEventListener("click", onClickOutside);
    };
  }, [menuRef, open]);

  const onClickButton = useCallback(() => {
    if (!disabled) {
      onOpen();
      setOpen(true);
    }
  }, [disabled, onOpen]);

  return (
    <div className="relative text-xs group">
      {(() => {
        if (invalidReason) {
          if (invalidReason.type === "simple") {
            if (invalidReason.reason === "invalid-column") {
              return (
                <div className="w-64 font-body  pointer-events-none absolute -top-2 left-1/2 -translate-y-full -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100 bg-hunter-950 text-white text-xs p-2 rounded-md flex flex-col items-center justify-center gap-y-1">
                  <span className="text-center">
                    The selected column does not belong to the{" "}
                    <span className="font-mono">{dataframe.name}</span>{" "}
                    dataframe.
                  </span>
                </div>
              );
            }

            if (invalidReason.reason === "empty-value") {
              return (
                <div className="w-64 font-body  pointer-events-none absolute -top-2 left-1/2 -translate-y-full -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100 bg-hunter-950 text-white text-xs p-2 rounded-md flex flex-col items-center justify-center gap-y-1">
                  <span className="text-center">
                    The value for the selected column of type{" "}
                    <span className="font-mono">{column?.type}</span> cannot be
                    empty.
                  </span>
                </div>
              );
            }

            return (
              <div className="w-64 font-body  pointer-events-none absolute -top-2 left-1/2 -translate-y-full -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100 bg-hunter-950 text-white text-xs p-2 rounded-md flex flex-col items-center justify-center gap-y-1">
                <span className="text-center">
                  The value{" "}
                  <span className="font-mono">
                    {JSON.stringify(renderedValue ?? value)}
                  </span>{" "}
                  is invalid for the selected column of type{" "}
                  <span className="font-mono">{column?.type}</span>.
                </span>
              </div>
            );
          }

          //* ✦ complex type✦ */
          return (
            <div className="w-64 font-body  pointer-events-none absolute -top-2 left-1/2 -translate-y-full -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100 bg-hunter-950 text-white text-xs p-2 rounded-md flex flex-col items-center justify-center gap-y-1">
              <p>We received the following error:</p>
              <pre className="whitespace-pre-wrap pt-0.5">
                {invalidReason.reason.ename} - {invalidReason.reason.evalue}
              </pre>
            </div>
          );
        }

        if (renderedValue && renderedValue !== value) {
          return (
            <div className="w-72 font-body  pointer-events-none absolute -top-2 left-1/2 -translate-y-full -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100 bg-hunter-950 text-white text-xs p-2 rounded-md gap-y-1 text-center">
              This filter includes a Python value. The raw value is{" "}
              <span className="font-mono break-all">
                {Array.isArray(value)
                  ? value.length > 1
                    ? `[${value.map(v => JSON.stringify(v)).join(", ")}]`
                    : value[0]
                  : value}
              </span>
            </div>
          );
        }

        return null;
      })()}

      <button
        type="button"
        className={clsx(
          "flex items-center gap-x-2.5 py-1.5 px-2 rounded-sm border",
          isInvalid && column
            ? "text-red-500 bg-red-50 border-red-200 hover:border-red-400/60"
            : "text-ink-400  bg-gray-50 hover:border-gray-400/60 border-border-secondary"
        )}
        disabled={disabled}
        ref={buttonRef}
        onClick={onClickButton}
      >
        <div className="flex items-center gap-x-1 whitespace-nowrap">
          <span>{column?.name ?? "New filter"}</span>
          <span
            className={clsx(
              operator === "isNull" || operator === "isNotNull"
                ? "pl-0.5"
                : "px-0.5",
              isInvalid ? "text-red-400" : "text-ink-400"
            )}
          >
            {operator
              ? isNumberOperator(operator)
                ? numberOperatorSymbol(operator)
                : isStringOperator(operator)
                  ? stringOperatorSymbol(operator)
                  : dateOperatorSymbol(operator)
              : ""}
          </span>
          {operator !== "isNull" && operator !== "isNotNull" ? (
            renderedValue ? (
              <span className="px-1.5 py-0.5 bg-ceramic-100 text-ceramic-500 rounded-md">
                {Array.isArray(renderedValue)
                  ? renderedValue.length > 1
                    ? `[${renderedValue.join(", ")}]`
                    : renderedValue[0]
                  : renderedValue}
              </span>
            ) : (
              <span>
                {Array.isArray(value)
                  ? value.length > 1
                    ? `[${value.join(", ")}]`
                    : value[0]
                  : value}
              </span>
            )
          ) : null}
        </div>
        <span className="p-0.5 rounded-full hover:bg-red-100  hover:text-red-700">
          <XMarkIcon className="h-3 w-3" onClick={HandleOnRemove} />
        </span>
      </button>

      {ReactDOM.createPortal(
        <Transition
          as="div"
          show={open}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
          className="absolute z-[2000] -translate-x-1/2"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: buttonRef.current?.getBoundingClientRect().width,
          }}
        >
          <div
            className={clsx(
              "absolute py-4 left-0 z-20 mt-2 origin-top-right divide-y divide-gray-100 dark:divide-border-tertiary rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none px-4",

              VisualizationStringFilterMultiValuesOperator.safeParse(operator)
                .success
                ? "w-72"
                : "w-56"
            )}
            ref={menuRef}
          >
            <div className="flex flex-col gap-y-3">
              <AxisSelector
                label="Column"
                value={column}
                columns={dataframe.columns}
                onChange={setColumn}
                defaultValue={null}
              />

              {column && (
                <>
                  <Combobox<
                    | VisualizationNumberFilterOperator
                    | VisualizationDateFilterOperator
                    | VisualizationStringFilterOperator
                  >
                    icon={() => null}
                    label="Operator"
                    value={operator}
                    options={getOperatorOptions(column.type)}
                    onChange={onChangeOperator}
                    search={searchOperator}
                    getLabel={getOperatorLabel}
                    placeholder="Operator"
                    disabled={disabled}
                  />
                  {operator !== "isNull" && operator !== "isNotNull" && (
                    <div className="relative">
                      {VisualizationStringFilterMultiValuesOperator.safeParse(
                        operator
                      ).success ? (
                        <MultiComboboxV2<string>
                          label={<FilterValueLabel />}
                          value={Array.from(value) as string[]}
                          options={
                            "categories" in column
                              ? (column.categories?.map(c => c.toString()) ??
                                [])
                              : []
                          }
                          onChange={(selected: string[]) => setValue(selected)}
                          search={(options, query) =>
                            options.filter(c => c.includes(query))
                          }
                          getLabel={opt => opt}
                          icon={() => null}
                          placeholder="Value"
                          disabled={disabled}
                          valueFromQuery={(query: string) => query}
                        />
                      ) : (
                        <div>
                          <FilterValueLabel />
                          <input
                            className="w-full truncate border-0 text-xs  rounded-md ring-1 ring-inset ring-gray-200 focus-within:ring-1 focus-within:ring-inset focus-within:ring-gray-300 bg-white text-gray-800"
                            type="text"
                            value={
                              Array.isArray(value)
                                ? (value[0] ?? "")
                                : (value ?? "")
                            }
                            onChange={onChangeValue}
                            placeholder="Value"
                            onKeyDown={preventPropagation}
                            disabled={disabled}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </Transition>,
        document.body
      )}
    </div>
  );
}

export default FilterSelectorV2;
