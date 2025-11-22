import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckIcon,
  ChevronUpDownIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { Transition } from "@headlessui/react";
import clsx from "clsx";
import ReactDOM from "react-dom";

import useDropdownPosition from "./hooks/dropdownposition";

import { useStableKeys } from "@sandworm/ui/lib/utils";

// 🎨 Interface / Props Definition
// =====================================
interface Props<T> {
  label?: string | JSX.Element;
  value: T[];
  options: T[];
  equals?: (a: T, b: T) => boolean;
  onChange: (value: T[]) => void;
  search: (options: T[], query: string) => T[];
  getLabel: (value: T) => string;
  icon: (value: T) => React.ReactNode;
  placeholder: string;
  valueFromQuery?: (query: string) => T;
  fetchOptions?: (query: string) => Promise<T[]>;
  loadingOptions?: boolean;
  disabled?: boolean;
}

// ⬢ Combo Box JSX
// =====================================
const ComboboxLabel = ({ label }: { label?: string | JSX.Element }) => {
  if (!label) return null;

  if (typeof label === "string") {
    return (
      <div className="block text-xs font-medium leading-6 text-gray-900">
        {label}
      </div>
    );
  }

  return label;
};

// =====================================
// ⬢ MultiComboboxV2 Component
// =====================================
export default function MultiComboboxV2<T extends object>({
  label,
  value,
  options,
  equals,
  onChange,
  search,
  getLabel,
  icon,
  placeholder,
  valueFromQuery,
  fetchOptions,
  loadingOptions,
  disabled,
}: Props<T>) {
  const [query, setQuery] = useState<null | string>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const { onOpen, dropdownPosition } = useDropdownPosition(inputContainerRef);
  const getKey = useStableKeys<T>();

  // ⬢ Filtered Options
  // =====================================
  const filteredOptions = useMemo(() => {
    return query === null || query === "" ? options : search(options, query);
  }, [query, options, search]);

  useEffect(() => {
    if (filteredOptions.length < 5 && fetchOptions) {
      fetchOptions(query ?? "");
    }
  }, [query, filteredOptions, fetchOptions]);

  // ⬢ onKeyDown Handler
  // =====================================
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (valueFromQuery && query) {
        if (event.key === "Enter" || event.key === "Tab") {
          event.preventDefault();
          onChange([...value, valueFromQuery(query)]);
          setQuery(null);
        }
      }
    },
    [query, valueFromQuery, onChange, value]
  );

  // ⬢ onClickButton Handler
  // =====================================
  const onClickButton = useCallback(() => {
    if (!disabled) {
      setOpen(true);
      onOpen();
    }
  }, [disabled, onOpen]);

  // ⬢ Click Outside Event Listener
  // =====================================
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (
        inputContainerRef.current &&
        !inputContainerRef.current.contains(e.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("click", onClickOutside);
    }

    return () => {
      document.removeEventListener("click", onClickOutside);
    };
  }, [inputContainerRef, menuRef, open]);

  return (
    <div className="w-full">
      <ComboboxLabel label={label} />

      <div className="relative mt-1 mb-0.5" ref={inputContainerRef}>
        <div
          className={clsx(
            "flex items-center space-x-1.5 rounded-md ring-1 ring-inset ring-gray-200 focus-within:ring-1 focus-within:ring-inset focus-within:ring-gray-300 group pl-2 pr-8 text-gray-800",
            disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"
          )}
        >
          <div className="flex flex-wrap py-0.5">
            <div className="flex flex-wrap space-x-0.5">
              {value.map((val, index) => (
                <div className="py-1" key={getKey(val)}>
                  <div className="bg-gray-50 border border-gray-200 px-2 py-1 rounded-sm flex items-center gap-x-1 text-xs">
                    <span>{getLabel(val)}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newValue = [...value];
                        newValue.splice(index, 1);
                        onChange(newValue);
                      }}
                      className="p-0.5 rounded-full hover:bg-red-100 hover:text-red-700 disabled:cursor-not-allowed disabled:hover:bg-gray-50 disabled:hover:text-gray-800"
                      disabled={disabled}
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <input
              className={clsx(
                "w-full truncate border-0 text-xs pl-0.5 focus:ring-0 bg-transparent font-mono placeholder:text-gray-400 disabled:cursor-not-allowed",
                value === null && "text-gray-400"
              )}
              onChange={event => setQuery(event.target.value)}
              placeholder={placeholder}
              onClick={e => {
                if (!open) {
                  e.preventDefault();
                  buttonRef.current?.click();
                }
              }}
              onFocus={e => {
                if (!open) {
                  e.preventDefault();
                  buttonRef.current?.click();
                  setQuery("");
                }
              }}
              onBlur={e => {
                e.preventDefault();
                setTimeout(() => setQuery(null), 200);
              }}
              value={query ?? ""}
              onKeyDown={onKeyDown}
            />
          </div>
        </div>

        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none"
          ref={buttonRef}
          onClick={onClickButton}
        >
          <ChevronUpDownIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </button>

        {ReactDOM.createPortal(
          <Transition
            as="div"
            show={open}
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
            className="absolute z-[2000] w-full -translate-x-1/2"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: inputContainerRef.current?.getBoundingClientRect().width,
            }}
          >
            <ul
              ref={menuRef}
              className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            >
              {filteredOptions.map(option => {
                const active = value.some(o =>
                  equals ? equals(option, o) : option === o
                );

                return (
                  <li key={getKey(option)}>
                    <button
                      type="button"
                      className={clsx(
                        active ? "text-white bg-gray-50" : "text-gray-900",
                        "group relative w-full select-none flex items-center gap-x-2 text-xs",
                        !disabled && "cursor-pointer"
                      )}
                      onClick={e => {
                        e.preventDefault();
                        const exists = value.some(v =>
                          equals ? equals(v, option) : v === option
                        );
                        if (exists) {
                          onChange(
                            value.filter(v =>
                              equals ? !equals(v, option) : v !== option
                            )
                          );
                        } else {
                          onChange([...value, option]);
                        }
                      }}
                    >
                      <div
                        className={clsx(
                          "hover:bg-gray-50",
                          "text-gray-900 w-full flex items-center justify-between py-2 px-4"
                        )}
                      >
                        <div className="flex items-center gap-x-2">
                          {icon(option)}
                          <span
                            className={clsx(
                              "truncate font-mono",
                              "group-hover:font-semibold"
                            )}
                          >
                            {getLabel(option)}
                          </span>
                        </div>

                        {active && (
                          <CheckIcon className="h-3 w-3" aria-hidden="true" />
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}

              {loadingOptions && (
                <div className="text-center text-gray-400 py-2">Loading...</div>
              )}
            </ul>
          </Transition>,
          document.body
        )}
      </div>
    </div>
  );
}
