import { useCallback, useMemo, useRef } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { PiCheck, PiCaretDown } from "react-icons/pi";
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
      className={clsx(className, "flex items-center justify-between font-body")}
      disabled={disabled}
    >
      {({ open }) => (
        <>
          <Listbox.Label className="block text-xs leading-6 text-ink-400 ">
            {label}
          </Listbox.Label>
          <div className="relative">
            <Listbox.Button
              className="w-full cursor-pointer text-ink-400 text-xs leading-6 flex items-center justify-end gap-x-1 font-body rounded-lg border border-transparent px-1.5 py-0.5 -my-0.5 transition-colors hover:bg-hover-bg hover:border-hover-border dark:hover:bg-base-600"
              ref={buttonRef}
              onClick={onClickButton}
            >
              <span className="block truncate">{selected?.name ?? "None"}</span>
              <span className="pointer-events-none flex items-center">
                <PiCaretDown
                  className="h-3.5 w-3.5 text-ink-400"
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
                  className="z-[2000] font-body"
                >
                  <Listbox.Options className="min-w-30 max-w-44 mt-0.5 max-h-60 overflow-auto rounded-xl border border-border-tertiary bg-inputBg dark:bg-dropdown-bg p-1 text-base shadow-lg focus:outline-none">
                    {options.map(option => (
                      <Listbox.Option
                        as="div"
                        className={({ active }) =>
                          clsx(
                            active
                              ? "bg-hover-bg dark:bg-base-600 border-hover-border"
                              : "border-transparent",
                            "relative cursor-default select-none py-1.5 text-xs flex items-center justify-between gap-x-2 px-2 rounded-lg border transition-colors"
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
                                  ? "font-semibold text-ink-100 dark:text-white"
                                  : "font-normal text-ink-400",
                                "block truncate"
                              )}
                            >
                              {option.name}
                            </span>

                            {isSelected ? (
                              <PiCheck
                                className="h-3 w-3 text-primary flex-shrink-0"
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
