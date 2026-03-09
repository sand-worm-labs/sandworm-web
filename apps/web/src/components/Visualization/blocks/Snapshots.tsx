import * as dfns from "date-fns";
import React from "react";
import { ChevronDoubleRightIcon } from "@heroicons/react/24/outline";
import { Transition } from "@headlessui/react";

import { ScheduleIcon } from "@/components/Assets/ScheduleIcon";

import ScrollBar from "./ScrollBar";

interface Props {
  visible: boolean;
  onHide: () => void;
}

export function formatSnapshotDate(date: string): string {
  return dfns.format(new Date(date), "do 'of' MMMM, yyyy 'at' h:mm a");
}

export default function Snapshots(props: Props) {
  return (
    <Transition
      as="div"
      show={props.visible}
      className="h-full overflow-hidden flex-shrink-0"
      enter="transition-[width] duration-300 ease-in-out"
      enterFrom="w-0"
      enterTo="w-[354px]"
      leave="transition-[width] duration-300 ease-in-out"
      leaveFrom="w-[354px]"
      leaveTo="w-0"
    >
      <div className="w-[354px] flex flex-col border-l dark:border-border-tertiary border-border-secondary h-full bg-white dark:bg-base-100 relative">
        <button
          type="button"
          className="absolute z-10 top-7 transform rounded-full border border-gray-300 dark:border-border-tertiary text-ink-400 bg-white dark:bg-base-100 hover:bg-gray-100 w-6 h-6 flex justify-center items-center left-0 -translate-x-1/2"
          onClick={props.onHide}
        >
          <ChevronDoubleRightIcon className="w-3 h-3" />
        </button>

        <div className="flex items-center justify-between border-b dark:border-border-tertiary p-6">
          <div>
            <h3 className="text-lg font-medium leading-6 text-ink-100 dark:text-white pr-1.5">
              Snapshots
            </h3>
            <p className="text-ink-400 text-sm pt-1">
              Each Scheduled Run generates a snapshot
            </p>
          </div>
        </div>

        <ScrollBar className="overflow-auto">
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
            <div className="flex flex-col gap-y-3 bg-ceramic-50/60 p-6 rounded-xl border-2 border-[#E9ECEF] dark:border-border-tertiary border-dashed items-center max-w-[260px] text-center">
              <ScheduleIcon />
              <div className="text-ink-300 dark:text-ink-400 text-sm space-y-1">
                <p className="text-ink-100">No snapshots yet.</p>
                <p>Create snapshots manually by clicking the save button.</p>
              </div>
              <button
                type="button"
                disabled
                className="rounded-full px-4 py-2 text-sm bg-[#A308F0] hover:bg-primary-300 disabled:cursor-not-allowed disabled:opacity-50 text-white"
              >
                Save
              </button>
            </div>
          </div>
        </ScrollBar>
      </div>
    </Transition>
  );
}