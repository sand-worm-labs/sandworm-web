import { Menu, Transition } from "@headlessui/react";
import {
  ForwardIcon,
  MinusCircleIcon,
  XCircleIcon,
  RectangleStackIcon,
  FolderIcon,
  EyeSlashIcon,
  BarsArrowDownIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useRef } from "react";
import { createPortal } from "react-dom";
import type { ConnectDragSource } from "react-dnd";

import { computeMenuPosition } from "../../utils/dom";

const DragHandle = ({
  isDragging,
  hasMultipleTabs,
  hasRunnableBlocks,
  onRunBelowBlock,
  onRunAllTabs,
  onDeleteTab,
  onDeleteBlock,
  onDuplicateTab,
  onDuplicateBlock,
  onHideAllTabs,
  menuPosition,
  dragRef,
}: {
  isDragging: boolean;
  dragRef?: ConnectDragSource;
  hasMultipleTabs: boolean;
  hasRunnableBlocks: boolean;
  onRunBelowBlock: () => void;
  onRunAllTabs: () => void;
  onDeleteTab: (() => void) | null;
  onDeleteBlock: () => void;
  onDuplicateTab: (() => void) | null;
  onDuplicateBlock: () => void;
  onHideAllTabs: () => void;
  menuPosition: "left" | "right" | "bottom";
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  return (
    <Menu
      as="div"
      className="relative inline-flex flex-col items-center dark:bg-base-100"
    >
      {({ open }) => {
        const portalStyle = computeMenuPosition(
          buttonRef,
          menuContainerRef,
          menuPosition,
          6
        );

        return (
          <>
            <div
              ref={node => {
                if (dragRef) dragRef(node);
              }}
              className={clsx(
                "h-5 w-5 text-ink-400/60 group-hover/wrapper:opacity-100 transition-opacity duration-200 ease-in-out flex items-center justify-center",
                isDragging ? "cursor-grabbing" : "cursor-grab",
                open ? "opacity-100" : "opacity-0"
              )}
            >
              <svg
                height="24"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="m0 0h24v24h-24z" fill="none" />
                <path
                  fill="currentColor"
                  d="m11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
                />
              </svg>
            </div>
            {/*  <Menu.Button
              ref={buttonRef}
              className="rounded-md hover:bg-gray-100 h-6 w-6 flex items-center justify-center  dark:bg-base-100 "
            >
              <div
                className={clsx(
                  "h-5 w-5 text-ink-400/60 group-hover/wrapper:opacity-100  transition-opacity duration-200 ease-in-out flex items-center justify-center",
                  isDragging ? "cursor-grabbing" : "cursor-pointer",
                  open ? "opacity-100" : "opacity-0"
                )}
              >
                <svg
                  height="24"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="m0 0h24v24h-24z" fill="none" />
                  <path
                    fill="currentColor"
                    d="m11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
                  />
                </svg>
              </div>
            </Menu.Button> */}
            <Menu.Button
              ref={buttonRef}
              className="opacity-0 group-hover/wrapper:opacity-100 h-3 w-5 flex items-center justify-center rounded hover:bg-gray-100 dark:bg-base-100 transition-opacity duration-200"
            >
              <span className="text-[8px] text-ink-400/60 leading-none">▾</span>
            </Menu.Button>

            {createPortal(
              <Transition
                as="div"
                className="absolute z-30"
                enter="transition-opacity duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                style={portalStyle}
                show={open}
              >
                <Menu.Items
                  as="div"
                  ref={menuContainerRef}
                  className="absolute z-30 rounded-lg dark:bg-base-400 bg-white focus:outline-none font-body  dark:divide-border-tertiary flex flex-col text-sm text-ink-400 dark:ring-[#262A30] dark:border-border-tertiary dark:border border-[#CED4DA] border "
                >
                  <div className="flex flex-col  dark:divide-border-tertiary">
                    <div className="py-0.5 px-0.5">
                      {hasRunnableBlocks && (
                        <Menu.Item
                          as="button"
                          onClick={onRunAllTabs}
                          className="dark:hover:bg-[#181C21] hover:bg-primary/20 w-full px-2 py-1.5 rounded-md text-left flex gap-x-2 items-center whitespace-nowrap"
                        >
                          {hasMultipleTabs ? (
                            <ForwardIcon className="h-4 w-4" />
                          ) : (
                            <PlayIcon className="h-4 w-4" />
                          )}
                          <span>
                            {hasMultipleTabs ? "Run all tabs" : "Run block"}
                          </span>
                        </Menu.Item>
                      )}

                      <Menu.Item
                        as="button"
                        onClick={onRunBelowBlock}
                        className="hover:bg-primary/20 dark:hover:bg-[#181C21]  w-full px-2 py-1.5 rounded-md text-left flex gap-x-2 items-center whitespace-nowrap"
                      >
                        <BarsArrowDownIcon className="h-4 w-4" />
                        <span>Run onwards</span>
                      </Menu.Item>

                      {hasMultipleTabs && (
                        <Menu.Item
                          as="button"
                          onClick={onHideAllTabs}
                          className="hover:bg-primary/20 dark:hover:bg-[#181C21]  w-full px-2 py-1.5 rounded-md text-left flex gap-x-2 items-center whitespace-nowrap"
                        >
                          <EyeSlashIcon className="h-4 w-4" />
                          <span>Hide all tabs</span>
                        </Menu.Item>
                      )}
                    </div>

                    <div className="py-0.5 px-0.5">
                      {onDuplicateTab && (
                        <Menu.Item
                          as="button"
                          className="hover:bg-primary/20 dark:hover:bg-[#181C21] w-full px-2 py-1.5 rounded-md text-left flex gap-x-2 items-center whitespace-nowrap"
                          onClick={onDuplicateTab}
                        >
                          <FolderIcon className="h-4 w-4" />
                          <span>Duplicate tab</span>
                        </Menu.Item>
                      )}
                      <Menu.Item
                        as="button"
                        onClick={onDuplicateBlock}
                        className="hover:bg-primary/20 dark:hover:bg-[#181C21] w-full px-2 py-1.5 rounded-md text-left flex gap-x-2 items-center whitespace-nowrap"
                      >
                        <RectangleStackIcon className="h-4 w-4 shrink-0" />
                        <span>Duplicate block</span>
                      </Menu.Item>
                    </div>
                    <div className="py-0.5 px-0.5">
                      {onDeleteTab && (
                        <Menu.Item
                          as="button"
                          className="hover:bg-primary/20  dark:hover:bg-[#181C21] w-full px-2 py-1.5 rounded-md text-left flex gap-x-2 items-center whitespace-nowrap"
                          onClick={onDeleteTab}
                        >
                          <MinusCircleIcon className="h-4 w-4" />
                          <span>Delete tab</span>
                        </Menu.Item>
                      )}
                      <Menu.Item
                        as="button"
                        onClick={onDeleteBlock}
                        className="hover:bg-primary/20 dark:hover:bg-[#181C21] w-full px-2 py-1.5 rounded-md text-left flex gap-x-2 items-center whitespace-nowrap"
                      >
                        <XCircleIcon className="h-4 w-4" />
                        <span>Delete block</span>
                      </Menu.Item>
                    </div>
                  </div>
                </Menu.Items>
              </Transition>,
              document.body
            )}
          </>
        );
      }}
    </Menu>
  );
};

export default DragHandle;
