import type * as Y from "yjs";
import {
  type YBlock,
  type ExecutionQueue,
  type DropdownInputBlock,
  getDropdownInputAttributes,
  updateDropdownInputLabel,
  updateDropdownInputValue,
  dropdownInputToggleConfigOpen,
  updateDropdownInputVariable,
  isExecutionStatusLoading,
} from "@sandworm/editor";
import clsx from "clsx";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ConnectDragPreview } from "react-dnd";
import type { DataFrame } from "@sandworm/types";
import { Combobox } from "@headlessui/react";
import ReactDOM from "react-dom";
import { head } from "ramda";
import {
  PiListPlus,
  PiTrash,
  PiGearSix,
  PiWarningCircle,
  PiClock,
  PiCheck,
  PiCaretDown,
} from "react-icons/pi";

import useEditorAwareness from "../../../hooks/useEditorAwareness";
import { useBlockExecutions } from "../../../hooks/useBlockExecution";
import Spin from "../../Spin";
import { useEnvironmentStatus } from "../../../hooks/useEnvironmentStatus";
import type { DashboardMode } from "../../Dashboard";
import { BlockTypePill } from "../../BlockTypePill";

import DropdownSettings from "./dropdownSettings";

function errorMessage(
  error: DropdownInputBlock["variable"]["error"],
  options: DropdownInputBlock["options"]
): React.ReactNode {
  switch (error) {
    case "invalid-variable-name":
      return (
        <>
          The variable name is invalid:
          <br />
          It should start with a letter or underscore, followed by letters,
          digits, or underscores. Spaces are not allowed.
        </>
      );
    case "invalid-value": {
      return (
        <>
          The value is invalid:
          <br />
          It must be one of the following:
          <br />
          {options.map(option => (
            <div key={option}>{option}</div>
          ))}
        </>
      );
    }
    case "unexpected-error":
      return (
        <>
          Unexpected error occurred while updating the input. Click this icon to
          retry.
        </>
      );
    default:
      return null;
  }
}

