import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { Transition } from "@headlessui/react";
import clsx from "clsx";
import ReactDOM from "react-dom";

import useDropdownPosition from "../Editor/hooks/dropdownposition";

interface Props<T> {
  label?: string | JSX.Element;
  value: T | null;
  options: T[];
  onChange: (value: T | null) => void;
  search: (options: T[], query: string) => T[];
  getLabel: (value: T) => string;
  icon: (value: T) => React.ReactNode;
  placeholder: string;
  fetchOptions?: (query: string) => Promise<T[]>;
  loadingOptions?: boolean;
  disabled?: boolean;
}

export default function ComboboxV2<T>({
  label,
  value,
  options,
  onChange,
  search,
  getLabel,
  icon,
  placeholder,
  fetchOptions,
  loadingOptions,
  disabled,
}: Props<T>) {
  const [query, setQuery] = useState<null | string>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  const filteredColumns = useMemo(() => {
    return query === null || query === "" ? options : search(options, query);
  }, [query, options, search]);

  useEffect(() => {
    if (filteredColumns.length < 5 && fetchOptions) {
      fetchOptions(query ?? "");
    }
  }, [query, filteredColumns, fetchOptions]);

  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const { onOpen, dropdownPosition } = useDropdownPosition(inputContainerRef);
  const onClickButton = useCallback(() => {
    if (!disabled) {
      setOpen(true);
      onOpen();
    }
  }, [disabled, onOpen]);
  useEffect(() => {
    if (!open) {
      return () => {};
    }

    const onClickOutside = (e: MouseEvent) => {
      if (
        inputContainerRef.current &&
        !inputContainerRef.current.contains(e.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();
        setOpen(false);
      }
    };

    document.addEventListener("click", onClickOutside);
    return () => {
      document.removeEventListener("click", onClickOutside);
    };
  }, [inputContainerRef, menuRef, open]);

  return (
    <div>
      {label && typeof label === "string" ? (
        <div className="block text-xs font-medium leading-6 text-ink-100">
          {label}
        </div>
      ) : (
        label
      )}
      <div className="relative mt-1 mb-0.5" ref={inputContainerRef}>
        <div className="flex items-center space-x-1.5 rounded-md ring-1 ring-inset ring-gray-200 dark:ring-border-dark focus-within:ring-1 focus-within:ring-inset focus-within:ring-gray-300 bg-white group pl-2.5 pr-8 text-ink-100 dark:bg-header-surface  dark:text-white">
          {value && icon(value)}
          <input
            className={clsx(
              "w-full truncate border-0 text-xs pl-0.5 focus:ring-0 bg-transparent font-body placeholder:text-ink-400 min-h-[2rem] ",
              value === null && "text-ink-400"
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
            value={query ?? (value ? getLabel(value) : "")}
          />
        </div>
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none"
          ref={buttonRef}
          onClick={onClickButton}
        >
          <ChevronUpDownIcon
            className="h-5 w-5 text-ink-400"
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
            className="absolute z-[2000] text-xs -translate-x-1/2"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: inputContainerRef.current?.getBoundingClientRect().width,
            }}
          >
            <div
              className="mt-1 max-h-56 overflow-auto rounded-md bg-white dark:bg-header-surface py-1 shadow-lg ring-1 ring-black dark:ring-border-dark ring-opacity-5 focus:outline-none"
              ref={menuRef}
            >
              {filteredColumns.map(c => (
                <button
                  type="button"
                  key={String(c)}
                  className="hover:text-white hover:bg-gray-50 dark:hover:bg-base-600 text-ink-100 dark:text-white relative select-none flex items-center gap-x-2 w-full cursor-pointer"
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange(c);
                    setOpen(false);
                  }}
                >
                  <div className="text-ink-100 dark:text-white flex w-full items-center justify-between pl-2 pr-4 py-2 hover:bg-gray-50 dark:hover:bg-base-600">
                    <div className="flex items-center gap-x-2">
                      {icon(c)}
                      <span
                        className={clsx(
                          "truncate font-body",
                          value === c && "font-semibold"
                        )}
                      >
                        {getLabel(c)}
                      </span>
                    </div>

                    {value === c && (
                      <CheckIcon className="h-3 w-3" aria-hidden="true" />
                    )}
                  </div>
                </button>
              ))}
              {loadingOptions && (
                <div className="text-center text-ink-400 py-2">Loading...</div>
              )}
            </div>
          </Transition>,
          document.body
        )}
      </div>
    </div>
  );
}
