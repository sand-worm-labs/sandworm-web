/* eslint-disable react/jsx-no-useless-fragment */
import { useCallback, useState } from "react";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";
import cronstrue from "cronstrue";
import { PiTimerLight } from "react-icons/pi";

import { CloseIconButton } from "@/components/CloseIconButton";
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
      .filter(n => !Number.isNaN(n));
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
    return d + (s[(v - 20) % 10] ?? s[v] ?? s[0] ?? "th");
  });

  return (
    <div>
      <div className="font-medium">
        Monthly on the {prettyDays.join(", ")} at {hour12}:{minuteStr} {amPm}
      </div>
      <div className="pt-0.5 flex flex-col text-ink-400 gap-y-0.5">
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
        <span className="rounded-sm px-2 py-1 font-mono bg-gray-100 border border-border-secondary dark:border-border-tertiary">
          {cron}
        </span>
        <span className="group relative">
          <PortalTooltip
            ignoreScrollableAncestor
            content={
              <div className="pointer-events-none w-[124px] bg-hunter-950 text-ink-400 text-xs p-2 rounded-md flex flex-col gap-y-1 -translate-x-1/2 translate-y-[2px]">
                {tooltipText}
              </div>
            }
          >
            <QuestionMarkCircleIcon className="w-4 h-4 inline-block text-gray-300" />
          </PortalTooltip>
        </span>
      </div>
      <div className="pt-0.5 flex flex-col text-ink-400 gap-y-0.5">
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
  onHide: () => void;
}
function ScheduleList(props: ScheduleListProps) {
  return (
    <div className="relative w-full h-full flex flex-col overflow-y-auto font-body dark:bg-base-100 ">
      <div className="flex-shrink-0 px-4 xl:px-6 pt-5 pb-3 dark:border-border-tertiary border-border-secondary border-b">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="flex items-center gap-x-1.5 text-base font-medium leading-6 dark:text-white text-ink-100">
              <PiTimerLight size={18} className="flex-shrink-0" />
              Schedule
            </h3>
            <p className="text-[12.5px] text-ink-400 mt-0.5">
              Schedule your notebook to run automatically
            </p>
          </div>
          <CloseIconButton
            size="sm"
            round
            onClick={props.onHide}
            aria-label="Close schedules"
          />
        </div>
      </div>

      {props.isPublished ? (
        <div className="flex-1 flex flex-col">
          {props.schedules.length > 0 ? (
            <>
              {/* Schedule List */}
              <ScrollBar className="overflow-auto flex-1 space-y-6 pb-6 pt-4 px-2 xl:px-4 ">
                <ul className="text-xs font-body  overflow-visible">
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
                              className="p-1 hover:cursor-pointer  text-ink-400 hover:text-error rounded-sm"
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
                        ? "bg-primary hover:bg-primary-300 text-white"
                        : "bg-disabled cursor-not-allowed text-white"
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
                        ? "bg-primary hover:bg-primary-300 text-white"
                        : "bg-disabled cursor-not-allowed text-white"
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
          <div className="flex flex-col gap-y-3 bg-ceramic-50/60 p-6 rounded-xl border-2 border-border-secondary  dark:border-border-tertiary border-dashed items-center max-w-[260px]">
            <ScheduleIcon />
            <div className="text-ink-300 dark:text-ink-400 text-center text-sm">
              <p>{`You haven't saved this page yet.`}</p>
              <p>Save it to be able to create a schedule.</p>
            </div>
            <button
              type="button"
              className="rounded-full px-4 py-2 text-sm bg-primary hover:bg-primary-300 disabled:cursor-not-allowed disabled:opacity-50 text-white"
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
  const { schedules, api } = useSchedules(props.workspaceId, props.documentId);

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
    <>
      {props.visible &&
        (showAddForm ? (
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
            onHide={props.onHide}
          />
        ))}
    </>
  );
}
