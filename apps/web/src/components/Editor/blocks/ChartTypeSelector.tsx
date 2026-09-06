import ReactDOM from "react-dom";
import { useCallback, useEffect, useRef } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { PiCaretDown } from "react-icons/pi";
import clsx from "clsx";
import type { ChartType } from "@sandworm/types";
import Image from "next/image";

import useDropdownPosition from "../hooks/dropdownposition";

type Chart = {
  value: ChartType;
  label: string;
  icon: string;
  comingSoon?: boolean;
};
const charts: Chart[] = [
  {
    value: "groupedColumn",
    label: "Grouped column",
    icon: "grouped-column.svg",
  },
  {
    value: "stackedColumn",
    label: "Stacked column",
    icon: "stacked-column.svg",
  },
  {
    value: "hundredPercentStackedColumn",
    label: "100%-stacked column",
    icon: "100-stacked-column.svg",
  },
  {
    value: "line",
    label: "Line",
    icon: "line.svg",
  },
  {
    value: "area",
    label: "Area",
    icon: "area.svg",
  },
  {
    value: "hundredPercentStackedArea",
    label: "100%-stacked area",
    icon: "100-stacked-area.svg",
  },
  {
    value: "scatterPlot",
    label: "Scatter Plot",
    icon: "scatter.svg",
  },
  {
    value: "pie",
    label: "Pie",
    icon: "pie.svg",
  },
  {
    value: "histogram",
    label: "Histogram",
    icon: "histogram.svg",
  },
  {
    value: "trend",
    label: "Trend",
    icon: "trend.svg",
  },
  {
    value: "number",
    label: "Number",
    icon: "number.svg",
  },
];

interface Props {
  label: string;
  value: ChartType;
  onChange: (type: ChartType) => void;
  isEditable: boolean;
  compact?: boolean;
}

export default function ChartTypeSelector({
  label,
  value,
  onChange,
  isEditable,
  compact,
}: Props) {
  const selected = charts.find(type => type.value === value);
  useEffect(() => {
    if (!selected && charts.length > 0) {
      onChange(charts[0]!.value);
    }
  }, [selected, charts]);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const { onOpen, dropdownPosition } = useDropdownPosition(buttonRef);

  const onClickButton = useCallback(() => {
    if (isEditable) {
      onOpen();
    }
  }, [isEditable, onOpen]);

  if (!selected) {
    return null;
  }

  return (
    <Listbox value={value} onChange={onChange} disabled={!isEditable}>
      {({ open }) => (
        <div className="relative">
          {!compact && (
            <div className="block text-xs font-medium leading-6 text-ink-100 pb-1">
              {label}
            </div>
          )}
          <Listbox.Button
            className="text-xs w-full"
            ref={buttonRef}
            onClick={onClickButton}
          >
            <div className="border border-border-tertiary rounded-lg px-3 flex items-center justify-between gap-x-2 w-full min-h-8 bg-inputBg dark:bg-dropdown-bg transition-colors hover:bg-hover-bg hover:border-hover-border dark:hover:bg-base-600">
              <div className="flex items-center justify-left gap-x-2 text-left w-full h-6">
                <div className="h-4 w-6 rounded-sm grayscale">
                  <img src={`/img/charts/${selected.icon}`} alt="" />
                </div>
                {!compact && <span>{selected.label}</span>}
              </div>
              <PiCaretDown className="h-3.5 w-3.5 text-ink-400" />
            </div>
          </Listbox.Button>

          {ReactDOM.createPortal(
            <Transition
              show={open}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div
                style={{
                  position: "absolute",
                  top: dropdownPosition.top,
                  right: dropdownPosition.right,
                }}
                className="z-[2000] translate-x-1/2"
              >
                <Listbox.Options
                  as="div"
                  className="w-[30rem] z-20 mt-2 divide-y divide-border-secondary overflow-hidden rounded-xl bg-inputBg dark:bg-dropdown-bg border border-border-tertiary focus:outline-none px-5 py-4 font-body"
                >
                  <div className="grid grid-cols-3 gap-x-4 gap-y-6 items-stretch">
                    {charts.map(option => (
                      <Listbox.Option
                        as="div"
                        key={option.value}
                        disabled={option.comingSoon}
                        className={({ active }) =>
                          clsx(
                            active
                              ? "bg-hover-bg dark:bg-base-600 border-hover-border"
                              : "border-border-secondary dark:border-border-tertiary",
                            option.comingSoon
                              ? "cursor-not-allowed"
                              : "cursor-pointer",
                            "pb-3.5 pt-2.5 select-none rounded-lg border flex flex-col justify-center items-center relative transition-colors"
                          )
                        }
                        value={option.value}
                      >
                        {({ active }) => (
                          <>
                            <div className="h-12 w-20 rounded-sm">
                              <Image
                                width={80}
                                height={80}
                                rel="preload"
                                src={`/img/charts/${option.icon}`}
                                alt=""
                                className={
                                  option.comingSoon
                                    ? "grayscale opacity-50"
                                    : "filter hue-rotate-[170deg] saturate-125 brightness-11"
                                }
                              />
                            </div>
                            <span
                              className={clsx(
                                active
                                  ? "text-ink-100 dark:text-white"
                                  : "text-ink-400 dark:text-white",
                                "text-center px-1.5 text-[11.5px] absolute bottom-0 translate-y-1/2 bg-inputBg dark:bg-dropdown-bg"
                              )}
                            >
                              {option.label}
                            </span>

                            {option.comingSoon && (
                              <div className="absolute h-3/4 w-5/6 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-2 py-1 flex items-center justify-center">
                                <div className="absolute h-full w-full top-0 left-0 bg-base-200 dark:bg-base-600 opacity-80 rounded-md" />
                                <div className="relative text-xs text-ink-400  whitespace-nowrap">
                                  Coming soon
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </div>
                </Listbox.Options>
              </div>
            </Transition>,
            document.body
          )}
        </div>
      )}
    </Listbox>
  );
}
