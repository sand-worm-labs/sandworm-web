import {
  BookOpenIcon,
  ClockIcon,
  CodeBracketSquareIcon,
  Cog6ToothIcon,
  MapIcon,
  EllipsisHorizontalIcon,
  InboxArrowDownIcon,
  FolderIcon,
  ChatBubbleBottomCenterTextIcon,
} from "@heroicons/react/24/outline";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/20/solid";
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
      className="w-full flex items-center rounded-sm px-4 py-2 text-gray-500 dark:text-white text-sm gap-x-2  dark:hover:bg-[#181C21] hover:bg-primary/20"
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
      <Menu.Button className="flex items-center rounded-none px-3 py-3.5 text-sm text-ink-400 hover:bg-gray-100 dark:bg-base-500 border-t border-b dark:border-border-tertiary   h-full bg-white w-full dark:text-ink-100 focus:ring-border-tertiary">
        <EllipsisHorizontalIcon className="w-5 h-4 shrink-0" />
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
          className="mt-1 rounded-xl bg-white dark:bg-black shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none font-primary divide-y divide-gray-200 dark:divide-[#262A30] w-56 border dark:border-border-tertiary "
        >
          {!props.isViewer && props.onToggleFiles && (
            <MenuButton
              icon={<FolderIcon className="h-4 w-4" />}
              text="Files"
              onClick={props.onToggleFiles}
            />
          )}
          {!props.isViewer && !props.isDeleted && (
            <>
              <MenuButton
                icon={<ClockIcon className="h-4 w-4" />}
                text="Schedules"
                onClick={props.onToggleSchedules}
              />
              <MenuButton
                icon={<InboxArrowDownIcon className="h-4 w-4" />}
                text="Snapshots"
                onClick={props.onToggleSnapshots}
              />
            </>
          )}

          <MenuButton
            icon={<ChatBubbleBottomCenterTextIcon className="h-4 w-4" />}
            text="Comments"
            onClick={props.onToggleComments}
          />

          {props.onToggleSchemaExplorer && (
            <MenuButton
              icon={<BookOpenIcon className="h-4 w-4" />}
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
                      <ArrowRightIcon className="h-3 w-3" />
                      <ArrowLeftIcon className="h-3 w-3" />
                    </>
                  ) : (
                    <>
                      <ArrowLeftIcon className="h-3 w-3" />
                      <ArrowRightIcon className="h-3 w-3" />
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
              icon={<CodeBracketSquareIcon className="h-4 w-4" />}
              text="Reusable components"
              onClick={props.onToggleReusableComponents}
            />
          )}

          {props.onToggleShortcuts && (
            <MenuButton
              icon={<MapIcon className="h-4 w-4" />}
              text="Keyboard shortcuts"
              onClick={props.onToggleShortcuts}
            />
          )}

          {props.onTogglePageSettings && (
            <MenuButton
              icon={<Cog6ToothIcon className="h-4 w-4" />}
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
