import { Switch, Transition } from "@headlessui/react";
import { ChevronDoubleRightIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

import useDocument from "../hooks/useDocument";

type PageSettingToggleProps = {
  name: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
};

export function PageSettingToggle(props: PageSettingToggleProps) {
  return (
    <Switch.Group
      as="div"
      className="flex flex-col items-center justify-between py-4 gap-x-16 gap-y-2 w-full px-4"
    >
      <span className="flex flex-grow items-center justify-between w-full">
        <Switch.Label
          as="span"
          className="text-sm font-medium leading-6 text-gray-900 dark:text-white"
          passive
        >
          {props.name}
        </Switch.Label>
        <Switch
          checked={props.enabled}
          onChange={props.onToggle}
          className={clsx(
            props.enabled ? "bg-primary-600" : "bg-gray-200",
            "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2"
          )}
          disabled={props.disabled}
        >
          <span
            aria-hidden="true"
            className={clsx(
              props.enabled ? "translate-x-5" : "translate-x-0",
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-black shadow ring-0 transition duration-200 ease-in-out"
            )}
          />
        </Switch>
      </span>
      <span className="text-sm text-gray-500">{props.description}</span>
    </Switch.Group>
  );
}

interface Props {
  workspaceId: string;
  documentId: string;
  visible: boolean;
  onHide: () => void;
}

export default function PageSettingsPanel(props: Props) {
  const [{ document }, api] = useDocument(props.workspaceId, props.documentId);

  return (
    <Transition
      as="div"
      show={props.visible}
      className="top-0 right-0 h-full absolute bg-white z-30 font-primary"
      enter="transition-transform duration-300"
      enterFrom="transform translate-x-full"
      enterTo="transform translate-x-0"
      leave="transition-transform duration-300"
      leaveFrom="transform translate-x-0"
      leaveTo="transform translate-x-full"
    >
      <button
        type="button"
        className="absolute z-10 top-7 transform rounded-full border border-gray-300 text-gray-400 bg-white dark:bg-black hover:bg-gray-100 w-6 h-6 flex justify-center items-center left-0 -translate-x-1/2"
        onClick={props.onHide}
      >
        <ChevronDoubleRightIcon className="w-3 h-3" />
      </button>
      <div className="w-[324px] flex flex-col border-l dark:border-[#262A30] border-gray-200 h-full bg-white font-primary dark:bg-black">
        <div className="flex justify-between border-b p-6 space-x-3">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white pr-1.5">
              Page settings
            </h3>
            <p className="text-gray-500 text-sm pt-1">
              Configure this page's behavior and default visualization mode.
            </p>
          </div>
        </div>
        <div className="w-full divide-y divide-gray-200 border-b dark:border-[#262A30] border-gray-200 border dark:divide-[#262A30]">
          <PageSettingToggle
            name="Auto-run pending blocks"
            description="Whether sandworm should automatically run unexecuted preceding blocks when a block is executed."
            enabled={document?.runUnexecutedBlocks ?? false}
            onToggle={api.toggleRunUnexecutedBlocks}
          />
          <PageSettingToggle
            name="Run selected SQL only"
            description="Whether sandworm should only run selected code when a SQL block is executed."
            enabled={document?.runSQLSelection ?? false}
            onToggle={api.toggleRunSQLSelection}
          />
          <PageSettingToggle
            name="Share links without sidebar"
            description="Whether the 'copy link' button should include a query parameter to hide the sidebar (open dashboards with the sidebar collapsed)."
            enabled={document?.shareLinksWithoutSidebar ?? false}
            onToggle={api.toggleShareLinksWithoutSidebar}
          />
        </div>
      </div>
    </Transition>
  );
}
