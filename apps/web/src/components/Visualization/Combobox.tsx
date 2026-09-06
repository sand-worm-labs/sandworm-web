import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PiCheck, PiCaretUpDown } from "react-icons/pi";
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
        <div className="flex items-center space-x-1.5 rounded-lg border border-border-tertiary focus-within:border-hover-border bg-inputBg group pl-2.5 pr-8 text-ink-100 dark:bg-dropdown-bg dark:text-white transition-colors">
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
          className="absolute inset-y-0 right-0 flex items-center rounded-r-lg px-2 focus:outline-none"
          ref={buttonRef}
          onClick={onClickButton}
        >
          <PiCaretUpDown
            className="h-3.5 w-3.5 text-ink-400"
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
            className="absolute z-[2000] text-xs -translate-x-1/2 font-body"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: inputContainerRef.current?.getBoundingClientRect().width,
            }}
          >
            <div
              className="mt-0.5 max-h-56 overflow-auto rounded-xl border border-border-tertiary bg-inputBg dark:bg-dropdown-bg p-1 shadow-lg focus:outline-none"
              ref={menuRef}
            >
              {filteredColumns.map(c => (
                <button
                  type="button"
                  key={String(c)}
                  className="border border-transparent hover:bg-hover-bg hover:border-hover-border dark:hover:bg-base-600 text-ink-100 dark:text-white relative select-none flex items-center justify-between gap-x-2 w-full cursor-pointer rounded-lg px-2 py-1.5 transition-colors"
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange(c);
                    setOpen(false);
                  }}
                >
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
                    <PiCheck
                      className="h-3 w-3 text-primary flex-shrink-0"
                      aria-hidden="true"
                    />
                  )}
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
