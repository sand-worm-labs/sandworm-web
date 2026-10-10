import { Menu, Transition } from "@headlessui/react";
import clsx from "clsx";
import { PiCaretDown, PiCheck } from "react-icons/pi";

import type { DocumentRuntime } from "@/generated/graphql";
import {
  NOTEBOOK_TYPES,
  getNotebookType,
} from "@/components/Projects/notebookTypes";

// =====================================
// ⬢ NotebookTypeMenu
// =====================================
// Shows which type of notebook this is (Cloud, Live dashboard, Local
// analysis) and, for editors, lets them switch it.

interface Props {
  runtime: DocumentRuntime | null | undefined;
  canChange: boolean;
  onChange: (runtime: DocumentRuntime) => void;
}

const badgeClassName =
  "h-[26px] flex items-center gap-1.5 rounded-full px-2.5 text-xs font-medium font-body border border-border-secondary dark:border-border-tertiary text-ink-100 bg-base-600 whitespace-nowrap";

export default function NotebookTypeMenu(props: Props) {
  const current = getNotebookType(props.runtime);
  const { Icon } = current;

  if (!props.canChange) {
    return (
      <span className={badgeClassName} title={current.description}>
        <Icon size={14} />
        {current.title}
      </span>
    );
  }

  return (
    <Menu as="div" className="relative">
      <Menu.Button
        className={clsx(badgeClassName, "hover:bg-hover-bg")}
        title="Notebook type"
      >
        <Icon size={14} />
        {current.title}
        <PiCaretDown size={12} className="opacity-60" />
      </Menu.Button>

      <Transition
        enter="transition ease-out duration-100"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <Menu.Items className="absolute left-0 z-50 mt-2 w-80 rounded-lg bg-white dark:bg-ink-navy shadow-lg ring-1 ring-black/5 p-1 font-body focus:outline-none">
          {NOTEBOOK_TYPES.map(type => {
            const selected = type.runtime === current.runtime;
            return (
              <Menu.Item key={type.runtime}>
                {({ active }) => (
                  <button
                    type="button"
                    onClick={() => {
                      if (!selected) props.onChange(type.runtime);
                    }}
                    className={clsx(
                      "w-full flex items-start gap-2.5 rounded-md px-3 py-2 text-left",
                      active && "bg-base-200 dark:bg-white/5"
                    )}
                  >
                    <type.Icon size={16} className="mt-0.5 shrink-0" />
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium">
                        {type.title}
                      </span>
                      <span className="block text-xs text-ink-400">
                        {type.description}
                      </span>
                    </span>
                    {selected && (
                      <PiCheck size={14} className="mt-1 shrink-0" />
                    )}
                  </button>
                )}
              </Menu.Item>
            );
          })}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
