import type * as Y from "yjs";
import { useCallback, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import * as R from "ramda";
import type { RemoveBlockDashboardConflictResult } from "@sandworm/editor";
import { removeBlock } from "@sandworm/editor";

import { Cautious } from "@/components/Assets/Cautious";

interface Props {
  yDoc: Y.Doc;
  state: RemoveBlockDashboardConflictResult | null;
  onClose: () => void;
}

export function RemoveTabDashboardConflictDialog(props: Props) {
  const [state, setState] = useState(props.state);
  useEffect(() => {
    if (props.state && !R.equals(state, props.state)) {
      setState(props.state);
    }
  }, [props.state]);

  const onConfirm = useCallback(() => {
    if (!state) {
      return;
    }

    removeBlock(props.yDoc, state.blockGroupId, state.tabId, true);
    props.onClose();
  }, [props.yDoc, state, props.onClose]);

  return (
    <Transition show={props.state !== null}>
      <Dialog onClose={props.onClose} className="relative z-[100]">
        <Transition.Child
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/[10.2%] transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as="div"
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-base-100 px-4 pb-4 pt-5 text-left transition-all w-[532px] font-body">
                <div>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                    <Cautious />
                  </div>
                  <div className="mt-1 text-center sm:mt-1 mb-5">
                    <Dialog.Title
                      as="h3"
                      className="text-base font-semibold leading-6 text-ink-100"
                    >
                      Remove tab from dashboard?
                    </Dialog.Title>
                    <div className="mt-2 flex flex-col items-center gap-y-2">
                      <p className="text-sm text-ink-100 font-medium">
                        This tab is in your dashboard. Removing it from the
                        notebook will remove it from the dashboard too.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3 px-5">
                  <button
                    type="button"
                    onClick={onConfirm}
                    className="inline-flex w-full justify-center rounded-xl bg-primary px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:col-start-2"
                  >
                    Continue
                  </button>
                  <button
                    type="button"
                    data-autofocus
                    onClick={props.onClose}
                    className="mt-3 inline-flex w-full justify-center rounded-xl bg-inputBg px-3 py-2 text-sm font-medium text-ink-100 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0 dark:text-black"
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default RemoveTabDashboardConflictDialog;
