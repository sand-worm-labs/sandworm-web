import {
  DialogPanel,
  DialogTitle,
  Dialog,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import clsx from "clsx";
import { Fragment } from "react";

import { ScheduleIcon } from "@/components/Assets/ScheduleIcon";

type ShortcutsModalProps = {
  visible: boolean;
  onHide: () => void;
};

const shortcuts: {
  keys: string[];
  action: string;
  mode: "insert" | "command";
}[] = [
  {
    keys: ["Escape"],
    action: "Unfocus block and enter command mode",
    mode: "insert",
  },
  {
    keys: ["Enter"],
    action: "Focus on block and enter insert mode",
    mode: "command",
  },
  {
    keys: ["h", "←"],
    action: "Move cursor left (select left tab)",
    mode: "command",
  },
  { keys: ["j", "↓"], action: "Move cursor down", mode: "command" },
  { keys: ["k", "↑"], action: "Move cursor up", mode: "command" },
  {
    keys: ["l", "→"],
    action: "Move cursor right (select right tab)",
    mode: "command",
  },
  { keys: ["ap"], action: "Add Python block above", mode: "command" },
  { keys: ["aq"], action: "Add Query block above", mode: "command" },
  { keys: ["am"], action: "Add Markdown/Text block above", mode: "command" },
  { keys: ["bp"], action: "Add Python block below", mode: "command" },
  { keys: ["bq"], action: "Add Query block below", mode: "command" },
  { keys: ["bm"], action: "Add Markdown/Text block below", mode: "command" },
  { keys: ["dd"], action: "Delete block", mode: "command" },
  { keys: ["⌘ + Enter"], action: "Run block", mode: "insert" },
  { keys: ["⌘ + e"], action: 'Toggle "Edit with AI"', mode: "insert" },
  {
    keys: ["Shift + Enter"],
    action: "Run block and focus on next block",
    mode: "insert",
  },
  {
    keys: ["Alt + Enter"],
    action: "Run block and insert new block below",
    mode: "insert",
  },
];

const KeyboardKey = (props: {
  children: string;
  mode: "insert" | "command";
}) => (
  <span
    className={clsx(
      "px-1.5 py-0.5 rounded-md font-tertiary text-[0.85rem] ",
      props.mode === "insert"
        ? "bg-[#F1E6F7] text-primary dark:bg-primary/10 dark:text-primary-300"
        : "bg-[#F7F6E6] text-ink-navy dark:bg-warning/10 dark:text-warning"
    )}
  >
    {props.children}
  </span>
);

export default function ShortcutsModal(props: ShortcutsModalProps) {
  return (
    <Transition show={props.visible}>
      <Dialog onClose={props.onHide} className="relative z-[1000]">
        <TransitionChild
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[#161633] dark:bg-black/[12.5%] bg-opacity-20 transition-opacity font-body" />
        </TransitionChild>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto font-body ">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <TransitionChild
              as="div"
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel className="relative transform overflow-y-auto rounded-2xl bg-white dark:bg-page-surface  dark:border-border-tertiary dark:border text-left  transition-all sm:my-8 px-8 py-6 w-[600px] max-h-[90vh] shadow-xl">
                <div>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/[12.5%]">
                    <ScheduleIcon />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <DialogTitle
                      as="h3"
                      className="text-sm font-bold font-body leading-6 text-ink-100"
                    >
                      Keyboard shortcuts
                    </DialogTitle>

                    <div className="mt-2 flex flex-col gap-y-2">
                      <p className="text-sm text-ink-400 font-body">
                        When in insert mode, blocks will be highlighted in{" "}
                        <span className="text-accent font-semibold">
                          purple
                        </span>
                        . When in command mode, blocks will be highlighted in{" "}
                        <span className="text-primary font-semibold">
                          orange
                        </span>
                        . Shortcuts here are highlighted accordingly.
                      </p>
                    </div>
                    <div className="mt-6 mb-8 text-sm flex flex-col gap-y-2 ">
                      {shortcuts.map(shortcut => (
                        <div key={shortcut.action} className="flex gap-x-4 ">
                          <div className="flex items-center justify-end w-1/3 gap-x-2 whitespace-nowrap">
                            {shortcut.keys.map((key, i) => (
                              <Fragment key={key}>
                                <KeyboardKey mode={shortcut.mode}>
                                  {key}
                                </KeyboardKey>
                                {i < shortcut.keys.length - 1 && (
                                  <span className="text-ink-300">or</span>
                                )}
                              </Fragment>
                            ))}
                          </div>
                          <div className="text-ink-400 whitespace-nowrap font-bold font-body ">
                            {shortcut.action}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    data-autofocus
                    onClick={props.onHide}
                    className="rounded-xl  px-3 py-2 text-sm font-medium text-white bg-base-400 dark:bg-base-700 dark:hover:bg-base-600 dark:text-white mt-0 w-1/3"
                  >
                    Close
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
