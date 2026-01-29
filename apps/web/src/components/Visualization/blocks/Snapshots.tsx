import * as dfns from "date-fns";
import React from "react";
import { ChevronDoubleRightIcon } from "@heroicons/react/24/outline";
import { Transition } from "@headlessui/react";
import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid";

import { Tooltip } from "./ToolTips";
import ScrollBar from "./ScrollBar";
import { ScheduleIcon } from "@/components/Assets/ScheduleIcon";

interface Props {
  visible: boolean;
  onHide: () => void;
}

export function formatSnapshotDate(date: string): string {
  return dfns.format(new Date(date), "do 'of' MMMM, yyyy 'at' h:mm a");
}

const DefaultSnapshotsTooltip = () => {
  return (
    <div className="scale-0 font-primary pointer-events-none absolute left-1/2 mt-1.5 -translate-x-1/2 opacity-0 transition-opacity group-hover:scale-100 group-hover:opacity-100 bg-hunter-950 text-white text-xs p-2 rounded-md flex flex-col gap-y-1 w-44">
      <div className="flex flex-col items-center justify-center text-gray-400 text-center gap-y-1">
        <span>Each scheduled run generates a snapshot.</span>
        <span>Create snapshots manually by clicking the save button.</span>
      </div>
    </div>
  );
};

export default function Snapshots(props: Props) {
  return (
    <Transition
      as="div"
      show={props.visible}
      className="top-0 right-0 h-full absolute bg-white z-30"
      enter="transition-transform duration-300"
      enterFrom="transform translate-x-full"
      enterTo="transform translate-x-0"
      leave="transition-transform duration-300"
      leaveFrom="transform translate-x-0"
      leaveTo="transform translate-x-full"
    >
      <button
        type="button"
        className="absolute z-10 top-7 transform rounded-full border border-gray-300 dark:border-[#262A30] text-gray-400 bg-white hover:bg-gray-100 w-6 h-6 flex justify-center items-center left-0 -translate-x-1/2"
        onClick={props.onHide}
      >
        <ChevronDoubleRightIcon className="w-3 h-3" />
      </button>
      <div className="w-[324px] flex flex-col border-l dark:border-[#262A30] border-gray-200 h-full bg-white dark:bg-black">
        <div className="flex items-center justify-between border-b dark:border-[#262A30] p-6">
          <div className="flex items-center">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900  dark:text-white pr-1.5">
                Snapshots
              </h3>
              <p className="text-gray-500 text-sm pt-1">
                Each Scheduled Run generates a snapshot
              </p>
            </div>

            {/*  <div className="group relative">
              <QuestionMarkCircleIcon className="w-4 h-4 text-gray-300" />

              <DefaultSnapshotsTooltip />
            </div> */}
          </div>
        </div>
        <ScrollBar className="overflow-auto">
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
            <div className="flex flex-col gap-y-3 bg-ceramic-50/60 p-6 rounded-xl border-2 border-[#E9ECEF] dark:border-[#262A30] border-dashed items-center max-w-[260px] text-center">
              <ScheduleIcon className="w-10 h-10" />

              <div className="text-ink-300 text-sm space-y-1">
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
