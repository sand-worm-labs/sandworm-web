import { Fragment, useCallback } from "react";
import { Listbox, Transition } from "@headlessui/react";
import {
  CheckIcon,
  ChevronUpDownIcon,
  PlusIcon,
} from "@heroicons/react/20/solid";
import clsx from "clsx";

type Option = {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
};

interface Props {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  onAdd?: () => void;
  onAddLabel?: string;
  placeholders?: [string, string];
}
export default function HeaderSelect(props: Props) {
  const { options, value, disabled } = props;
  console.log("options", options);

  const hasOptions = options.length > 0;
  const isDisabled = disabled || !hasOptions;
  const hasValue = options.some(option => option.value === value);
  const selectedOption = hasOptions
    ? options.find(option => option.value === value)
    : undefined;
  const selectedOptionContent =
    selectedOption?.label ??
    (hasOptions
      ? (props.placeholders?.[0] ?? "No data frames selected")
      : (props.placeholders?.[1] ?? "No data frames"));

  const onChange = useCallback(
    (newValue: string) => {
      if (!isDisabled) {
        props.onChange(newValue);
      }
    },
    [isDisabled, props.onChange]
  );

  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      {({ open }) => (
        <div className="h-auto  w-[7.8rem] max-w-56 relative overflow-visible font-normal mr-[1rem]">
          <Listbox.Button
            as="div"
            className={clsx(
              " py-1.5 h-full relative w-full rounded-lg pl-3 pr-10 text-left sm:text-xs flex items-center cursor-pointer",
              hasValue
                ? "text-ink-400 dark:text-white bg-hover-bg dark:bg-base-100 hover:bg-gray-100/50"
                : "text-error bg-red-50 hover:bg-red-100"
            )}
          >
            <div className="flex gap-x-3 items-center font-body overflow-hidden">
              {selectedOption?.icon && (
                <span className="flex-shrink-0 flex items-center">
                  {selectedOption.icon}
                </span>
              )}
              <span className="block truncate">{selectedOptionContent}</span>
            </div>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-3 w-3 text-ink-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>

          <Transition
            show={open}
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options
              as="div"
              className="mt-[1px] absolute z-10 max-h-60 overflow-auto bg-white dark:bg-base-100 text-base shadow-lg ring-1 ring-gray-200 dark:ring-border-tertiary focus:outline-none sm:text-xs w-[calc(100%-1px)]"
            >
              {options.map(option => (
                <Listbox.Option
                  key={option.value}
                  as="div"
                  disabled={option.disabled}
                  className={({ active }) =>
                    clsx(
                      active && !option.disabled ? "bg-blue-50 dark:bg-base-500" : "",
                      option.disabled
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:cursor-pointer",
                      "relative select-none pl-3 pr-9 text-ink-100 dark:text-white py-3"
                    )
                  }
                  value={option.value}
                >
                  {({ selected, active }) => (
                    <div className="flex gap-x-3 items-center font-mono overflow-hidden">
                      {option.icon && (
                        <span className="flex-shrink-0 flex items-center">
                          {option.icon}
                        </span>
                      )}
                      <span
                        className={clsx(
                          selected ? "font-semibold" : "font-normal",
                          "block truncate"
                        )}
                      >
                        {option.label}
                      </span>
                      {option.disabled && (
                        <span className="text-[10px] text-ink-300 dark:text-ink-600 ml-1">
                          (unavailable)
                        </span>
                      )}

                      {selected ? (
                        <span
                          className={clsx(
                            active ? "text-white" : "text-primary-200",
                            "absolute inset-y-0 right-0 flex items-center pr-4"
                          )}
                        >
                          <CheckIcon
                            className="text-ink-100 h-3 w-3"
                            aria-hidden="true"
                          />
                        </span>
                      ) : null}
                    </div>
                  )}
                </Listbox.Option>
              ))}
              {props.onAdd && (
                <button
                  type="button"
                  onClick={props.onAdd}
                  className="flex items-center w-full text-left py-2 pl-3 pr-9 text-ink-100 border-t border-border-secondary hover:bg-blue-50 space-x-1 h-10 dark:border-editor-100"
                >
                  <PlusIcon className="h-3 w-3" aria-hidden="true" />
                  <span>{props.onAddLabel ?? ""}</span>
                </button>
              )}
            </Listbox.Options>
          </Transition>
        </div>
      )}
    </Listbox>
  );
}
