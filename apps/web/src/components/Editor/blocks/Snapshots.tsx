/* eslint-disable react/jsx-no-useless-fragment */
import * as dfns from "date-fns";
import React from "react";
import { PiCameraLight } from "react-icons/pi";
import { CloseIconButton } from "@/components/CloseIconButton";

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
    <>
      {props.visible && (
        <div className="w-full flex flex-col  h-full bg-white dark:bg-base-100 relative">
          <div className="flex-shrink-0 px-4 xl:px-6 pt-5 pb-3 dark:border-border-tertiary border-border-secondary border-b">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="flex items-center gap-x-1.5 text-base font-medium leading-6 dark:text-white text-ink-100">
                  <PiCameraLight size={18} className="flex-shrink-0" />
                  Snapshots
                </h3>
                <p className="text-[12.5px] text-ink-400 mt-0.5">
                  Each Scheduled Run generates a snapshot
                </p>
              </div>
              <CloseIconButton
                size="sm"
                round
                onClick={props.onHide}
                aria-label="Close snapshots"
              />
            </div>
          </div>

          <ScrollBar className="overflow-auto">
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
              <div className="flex flex-col gap-y-3 bg-ceramic-50/60 p-6 rounded-xl border-2 border-border-secondary dark:border-border-tertiary border-dashed items-center  text-center">
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
      )}
    </>
  );
}
