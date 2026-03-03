import { Transition } from "@headlessui/react";
import { useCallback, useState } from "react";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";
import cronstrue from "cronstrue";
import { ChevronDoubleRightIcon } from "@heroicons/react/24/outline";
import { ChevronRightIcon } from "lucide-react";

import { ScheduleIcon } from "@/components/Assets/ScheduleIcon";
import type {
  ExecutionSchedule,
  HourlySchedule as HourlyScheduleType,
  DailySchedule as DailyScheduleType,
  WeeklySchedule as WeeklyScheduleType,
  MonthlySchedule as MonthlyScheduleType,
  CronSchedule as CronScheduleType,
} from "@/types";
import { Trash } from "@/components/Assets/Trash";

import { useSchedules } from "../../hooks/useSchedules";
import { PortalTooltip, Tooltip } from "../ToolTips";
import ScrollBar from "../ScrollBar";

import AddScheduleForm from "./AddScheduleForm";

// Helper to parse string "0,1,2" or array [0,1,2] into number array
const parseNumberList = (
  value: string | number[] | null | undefined
): number[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    return value
      .split(",")
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n));
  }
  return [];
};

interface Props {
  workspaceId: string;
  documentId: string;
  isPublished: boolean;
  visible: boolean;
  onHide: () => void;
  onPublish: () => void;
  publishing: boolean;
}

const getPrettyTz = (tz: string) => tz.replace(/_/g, " ");

const HourlySchedule = ({ schedule }: { schedule: HourlyScheduleType }) => {
  const { minute, timezone } = schedule;
  const minuteStr = `${minute}`.padStart(2, "0");

  return (
    <div>
      <div className="font-medium">Hourly at minute {minuteStr}</div>
      <div className="pt-0.5 flex flex-col text-ink-300 gap-y-0.5">
        <span>{getPrettyTz(timezone)}</span>
      </div>
    </div>
  );
};

const DailySchedule = ({ schedule }: { schedule: DailyScheduleType }) => {
  const { hour, minute, timezone } = schedule;
  const hour12 = hour % 12 || 12;
  const amPm = hour < 12 ? "AM" : "PM";
  const minuteStr = `${minute}`.padStart(2, "0");

  return (
    <div>
      <div className="font-medium">
        Daily at {hour12}:{minuteStr} {amPm}
      </div>
      <div className="pt-0.5 flex flex-col text-ink-300 gap-y-0.5">
        <span>{getPrettyTz(timezone)}</span>
      </div>
    </div>
  );
};

const WeeklySchedule = ({ schedule }: { schedule: WeeklyScheduleType }) => {
  const { hour, minute, timezone, weekdays: weekdaysRaw } = schedule;
  const hour12 = hour % 12 || 12;
  const amPm = hour < 12 ? "AM" : "PM";
  const minuteStr = `${minute}`.padStart(2, "0");

  const weekdays = parseNumberList(weekdaysRaw);

  const prettyWeekDays = weekdays.map(day => {
    switch (day) {
      case 0:
        return "Sunday";
      case 1:
        return "Monday";
      case 2:
        return "Tuesday";
      case 3:
        return "Wednesday";
      case 4:
        return "Thursday";
      case 5:
        return "Friday";
      case 6:
        return "Saturday";
      default:
        return "Unknown";
    }
  });

  return (
    <div>
      <div className="font-medium">
        Weekly on {prettyWeekDays.join(", ")} at {hour12}:{minuteStr} {amPm}
      </div>
      <div className="pt-0.5 flex flex-col text-ink-300 gap-y-0.5">
        <span>{getPrettyTz(timezone)}</span>
      </div>
    </div>
  );
};

const MonthlySchedule = ({ schedule }: { schedule: MonthlyScheduleType }) => {
  const { hour, minute, timezone, days: daysRaw } = schedule;
  const hour12 = hour % 12 || 12;
  const amPm = hour < 12 ? "AM" : "PM";
  const minuteStr = `${minute}`.padStart(2, "0");

  const days = parseNumberList(daysRaw);

  const prettyDays = days.map(dIndex => {
    const d = dIndex + 1;
    const s = ["th", "st", "nd", "rd"];
    const v = d % 100;
    return d + (s[(v - 20) % 10] || s[v] || s[0]);
  });

  return (
    <div>
      <div className="font-medium">
        Monthly on the {prettyDays.join(", ")} at {hour12}:{minuteStr} {amPm}
      </div>
      <div className="pt-0.5 flex flex-col text-gray-400 gap-y-0.5">
        <span>{getPrettyTz(timezone)}</span>
      </div>
    </div>
  );
};

