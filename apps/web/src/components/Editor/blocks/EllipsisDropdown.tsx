import {
  PiBookOpen,
  PiClock,
  PiCodeBlock,
  PiGear,
  PiMapTrifold,
  PiDotsThree,
  PiTray,
  PiFolder,
  PiChatText,
  PiArrowLeft,
  PiArrowRight,
} from "react-icons/pi";
import { Menu, Transition } from "@headlessui/react";

interface MenuButtonProps {
  icon?: JSX.Element;
  text: string;
  onClick: () => void;
}

function MenuButton(props: MenuButtonProps) {
  return (
    <Menu.Item
      as="button"
      onClick={props.onClick}
      type="button"
      className="w-full flex items-center rounded-sm px-4 py-2 text-ink-400 dark:text-white text-sm gap-x-2 dark:hover:bg-dropdown-hover hover:bg-primary-tint-50"
    >
      <div className="flex justify-center w-6">{props.icon}</div>
      <span>{props.text}</span>
    </Menu.Item>
  );
}

interface Props {
  onToggleSchedules: () => void;
  onToggleSnapshots: () => void;
  onToggleComments: () => void;
  onToggleFullScreen?: () => void;
  onToggleFiles?: () => void;
  onToggleSchemaExplorer?: () => void;
  onToggleShortcuts?: () => void;
  onTogglePageSettings?: () => void;
  onToggleReusableComponents?: () => void;
  isViewer: boolean;
  isDeleted: boolean;
  isFullScreen: boolean;
}

function EllipsisDropdown(props: Props) {
  return (
    <Menu as="div" className="relative h-full w-full">
      <Menu.Button className="flex items-center rounded-none px-3 py-3.5 text-sm text-ink-400 hover:bg-gray-100 dark:bg-base-500 border-t border-b dark:border-border-tertiary h-full bg-white w-full dark:text-ink-100 focus:ring-border-primary/50 focus-visible:outline-none focus:outline-none">
        <PiDotsThree className="w-5 h-4 shrink-0" />
      </Menu.Button>
      <Transition
        as="div"
        className="absolute z-40 right-[1rem]"
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <Menu.Items
          as="div"
          className="mt-1 rounded-xl bg-white dark:bg-dropdown-bg shadow-sm border border-border-secondary dark:border-border-tertiary focus:outline-none font-body divide-y divide-border-secondary dark:divide-border-tertiary w-56  focus-visible:outline-none overflow-hidden"
        >
          {!props.isViewer && props.onToggleFiles && (
            <MenuButton
              icon={<PiFolder className="h-4 w-4" />}
              text="Files"
              onClick={props.onToggleFiles}
            />
          )}
          {!props.isViewer && !props.isDeleted && (
            <>
              <MenuButton
                icon={<PiClock className="h-4 w-4" />}
                text="Schedules"
                onClick={props.onToggleSchedules}
              />
              <MenuButton
                icon={<PiTray className="h-4 w-4" />}
                text="Snapshots"
                onClick={props.onToggleSnapshots}
              />
            </>
          )}

          <MenuButton
            icon={<PiChatText className="h-4 w-4" />}
            text="Comments"
            onClick={props.onToggleComments}
          />

          {props.onToggleSchemaExplorer && (
            <MenuButton
              icon={<PiBookOpen className="h-4 w-4" />}
              text="Schema explorer"
              onClick={props.onToggleSchemaExplorer}
            />
          )}

          {props.onToggleFullScreen && (
            <MenuButton
              icon={
                <div className="flex items-center">
                  {props.isFullScreen ? (
                    <>
                      <PiArrowRight className="h-3 w-3" />
                      <PiArrowLeft className="h-3 w-3" />
                    </>
                  ) : (
                    <>
                      <PiArrowLeft className="h-3 w-3" />
                      <PiArrowRight className="h-3 w-3" />
                    </>
                  )}
                </div>
              }
              text={
                props.isFullScreen
                  ? "Shrink horizontally"
                  : "Stretch horizontally"
              }
              onClick={props.onToggleFullScreen}
            />
          )}

          {!props.isViewer && props.onToggleReusableComponents && (
            <MenuButton
              icon={<PiCodeBlock className="h-4 w-4" />}
              text="Reusable components"
              onClick={props.onToggleReusableComponents}
            />
          )}

          {props.onToggleShortcuts && (
            <MenuButton
              icon={<PiMapTrifold className="h-4 w-4" />}
              text="Keyboard shortcuts"
              onClick={props.onToggleShortcuts}
            />
          )}

          {props.onTogglePageSettings && (
            <MenuButton
              icon={<PiGear className="h-4 w-4" />}
              text="Page settings"
              onClick={props.onTogglePageSettings}
            />
          )}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

export default EllipsisDropdown;