interface Props {
  block: Y.XmlElement<DropdownInputBlock>;
  blocks: Y.Map<YBlock>;
  dragPreview: ConnectDragPreview | null;
  belongsToMultiTabGroup: boolean;
  isEditable: boolean;
  isApp: boolean;
  dashboardMode: DashboardMode | null;
  dataframes: Y.Map<DataFrame>;
  isCursorWithin: boolean;
  isCursorInserting: boolean;
  userId: string | null;
  workspaceId: string;
  executionQueue: ExecutionQueue;
}
function DropdownInputBlock(props: Props) {
  const attrs = getDropdownInputAttributes(props.block, props.blocks);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(attrs.value.newValue ?? "");

  const filteredOptions =
    query === ""
      ? attrs.options
      : attrs.options.filter(option =>
          option.toLowerCase().includes(query.toLowerCase())
        );
  const blockId = attrs.id;

  const onChangeLabel = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateDropdownInputLabel(props.block, e.target.value);
    },
    [props.block]
  );

  const { startedAt: environmentStartedAt } = useEnvironmentStatus(
    props.workspaceId
  );

  const onRetryValue = useCallback(() => {
    updateDropdownInputValue(props.block, {
      error: null,
    });
    props.executionQueue.enqueueBlock(
      props.block,
      props.userId,
      environmentStartedAt,
      {
        _tag: "dropdown-input-save-value",
      }
    );
  }, [props.block, props.userId, props.executionQueue, environmentStartedAt]);

  const toggleConfigOpen = useCallback(() => {
    dropdownInputToggleConfigOpen(props.block);
  }, [props.block]);

  const onChangeVariable = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateDropdownInputVariable(props.block, props.blocks, {
        newValue: e.target.value,
      });
    },
    [props.block, props.blocks]
  );

  const onBlurVariable: React.FocusEventHandler<HTMLInputElement> = useCallback(
    e => {
      if (attrs.variable.newValue !== attrs.variable.value) {
        updateDropdownInputVariable(props.block, props.blocks, {
          newValue: e.target.value.trim(),
          error: null,
        });
        props.executionQueue.enqueueBlock(
          props.block,
          props.userId,
          environmentStartedAt,
          {
            _tag: "dropdown-input-rename-variable",
          }
        );
      }
    },
    [
      attrs.variable.newValue,
      attrs.variable.value,
      props.block,
      props.blocks,
      props.executionQueue,
      environmentStartedAt,
    ]
  );

  const onRetryVariable = useCallback(() => {
    updateDropdownInputVariable(props.block, props.blocks, {
      error: null,
    });
    props.executionQueue.enqueueBlock(
      props.block,
      props.userId,
      environmentStartedAt,
      {
        _tag: "dropdown-input-rename-variable",
      }
    );
  }, [
    props.block,
    props.blocks,
    props.executionQueue,
    props.userId,
    environmentStartedAt,
  ]);

  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (props.isCursorWithin && props.isCursorInserting) {
      selectRef.current?.focus();
    }
  }, [props.isCursorWithin, props.isCursorInserting]);

  const [, editorAPI] = useEditorAwareness();
  const onFocus = useCallback(() => {
    editorAPI.insert(blockId, { scrollIntoView: false });
  }, [blockId, editorAPI.insert]);

  const unfocusOnEscape = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        selectRef.current?.blur();
      }
    },
    []
  );

  const dropdownWrapperRef = useRef<HTMLInputElement>(null);

  const variableExecutions = useBlockExecutions(
    props.executionQueue,
    props.block,
    "dropdown-input-rename-variable"
  );
  const variableStatus =
    head(variableExecutions)?.item.getStatus()._tag ?? "idle";

  const valueExecutions = useBlockExecutions(
    props.executionQueue,
    props.block,
    "dropdown-input-save-value"
  );
  const valueStatus = head(valueExecutions)?.item.getStatus()._tag ?? "idle";

  const onSelectValue = useCallback(
    (value: string) => {
      setSelected(value);
      updateDropdownInputValue(props.block, { newValue: value });
      props.executionQueue.enqueueBlock(
        props.block,
        props.userId,
        environmentStartedAt,
        {
          _tag: "dropdown-input-save-value",
        }
      );
    },
    [props.block, props.executionQueue, props.userId, environmentStartedAt]
  );

  const onRun = useCallback(() => {
    props.executionQueue.enqueueBlock(
      props.block,
      props.userId,
      environmentStartedAt,
      {
        _tag: "dropdown-input-save-value",
      }
    );
  }, [props.block, props.userId, props.executionQueue, environmentStartedAt]);

  return (
    <div
      className={clsx(
        "relative group/block mt-6",
        !props.dashboardMode ? "w-1/2" : "w-full"
      )}
      data-block-id={blockId}
    >
      <div
        className={clsx(
          "rounded-2xl border-[1.5px] px-4 py-3",
          props.belongsToMultiTabGroup ? "rounded-tl-none" : "",
          {
            "border-primary block-focus-ring":
              props.isCursorWithin && props.isCursorInserting,
            "border-hover-border shadow-none":
              props.isCursorWithin && !props.isCursorInserting,
            "border-hover-border block-shadow-soft dark:border-border-tertiary":
              !props.isCursorWithin,
          }
        )}
        ref={d => {
          if (props.dragPreview) {
            props.dragPreview(d);
          }
        }}
      >
        <div className="flex justify-between items-center pb-1.5">
          <div className="flex items-center flex-grow space-x-1">
            <input
              data-bounding-rect="true"
              className="block ring-0 text-sm font-medium leading-6 text-ink-100 w-full focus:ring-0 border-0 border-b border-transparent hover:border-hover-border focus:border-primary focus:outline-none p-0 bg-transparent"
              type="text"
              value={attrs.label}
              onChange={onChangeLabel}
              disabled={!props.isEditable || props.isApp}
            />
            {!props.isApp && props.isEditable && (
              <div className="flex items-center space-x-1">
                <button type="button" onClick={toggleConfigOpen}>
                  <PiGearSix className="h-4 w-4 text-ink-400 hover:text-gray-600" />
                </button>
                <div
                  className={clsx(!props.isEditable && "hidden", "relative")}
                >
                  <input
                    className={clsx(
                      "ring-0 px-1 py-0.5 rounded-md text-ceramic-500 bg-ceramic-100 text-xs font-medium min-w-12 min-h-4 focus:ring-0 border-0 block text-right",
                      {
                        "text-red-500 bg-red-100":
                          attrs.variable.error &&
                          !isExecutionStatusLoading(variableStatus),
                        "text-ceramic-500 bg-ceramic-100":
                          !attrs.variable.error &&
                          !isExecutionStatusLoading(variableStatus),
                        "text-gray-300 bg-gray-100":
                          isExecutionStatusLoading(variableStatus),
                      }
                    )}
                    type="text"
                    value={attrs.variable.newValue}
                    onChange={onChangeVariable}
                    onBlur={onBlurVariable}
                    disabled={isExecutionStatusLoading(variableStatus)}
                    ref={dropdownWrapperRef}
                  />
                  <div className="absolute inset-y-0 pl-1 flex items-center group z-10">
                    {(attrs.variable.error ||
                      isExecutionStatusLoading(variableStatus)) &&
                      (variableStatus === "running" ||
                      variableStatus === "aborting" ? (
                        <Spin />
                      ) : variableStatus === "enqueued" ? (
                        <PiClock className="w-4 h-4 text-gray-300" />
                      ) : attrs.variable.error ? (
                        <>
                          <button
                            type="button"
                            disabled={attrs.variable.error === null}
                            onClick={onRetryVariable}
                          >
                            <PiWarningCircle
                              className="h-3 w-3 text-red-300"
                              aria-hidden="true"
                            />
                          </button>
                          <div className="font-body  pointer-events-none absolute -top-2 left-1/2 -translate-y-full -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100 bg-hunter-950 text-white text-xs p-2 rounded-md flex flex-col gap-y-1 w-72">
                            <span className="inline-flex gap-x-1 items-center text-ink-400 text-center">
                              {errorMessage(
                                attrs.variable.error,
                                attrs.options
                              )}
                            </span>
                          </div>
                        </>
                      ) : null)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col space-y-1">
          <div className="relative">
            <Combobox
              value={selected}
              onChange={value => value !== null && onSelectValue(value)}
              disabled={
                isExecutionStatusLoading(valueStatus) ||
                (!props.isEditable && !props.isApp)
              }
            >
              <Combobox.Button as="div" className="block w-full relative">
                <div className="relative" ref={dropdownWrapperRef}>
                  <Combobox.Input
                    onFocus={onFocus}
                    onBlur={editorAPI.blur}
                    className={clsx(
                      "block rounded-md border-0 py-1.5 text-ink-100 shadow-sm ring-1 ring-inset placeholder:text-ink-400 focus:ring-2 focus:ring-inset w-full disabled:bg-gray-100 disabled:cursor-not-allowed bg-white",
                      attrs.value.error
                        ? "ring-red-200 focus:ring-red-200"
                        : "focus:ring-primary-200",
                      props.isCursorWithin &&
                        !props.isCursorInserting &&
                        !props.belongsToMultiTabGroup
                        ? "ring-primary-400"
                        : "ring-gray-200",
                      (isExecutionStatusLoading(valueStatus) ||
                        attrs.value.error) &&
                        "bg-none" // this removes the caret
                    )}
                    displayValue={(value: string) => value}
                    onChange={e => setQuery(e.target.value)}
                  />
                  <button
                    type="button"
                    className="inline-block absolute inset-y-0 right-0 px-2.5 bottom-1/2 transform translate-y-1/2"
                    onClick={() => setQuery("")}
                  >
                    <PiCaretDown className="w-5 h-5 text-ink-400" />
                  </button>
                </div>
              </Combobox.Button>
              {ReactDOM.createPortal(
                <Combobox.Options
                  ref={selectRef}
                  style={{
                    top: dropdownWrapperRef.current?.getBoundingClientRect()
                      .bottom,
                    left: dropdownWrapperRef.current?.getBoundingClientRect()
                      .left,
                    width:
                      dropdownWrapperRef.current?.getBoundingClientRect().width,
                  }}
                  onKeyDown={unfocusOnEscape}
                  className="absolute mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm z-40"
                >
                  {filteredOptions.map(option => (
                    <Combobox.Option
                      key={option}
                      value={option}
                      className={({ active }) =>
                        clsx(
                          "cursor-default select-none relative py-2 pl-10 pr-4",
                          active ? "bg-ceramic-100 text-black" : "text-ink-100"
                        )
                      }
                    >
                      {({ selected: isSelected, active }) => (
                        <>
                          <span
                            className={clsx(
                              "block truncate",
                              isSelected ? "font-medium" : "font-normal"
                            )}
                          >
                            {option}
                          </span>
                          {isSelected ? (
                            <span
                              className={clsx(
                                "absolute inset-y-0 left-0 flex items-center pl-3",
                                active ? "text-white" : "text-blue-600"
                              )}
                            >
                              <PiCheck
                                className="w-4 h-4"
                                aria-hidden="true"
                                color="black"
                              />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Combobox.Option>
                  ))}
                </Combobox.Options>,
                document.body
              )}
            </Combobox>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 group">
              {(attrs.value.error || isExecutionStatusLoading(valueStatus)) &&
                (valueStatus === "running" || valueStatus === "aborting" ? (
                  <Spin />
                ) : valueStatus === "enqueued" ? (
                  <PiClock className="w-4 h-4 text-gray-300" />
                ) : attrs.value.error ? (
                  <>
                    <button type="button" onClick={onRetryValue}>
                      <PiWarningCircle
                        className="h-4 w-4 text-red-300"
                        aria-hidden="true"
                      />
                    </button>
                    <div className="font-body  pointer-events-none absolute -top-2 left-1/2 -translate-y-full -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100 bg-hunter-950 text-white text-xs p-2 rounded-md flex flex-col gap-y-1 w-72">
                      <span className="inline-flex gap-x-1 items-center text-ink-400">
                        <span>
                          {errorMessage(attrs.value.error, attrs.options)}
                        </span>
                      </span>
                    </div>
                  </>
                ) : null)}
            </div>
          </div>
          {attrs.configOpen && !props.isApp && props.isEditable && (
            <DropdownSettings
              block={props.block}
              blocks={props.blocks}
              dataframes={props.dataframes}
              onRun={onRun}
            />
          )}
        </div>
      </div>

      <div className="absolute left-0 top-0 -translate-y-full pb-2">
        <BlockTypePill
          label="Dropdown"
          icon={<PiListPlus className="w-3 h-3" />}
        />
      </div>

      <div
        className={clsx(
          "absolute transition-opacity opacity-0 group-hover/block:opacity-100 right-0 top-0 -translate-y-full pb-2 flex flex-row gap-x-1",
          !props.isEditable ? "hidden" : "flex"
        )}
      >
        <button
          type="button"
          className="bg-[#FFDBDB] rounded-[5px] h-[24px] min-w-[24px] flex items-center justify-center group hover:bg-error"
        >
          <PiTrash className="w-[13px] h-[13px] text-ink-navy group-hover:text-white" />
        </button>
      </div>
    </div>
  );
}

export default DropdownInputBlock;