const CronSchedule = ({ schedule }: { schedule: CronScheduleType }) => {
  const { cron, timezone } = schedule;
  const tooltipText = cronstrue.toString(cron, {
    locale: "en",
    verbose: true,
  });

  return (
    <div>
      <div className="font-medium pb-2 flex items-center gap-x-2">
        <span className="">Cron: </span>
        <span className="rounded-sm px-2 py-1 font-mono bg-gray-100 border border-gray-200 dark:border-[#262A30]">
          {cron}
        </span>
        <span className="group relative">
          <PortalTooltip
            ignoreScrollableAncestor
            content={
              <div className="pointer-events-none w-[124px] bg-hunter-950 text-gray-400 text-xs p-2 rounded-md flex flex-col gap-y-1 -translate-x-1/2 translate-y-[2px]">
                {tooltipText}
              </div>
            }
          >
            <QuestionMarkCircleIcon className="w-4 h-4 inline-block text-gray-300" />
          </PortalTooltip>
        </span>
      </div>
      <div className="pt-0.5 flex flex-col text-gray-400 gap-y-0.5">
        <span>{getPrettyTz(timezone)}</span>
      </div>
    </div>
  );
};

const getScheduleBlock = (schedule: ExecutionSchedule) => {
  switch (schedule.type) {
    case "HOURLY":
      return <HourlySchedule schedule={schedule} />;
    case "DAILY":
      return <DailySchedule schedule={schedule} />;
    case "WEEKLY":
      return <WeeklySchedule schedule={schedule} />;
    case "MONTHLY":
      return <MonthlySchedule schedule={schedule} />;
    case "CRON":
      return <CronSchedule schedule={schedule} />;
    default:
      return null;
  }
};

