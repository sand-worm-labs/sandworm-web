import { Menu, Transition } from "@headlessui/react";
import { PiCode, PiEye, PiMonitor } from "react-icons/pi";
import { BookUpIcon } from "lucide-react";
import { useRef } from "react";
import { createPortal } from "react-dom";

import { computeMenuPosition } from "@/lib/dom";

import { TooltipV2 } from "./ToolTips";

interface Props {
  isBlockHiddenInPublished: boolean;
  onToggleIsBlockHiddenInPublished: () => void;
  isCodeHidden: boolean;
  onToggleIsCodeHidden?: () => void;
  isOutputHidden: boolean;
  onToggleIsOutputHidden?: () => void;
  hasMultipleTabs?: boolean;
}
function HiddenInPublishedButton(props: Props) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  console.log(props.hasMultipleTabs);
  return (
    <Menu as="div" className="inline-block">
      {({ open }) => {
        const menuPosition = computeMenuPosition(
          buttonRef,
          containerRef,
          "left",
          6
        );
        return (
          <>
            <TooltipV2<HTMLButtonElement>
              message="Hide, collapse, or expand parts of this block."
              referenceRef={buttonRef}
              active={!open}
            >
              {ref => (
                <Menu.Button
                  ref={ref}
                  className="bg-[#FEFEFF] rounded-[5px] border border-[#E6E0F1] dark:border-border-tertiary h-[24px] min-w-[24px] flex items-center justify-center relative group hover:bg-gray-50"
                >
                  <PiEye className="w-[13px] h-[13px] text-[#1C3B5A] group-hover:text-ink-400 " />
                </Menu.Button>
              )}
            </TooltipV2>
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
                style={menuPosition}
                show={open}
              >
                <Menu.Items
                  as="div"
                  ref={containerRef}
                  className="absolute z-30 rounded-lg bg-base-100 shadow-[0_4px_12px_#CFCFCF] ring-1 ring-border-tertiary focus:outline-none font-body  divide-y divide-border-secondary flex flex-col text-xs text-ink-400"
                >
                  <div className="flex flex-col divide-y divide-border-secondary">
                    <div className="py-0.5 px-0.5">
                      <Menu.Item
                        as="button"
                        onClick={props.onToggleIsBlockHiddenInPublished}
                        className="hover:bg-primary/20 w-full px-2 py-1.5 rounded-md text-left flex gap-x-2 items-center whitespace-nowrap"
                      >
                        <BookUpIcon className="w-4 h-4 " />
                        <span>
                          {props.isBlockHiddenInPublished ? "Show" : "Hide"} in
                          view mode
                        </span>
                      </Menu.Item>
                    </div>
                    {(props.onToggleIsCodeHidden ||
                      props.onToggleIsOutputHidden) && (
                      <div className="py-0.5 px-0.5">
                        {props.onToggleIsCodeHidden && (
                          <Menu.Item
                            as="button"
                            onClick={props.onToggleIsCodeHidden}
                            className="hover:bg-primary/20 w-full px-2 py-1.5 rounded-md text-left flex gap-x-2 items-center whitespace-nowrap"
                          >
                            <PiCode className="h-4 w-4" />
                            <span>
                              {props.isCodeHidden ? "Show" : "Hide"} code
                            </span>
                          </Menu.Item>
                        )}
                        {props.onToggleIsOutputHidden && (
                          <Menu.Item
                            as="button"
                            onClick={props.onToggleIsOutputHidden}
                            className="hover:bg-primary/20 w-full px-2 py-1.5 rounded-md text-left flex gap-x-2 items-center whitespace-nowrap"
                          >
                            <PiMonitor className="h-4 w-4" />
                            <span>
                              {props.isOutputHidden ? "Show" : "Hide"} output
                            </span>
                          </Menu.Item>
                        )}
                      </div>
                    )}
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
}

export default HiddenInPublishedButton;
