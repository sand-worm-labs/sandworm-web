import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import clsx from "clsx";

import { DocumentRuntime } from "@/generated/graphql";

import { NOTEBOOK_TYPES } from "./notebookTypes";

// =====================================
// ⬢ NewNotebookDialog
// =====================================
interface Props {
  visible: boolean;
  onHide: () => void;
  onCreate: (runtime: DocumentRuntime) => Promise<void>;
}

export default function NewNotebookDialog(props: Props) {
  const [runtime, setRuntime] = useState(DocumentRuntime.Cloud);
  const [creating, setCreating] = useState(false);
  const { onCreate, onHide } = props;

  const onSubmit = useCallback(async () => {
    setCreating(true);
    try {
      await onCreate(runtime);
      onHide();
    } finally {
      setCreating(false);
    }
  }, [onCreate, onHide, runtime]);

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
          <div className="fixed inset-0 bg-black/50" />
        </TransitionChild>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl dark:bg-ink-navy font-body">
              <DialogTitle className="text-lg font-semibold">
                New notebook
              </DialogTitle>
              <p className="mt-1 text-sm text-ink-500 dark:text-ink-300">
                Choose where it runs. You can change it later from the notebook's top bar.
              </p>

              <div
                role="radiogroup"
                aria-label="Where this notebook runs"
                className="mt-5 grid gap-3 sm:grid-cols-3"
              >
                {NOTEBOOK_TYPES.map(({ runtime: value, title, description, bestFor, Icon }) => {
                  const selected = runtime === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setRuntime(value)}
                      className={clsx(
                        "flex flex-col gap-2 rounded-lg border p-4 text-left transition-colors",
                        selected
                          ? "border-primary bg-primary-50 dark:bg-white/5"
                          : "border-border hover:border-ink-300 dark:border-border-dark"
                      )}
                    >
                      <span className="flex items-center gap-2 text-sm font-semibold">
                        <Icon size={18} />
                        {title}
                      </span>
                      <span className="text-xs text-ink-500 dark:text-ink-300">
                        {description}
                      </span>
                      <span className="mt-auto text-xs font-medium text-ink-400">
                        {bestFor}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-end gap-x-3">
                <button
                  type="button"
                  className="rounded-md px-3 py-1.5 text-sm hover:bg-black/5 dark:hover:bg-white/10"
                  onClick={props.onHide}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={creating}
                  onClick={onSubmit}
                  className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
                >
                  {creating ? "Creating…" : "Create notebook"}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}

// =====================================
// ⬢ useNewNotebookDialog
// =====================================
// `open(parentId)` asks where the notebook runs, then calls `create`.
export function useNewNotebookDialog(
  create: (parentId: string | null, runtime: DocumentRuntime) => Promise<void>
): [(parentId: string | null) => void, ReactNode] {
  // undefined while closed; null is a top-level notebook.
  const [parentId, setParentId] = useState<string | null | undefined>();

  const onHide = useCallback(() => setParentId(undefined), []);
  const onCreate = useCallback(
    (runtime: DocumentRuntime) => create(parentId ?? null, runtime),
    [create, parentId]
  );

  const dialog = (
    <NewNotebookDialog
      visible={parentId !== undefined}
      onHide={onHide}
      onCreate={onCreate}
    />
  );
  return [setParentId, dialog];
}