interface ScheduleListProps {
  schedules: ExecutionSchedule[];
  isLimited: boolean;
  isPublished: boolean;
  onAddSchedule: () => void;
  onDeleteSchedule: (id: string) => () => void;
  onPublish: () => void;
  publishing: boolean;
}
function ScheduleList(props: ScheduleListProps) {
  return (
    <div className="w-[354px] h-full flex flex-col overflow-y-auto border-l border-gray-200 dark:border-border-tertiary font-body dark:bg-base-100">
      <div className="px-4 xl:px-6 pt-6 pb-5">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
              Schedule
            </h3>

            <p className="text-ink-300 dark:text-ink-400 text-sm pt-1">
              Schedule your notebook to run automatically
            </p>
          </div>
          <ChevronRightIcon className="h-5 w-5 text-ink-400" />
        </div>
      </div>

      <div className="border-t border-dashed border-gray-200 dark:border-border-tertiary" />

      {props.isPublished ? (
        <div className="flex-1 flex flex-col">
          {props.schedules.length > 0 ? (
            <>
              {/* Schedule List */}
              <ScrollBar className="overflow-auto flex-1 space-y-6 pb-6 pt-4 px-2 xl:px-4 ">
                <ul className="text-xs font-primary overflow-visible">
                  {props.schedules.map((scheduledRun, i) => {
                    return (
                      <li
                        key={scheduledRun.id}
                        className={clsx(
                          {
                            "": i === props.schedules.length - 1,
                          },
                          "flex  border-border bg-base-500 border rounded-xl  p-3"
                        )}
                      >
                        <div className="flex flex-1 items-center justify-between">
                          <div className="w-3/4">
                            {getScheduleBlock(scheduledRun)}
                          </div>
                          <div className="w-1/4 flex items-center justify-end">
                            <button
                              type="button"
                              className="p-1 hover:cursor-pointer  text-ink-400 hover:text-red-600  rounded-sm"
                              onClick={props.onDeleteSchedule(scheduledRun.id)}
                            >
                              <Trash />
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </ScrollBar>

              <div className="px-4 xl:px-6 py-6 flex justify-center">
                <Tooltip
                  title={props.isLimited ? "You've hit the free limit" : ""}
                  message={
                    props.isLimited
                      ? "Upgrade to the professional plan to schedule more runs."
                      : ""
                  }
                  className="flex"
                  tooltipClassname="-bottom-1 right-0 translate-y-full translate-x-0 w-48"
                  position="manual"
                  active={props.isLimited}
                >
                  <button
                    type="button"
                    className={clsx(
                      "flex items-center justify-center gap-x-2 text-sm px-4 py-2 rounded-full",
                      !props.isLimited
                        ? "bg-[#A308F0] hover:bg-primary-300 text-white"
                        : "bg-[#868E96] cursor-not-allowed text-white"
                    )}
                    onClick={props.onAddSchedule}
                    disabled={props.isLimited}
                  >
                    <span>Add Schedule</span>
                  </button>
                </Tooltip>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center px-4 xl:px-6 py-12">
              <div className="flex flex-col items-center gap-y-4">
                <ScheduleIcon />
                <Tooltip
                  title={props.isLimited ? "You've hit the free limit" : ""}
                  message={
                    props.isLimited
                      ? "Upgrade to the professional plan to schedule more runs."
                      : ""
                  }
                  className="flex"
                  tooltipClassname="-bottom-1 right-0 translate-y-full translate-x-0 w-48"
                  position="manual"
                  active={props.isLimited}
                >
                  <button
                    type="button"
                    className={clsx(
                      "flex items-center justify-center gap-x-2 text-sm px-4 py-2 rounded-full",
                      !props.isLimited
                        ? "bg-[#A308F0] hover:bg-primary-300 text-white"
                        : "bg-[#868E96] cursor-not-allowed text-white"
                    )}
                    onClick={props.onAddSchedule}
                    disabled={props.isLimited}
                  >
                    <span>Add Schedule</span>
                  </button>
                </Tooltip>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center px-4 xl:px-6 py-12">
          <div className="flex flex-col gap-y-3 bg-ceramic-50/60 p-6 rounded-xl border-2 border-[#E9ECEF] dark:border-[#262A30] border-dashed items-center max-w-[260px]">
            <ScheduleIcon className="w-10 h-10" />
            <div className="text-ink-300 dark:text-ink-400 text-center text-sm">
              <p>{`You haven't saved this page yet.`}</p>
              <p>Save it to be able to create a schedule.</p>
            </div>
            <button
              type="button"
              className="rounded-full px-4 py-2 text-sm bg-[#A308F0] hover:bg-primary-300 disabled:cursor-not-allowed disabled:opacity-50 text-white"
              onClick={props.onPublish}
              disabled={props.publishing}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Schedules(props: Props) {
  const { schedules, loading, error, api } = useSchedules(
    props.workspaceId,
    props.documentId
  );

  const { createSchedule, deleteSchedule } = api;

  const [showAddForm, setShowAddForm] = useState(false);

  const onAddSchedule = useCallback(() => {
    setShowAddForm(true);
  }, [setShowAddForm]);

  const onCloseAddForm = useCallback(() => {
    setShowAddForm(false);
  }, [setShowAddForm]);

  const onDeleteSchedule = useCallback(
    (id: string) => {
      return () => deleteSchedule(id);
    },
    [deleteSchedule]
  );

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
        className="absolute z-10 top-7 transform rounded-full border border-gray-300 text-gray-400 dark:border-[#262A30] bg-white hover:bg-gray-100 w-6 h-6 flex justify-center items-center left-0 -translate-x-1/2"
        onClick={props.onHide}
      >
        <ChevronDoubleRightIcon className="w-3 h-3" />
      </button>
      {showAddForm ? (
        <AddScheduleForm
          documentId={props.documentId}
          onClose={onCloseAddForm}
          onSubmit={createSchedule}
        />
      ) : (
        <ScheduleList
          schedules={schedules}
          isLimited={false}
          isPublished={props.isPublished}
          onAddSchedule={onAddSchedule}
          onDeleteSchedule={onDeleteSchedule}
          onPublish={props.onPublish}
          publishing={props.publishing}
        />
      )}
    </Transition>
  );
}
