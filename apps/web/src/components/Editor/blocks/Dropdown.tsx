import { PiCaretUpDown, PiCheckCircleLight } from "react-icons/pi";
import { Listbox } from "@headlessui/react";
import { useMemo } from "react";
import clsx from "clsx";

interface Props {
  label: string;
  disabled?: boolean;
  options: { label: string; value: string }[];

  value?: string;
  placeholder: string;
  onChange: (value: string) => void;
  icon?: (value: string) => React.ReactNode;
  bg?: string;
  fg?: string;
}
function Dropdown(props: Props) {
  const currentValueLabel = useMemo(() => {
    return props.options.find(o => o.value === props.value)?.label;
  }, [props.options, props.value]);

  return (
    <div>
      <Listbox
        value={props.value}
        onChange={props.onChange}
        disabled={props.disabled}
      >
        {() => (
          <>
            <Listbox.Label className="block text-xs font-medium leading-6 text-ink-100">
              {props.label}
            </Listbox.Label>
            <div className="relative pt-0.5">
              <Listbox.Button
                className={clsx(
                  "flex items-center relative w-full cursor-default rounded-md py-1.5 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ring-border dark:ring-border-tertiary focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6",
                  props.disabled
                    ? "bg-gray-100 dark:bg-base-100 cursor-not-allowed text-ink-400"
                    : "bg-white dark:bg-header-surface cursor-pointer text-ink-100 dark:text-white"
                )}
              >
                {props.value && props.icon && (
                  <span className="mr-2">{props.icon(props.value)}</span>
                )}
                <span
                  className={clsx(
                    "block truncate h-6",
                    currentValueLabel ? "text-ink-100" : "text-ink-400"
                  )}
                >
                  {currentValueLabel ?? props.placeholder}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <PiCaretUpDown
                    className="h-5 w-5 text-ink-400"
                    aria-hidden="true"
                  />
                </span>
              </Listbox.Button>

              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border-tertiary bg-white dark:bg-header-surface dark:border-border-tertiary py-1 text-base focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:text-sm">
                {props.options.map(option => (
                  <Listbox.Option
                    key={option.value}
                    className={({ active }) =>
                      clsx(
                        active
                          ? (props.bg ?? "bg-primary/20 dark:bg-base-600")
                          : "",
                        "text-ink-100 dark:text-white",
                        "relative cursor-default select-none rounded-md py-2 pl-3 pr-9"
                      )
                    }
                    value={option.value}
                  >
                    {({ selected }) => (
                      <div className="flex items-center">
                        {props.icon && (
                          <span className="mr-2">
                            {props.icon(option.value)}
                          </span>
                        )}
                        <span className="block truncate font-normal">
                          {option.label}
                        </span>

                        {selected ? (
                          <span
                            className={clsx(
                              props.fg ?? "text-primary",
                              "absolute inset-y-0 right-0 flex items-center pr-4"
                            )}
                          >
                            <PiCheckCircleLight
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                          </span>
                        ) : null}
                      </div>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </div>
          </>
        )}
      </Listbox>
    </div>
  );
}
export default Dropdown;
