import { useCallback, useMemo, useRef } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import ReactDOM from "react-dom";

import useDropdownPosition from "../hooks/dropdownposition";

type Option = {
  name: string;
  value: string | null;
};
interface Props {
  label: string;
  value: string | null;
  options: Option[];
  onChange: (value: string | null) => void;
  className?: string;
  disabled?: boolean;
}
function AxisModifierSelector({
  label,
  value,
  onChange,
  options,
  disabled,
  className,
}: Props) {
  const handleOnChange = useCallback(
    (v: string) => {
      if (v === "None") {
        onChange(null);
        return;
      }

      onChange(v);
    },
    [onChange]
  );

  const selected = useMemo(
    () => options.find(o => o.value === value) ?? null,
    [options, value]
  );

  const buttonRef = useRef<HTMLButtonElement>(null);
  const { onOpen, dropdownPosition } = useDropdownPosition(buttonRef);

  const onClickButton = useCallback(() => {
    if (!disabled) {
      onOpen();
    }
  }, [disabled, onOpen]);

  return (
    <Listbox
      value={value ?? "None"}
      onChange={handleOnChange}
      as="div"
      className={clsx(className, "flex items-center justify-between")}
      disabled={disabled}
    >
      {({ open }) => (
        <>
          <Listbox.Label className="block text-xs leading-6 text-ink-400 ">
            {label}
          </Listbox.Label>
          <div className="relative">
            <Listbox.Button
              className="w-full cursor-pointer text-ink-400  text-xs leading-6 flex items-center justify-end gap-x-1 "
              ref={buttonRef}
              onClick={onClickButton}
            >
              <span className="block truncate">{selected?.name ?? "None"}</span>
              <span className="pointer-events-none flex items-center">
                <ChevronDownIcon
                  className="h-4 w-4 text-ink-400"
                  aria-hidden="true"
                />
              </span>
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
                  className="z-[2000]"
                >
                  <Listbox.Options className="min-w-24 max-w-44 mt-0.5 max-h-60 overflow-auto rounded-md bg-white py-2 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    {options.map(option => (
                      <Listbox.Option
                        as="div"
                        className={({ active }) =>
                          clsx(
                            active ? "bg-gray-50" : "",
                            "relative cursor-default select-none py-2 text-xs flex items-center justify-between px-2.5"
                          )
                        }
                        value={option.value}
                        title={option.name}
                      >
                        {({ selected: isSelected }) => (
                          <>
                            <span
                              className={clsx(
                                isSelected
                                  ? "font-semibold text-gray-800"
                                  : "font-normal text-gray-600",
                                "block truncate"
                              )}
                            >
                              {option.name}
                            </span>

                            {isSelected ? (
                              <CheckIcon
                                className="h-3 w-3 text-gray-600"
                                aria-hidden="true"
                              />
                            ) : null}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </Transition>,
              document.body
            )}
          </div>
        </>
      )}
    </Listbox>
  );
}

export default AxisModifierSelector;
