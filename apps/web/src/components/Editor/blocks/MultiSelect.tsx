import { Menu, Transition } from "@headlessui/react";
import clsx from "clsx";
import { useRef } from "react";
import { createPortal } from "react-dom";
import { PiCaretDown, PiCheck, PiX } from "react-icons/pi";

import { computeMenuPosition } from "@/utils/dom";

interface Props<T> {
  options: T[];
  value: T[];
  getLabel: (t: T) => string;
  getIcon: ((t: T) => JSX.Element) | null;
  onToggle: (value: T) => void;
  placeholder: string;
}

export default function MultiSelect<T>(props: Props<T>) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  return (
    <Menu as="div">
      {({ open }) => {
        const portalStyle = computeMenuPosition(
          buttonRef,
          menuContainerRef,
          "bottom",
          6
        );
        portalStyle.width = buttonRef.current?.offsetWidth;

        return (
          <>
            <Menu.Button
              ref={buttonRef}
              className={clsx(
                "flex items-center justify-between w-full min-h-[36px] gap-2",
                "px-2.5 py-1.5 rounded-xl text-left transition-colors duration-150",
                "bg-base-300 dark:bg-base-700",
                "border border-transparent",
                open
                  ? "border-primary-200 dark:border-primary-700"
                  : "hover:border-base-360 dark:hover:border-base-710"
              )}
            >
              {props.value.length > 0 ? (
                <div className="flex flex-wrap flex-1 gap-1 min-w-0">
                  {props.value.map(value => (
                    <span
                      key={String(value)}
                      className="inline-flex items-center gap-1 max-w-full
                        bg-white dark:bg-base-720
                        border border-border-secondary dark:border-base-710
                        px-1.5 py-0.5 rounded-md text-[11px] font-medium
                        text-ink-500 dark:text-ink-200"
                    >
                      {props.getIcon?.(value)}
                      <span className="truncate">{props.getLabel(value)}</span>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          e.preventDefault();
                          props.onToggle(value);
                        }}
                        className="flex-shrink-0 p-0.5 rounded-md
                          text-ink-300 hover:text-ink-500 hover:bg-base-300
                          dark:hover:bg-base-700 transition-colors"
                        aria-label={`Remove ${props.getLabel(value)}`}
                      >
                        <PiX size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <span className="flex-1 text-[12.5px] text-ink-300 dark:text-ink-600">
                  {props.placeholder}
                </span>
              )}
              <PiCaretDown
                size={13}
                className={clsx(
                  "flex-shrink-0 text-ink-300 dark:text-ink-600 transition-transform duration-150",
                  open && "rotate-180"
                )}
              />
            </Menu.Button>
            {createPortal(
              <Transition
                as="div"
                className="absolute z-30"
                enter="transition ease-out duration-150"
                enterFrom="scale-95 -translate-y-0.5"
                enterTo="scale-100 translate-y-0"
                leave="transition ease-in duration-100"
                leaveFrom="scale-100 translate-y-0"
                leaveTo="scale-95 -translate-y-0.5"
                style={portalStyle}
                show={open}
              >
                <Menu.Items
                  as="div"
                  ref={menuContainerRef}
                  className="w-full rounded-xl bg-white dark:bg-base-720
                    shadow-lg border border-border-secondary dark:border-base-710
                    focus:outline-none font-body flex flex-col py-1.5 overflow-hidden"
                >
                  {props.options.map(option => {
                    const selected = props.value.includes(option);
                    return (
                      <Menu.Item
                        key={String(option)}
                        as="button"
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          e.preventDefault();
                          props.onToggle(option);
                        }}
                        className={clsx(
                          "w-full px-3 py-2 text-left flex items-center justify-between gap-2",
                          "transition-colors duration-100",
                          selected
                            ? "bg-primary-tint-50 dark:bg-primary-900"
                            : "hover:bg-primary-tint-50 dark:hover:bg-primary-900"
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {props.getIcon?.(option) && (
                            <span
                              className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-md
                              border border-border dark:border-base-710
                              bg-white dark:bg-base-750"
                            >
                              {props.getIcon(option)}
                            </span>
                          )}
                          <span
                            className={clsx(
                              "text-[12.5px] truncate",
                              selected
                                ? "font-medium text-ink-500 dark:text-ink-200"
                                : "text-ink-400 dark:text-ink-300"
                            )}
                          >
                            {props.getLabel(option)}
                          </span>
                        </div>
                        {selected ? (
                          <PiCheck
                            size={14}
                            className="flex-shrink-0 text-primary"
                            aria-hidden
                          />
                        ) : null}
                      </Menu.Item>
                    );
                  })}
                </Menu.Items>
              </Transition>,
              document.body
            )}
          </>
        );
      }}
    </Menu>
  );
}
